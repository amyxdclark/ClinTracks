import { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import type { SiteCapacity, ScheduleRequest } from '../types';
import { Calendar, MapPin, Users, Plus, Check, X, AlertTriangle, Clock } from 'lucide-react';

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return styles[status] ?? 'bg-gray-100 text-gray-800';
};

const capacityColor = (approved: number, total: number) => {
  if (total === 0) return 'bg-gray-200 text-gray-600';
  const pct = (approved / total) * 100;
  if (pct > 80) return 'bg-red-100 text-red-800 border-red-300';
  if (pct >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-green-100 text-green-800 border-green-300';
};

const Scheduling = () => {
  const { state, updateState, addAuditEvent } = useApp();
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [capSiteId, setCapSiteId] = useState('');
  const [capDate, setCapDate] = useState('');
  const [capCount, setCapCount] = useState(1);
  const [capNotes, setCapNotes] = useState('');
  const [reqSiteId, setReqSiteId] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqNotes, setReqNotes] = useState('');

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  const isCoordinator = currentUser?.role === 'Coordinator' || currentUser?.role === 'ProgramAdmin';

  const today = new Date().toISOString().slice(0, 10);

  // Upcoming capacities sorted by date
  const upcomingCapacities = useMemo(
    () => [...state.capacities].filter(c => c.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [state.capacities, today],
  );

  // Group capacities by date
  const dateGroups = useMemo(() => {
    const map = new Map<string, SiteCapacity[]>();
    for (const cap of upcomingCapacities) {
      const list = map.get(cap.date) ?? [];
      list.push(cap);
      map.set(cap.date, list);
    }
    return map;
  }, [upcomingCapacities]);

  const approvedCountFor = (siteId: string, date: string) =>
    state.scheduleRequests.filter(r => r.siteId === siteId && r.date === date && r.status === 'approved').length;

  const myRequests = useMemo(
    () => isStudent
      ? [...state.scheduleRequests].filter(r => r.studentId === state.activeProfileId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : [...state.scheduleRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [isStudent, state.scheduleRequests, state.activeProfileId],
  );

  const resetCapForm = () => { setCapSiteId(''); setCapDate(''); setCapCount(1); setCapNotes(''); };
  const resetReqForm = () => { setReqSiteId(''); setReqDate(''); setReqNotes(''); };

  const handleAddCapacity = () => {
    if (!capSiteId || !capDate || capCount < 1) { alert('Please fill all required fields'); return; }
    const newCap: SiteCapacity = {
      id: `cap-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      siteId: capSiteId,
      date: capDate,
      capacityCount: capCount,
      notes: capNotes || undefined,
    };
    updateState(prev => ({ ...prev, capacities: [...prev.capacities, newCap] }));
    addAuditEvent('add_capacity', 'siteCapacity', newCap.id);
    setShowCapacityModal(false);
    resetCapForm();
  };

  const handleRequestSlot = () => {
    if (!reqSiteId || !reqDate) { alert('Please select a site and date'); return; }
    const cap = state.capacities.find(c => c.siteId === reqSiteId && c.date === reqDate);
    if (cap) {
      const approvedCnt = approvedCountFor(reqSiteId, reqDate);
      if (approvedCnt >= cap.capacityCount) {
        alert('Warning: This date/site is already at full capacity. Your request will still be submitted.');
      }
    }
    const newReq: ScheduleRequest = {
      id: `sr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      studentId: state.activeProfileId,
      siteId: reqSiteId,
      date: reqDate,
      status: 'requested',
      notes: reqNotes || undefined,
      createdAt: new Date().toISOString(),
    };
    updateState(prev => ({ ...prev, scheduleRequests: [...prev.scheduleRequests, newReq] }));
    addAuditEvent('request_slot', 'scheduleRequest', newReq.id);
    setShowRequestModal(false);
    resetReqForm();
  };

  const handleDecision = (id: string, decision: 'approved' | 'rejected') => {
    const req = state.scheduleRequests.find(r => r.id === id);
    if (decision === 'approved' && req) {
      const cap = state.capacities.find(c => c.siteId === req.siteId && c.date === req.date);
      if (cap && approvedCountFor(req.siteId, req.date) >= cap.capacityCount) {
        if (!confirm('This will exceed the site capacity for this date. Approve anyway?')) return;
      }
    }
    updateState(prev => ({
      ...prev,
      scheduleRequests: prev.scheduleRequests.map(r => r.id === id ? { ...r, status: decision } : r),
    }));
    addAuditEvent(`schedule_${decision}`, 'scheduleRequest', id);
  };

  const siteName = (id: string) => state.sites.find(s => s.id === id)?.name ?? id;
  const studentName = (id: string) => state.profiles.find(p => p.id === id)?.name ?? id;

  // Available dates for student request dropdown
  const availableDatesForSite = (siteId: string) =>
    upcomingCapacities.filter(c => c.siteId === siteId);

  // Stats
  const totalSlots = upcomingCapacities.reduce((s, c) => s + c.capacityCount, 0);
  const pendingRequests = state.scheduleRequests.filter(r => r.status === 'requested').length;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-500" /> Scheduling
          </h1>
          <p className="text-gray-600 mt-1">
            {isCoordinator ? 'Manage site capacity and approve student requests' : 'View site availability and request shifts'}
          </p>
        </div>
        <div className="flex gap-2">
          {isCoordinator && (
            <button
              onClick={() => setShowCapacityModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-colors text-base"
            >
              <Plus className="w-5 h-5" /> Add Capacity
            </button>
          )}
          {isStudent && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-colors text-base"
            >
              <Plus className="w-5 h-5" /> Request Slot
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Sites</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">{state.sites.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Users className="w-4 h-4" />
            <span className="text-sm">Upcoming Slots</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">{totalSlots}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending Requests</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">{pendingRequests}</p>
        </div>
      </div>

      {/* Upcoming Dates with Capacity */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-500" /> Upcoming Site Capacity
      </h2>
      <div className="space-y-4 mb-8">
        {dateGroups.size === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No upcoming capacity entries</p>
            {isCoordinator && (
              <button onClick={() => setShowCapacityModal(true)} className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                <Plus className="w-5 h-5" /> Add Capacity
              </button>
            )}
          </div>
        ) : (
          Array.from(dateGroups.entries()).map(([date, caps]) => (
            <div key={date} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 border-b flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-800">{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="divide-y">
                {caps.map(cap => {
                  const approved = approvedCountFor(cap.siteId, cap.date);
                  return (
                    <div key={cap.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-500" /> {siteName(cap.siteId)}
                        </h4>
                        {cap.notes && <p className="text-sm text-gray-500 mt-0.5">{cap.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${capacityColor(approved, cap.capacityCount)}`}>
                          {approved} / {cap.capacityCount} filled
                        </span>
                        {approved >= cap.capacityCount && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Requests */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary-500" /> {isStudent ? 'My Requests' : 'Schedule Requests'}
      </h2>
      <div className="space-y-4">
        {myRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No schedule requests yet</p>
          </div>
        ) : (
          myRequests.map(req => (
            <div key={req.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  {!isStudent && (
                    <p className="text-sm text-gray-500 mb-1">Student: {studentName(req.studentId)}</p>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" /> {siteName(req.siteId)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(req.date + 'T00:00:00').toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge(req.status)}`}>
                  {req.status.toUpperCase()}
                </span>
              </div>
              {req.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700">{req.notes}</p>
                </div>
              )}
              {isCoordinator && req.status === 'requested' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDecision(req.id, 'approved')}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision(req.id, 'rejected')}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Capacity Modal */}
      {showCapacityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Site Capacity
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select value={capSiteId} onChange={e => setCapSiteId(e.target.value)} className={inputClass}>
                  <option value="">Select a site…</option>
                  {state.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={capDate} onChange={e => setCapDate(e.target.value)} min={today} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Count *</label>
                <input type="number" min={1} value={capCount} onChange={e => setCapCount(Math.max(1, parseInt(e.target.value) || 1))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={capNotes} onChange={e => setCapNotes(e.target.value)} className={inputClass} rows={2} placeholder="Optional notes about this capacity entry" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowCapacityModal(false); resetCapForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleAddCapacity} disabled={!capSiteId || !capDate} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors">
                  <Check className="w-5 h-5" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Slot Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" /> Request a Shift Slot
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select value={reqSiteId} onChange={e => { setReqSiteId(e.target.value); setReqDate(''); }} className={inputClass}>
                  <option value="">Select a site…</option>
                  {state.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                {reqSiteId && availableDatesForSite(reqSiteId).length > 0 ? (
                  <select value={reqDate} onChange={e => setReqDate(e.target.value)} className={inputClass}>
                    <option value="">Select a date…</option>
                    {availableDatesForSite(reqSiteId).map(c => {
                      const approved = approvedCountFor(c.siteId, c.date);
                      const full = approved >= c.capacityCount;
                      return (
                        <option key={c.id} value={c.date} disabled={full}>
                          {new Date(c.date + 'T00:00:00').toLocaleDateString()} — {approved}/{c.capacityCount} filled{full ? ' (FULL)' : ''}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input type="date" value={reqDate} onChange={e => setReqDate(e.target.value)} min={today} className={inputClass} />
                )}
              </div>
              {reqSiteId && reqDate && (() => {
                const cap = state.capacities.find(c => c.siteId === reqSiteId && c.date === reqDate);
                if (cap && approvedCountFor(reqSiteId, reqDate) >= cap.capacityCount) {
                  return (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">This date/site is at full capacity. Your request may be waitlisted.</p>
                    </div>
                  );
                }
                return null;
              })()}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={reqNotes} onChange={e => setReqNotes(e.target.value)} className={inputClass} rows={2} placeholder="Any additional notes for the coordinator" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowRequestModal(false); resetReqForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleRequestSlot} disabled={!reqSiteId || !reqDate} className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors">
                  <Check className="w-5 h-5" /> Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
