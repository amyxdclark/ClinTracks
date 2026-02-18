import { useState } from 'react';
import { useApp } from '../AppContext';
import type { ShiftLog } from '../types';
import { Clock, Plus, Check, X, Calendar, MapPin, AlertTriangle, Send, FileText } from 'lucide-react';

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return styles[status] ?? styles.pending;
};

const ShiftHoursPage = () => {
  const { state, updateState, addNotification } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [siteId, setSiteId] = useState('');
  const [preceptorId, setPreceptorId] = useState('');
  const [notes, setNotes] = useState('');
  const [noPHI, setNoPHI] = useState(false);

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  const isPreceptorOrInstructor = currentUser?.role === 'Preceptor' || currentUser?.role === 'Instructor';

  const userShifts = isStudent
    ? state.shiftLogs.filter(s => s.studentId === state.activeProfileId)
    : isPreceptorOrInstructor
      ? state.shiftLogs.filter(s => s.preceptorId === state.activeProfileId)
      : [];

  const preceptors = state.profiles.filter(u => u.role === 'Preceptor' || u.role === 'Instructor');

  const calculateHours = (start: string, end: string, breakMins: number): number => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(0, diff / (1000 * 60 * 60) - breakMins / 60);
  };

  const computedHoursLive = calculateHours(startTime, endTime, breakMinutes);

  const resetForm = () => {
    setDate('');
    setStartTime('');
    setEndTime('');
    setBreakMinutes(0);
    setSiteId('');
    setPreceptorId('');
    setNotes('');
    setNoPHI(false);
  };

  const handleAddShift = () => {
    if (!date || !startTime || !endTime || !siteId || !noPHI) {
      alert('Please fill all required fields and confirm NO PHI');
      return;
    }
    const hours = calculateHours(startTime, endTime, breakMinutes);
    if (hours <= 0) {
      alert('End time must be after start time (accounting for break)');
      return;
    }
    const now = new Date().toISOString();
    const newShift: ShiftLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      studentId: state.activeProfileId,
      date,
      startTime,
      endTime,
      breakMinutes,
      computedHours: hours,
      siteId,
      preceptorId: preceptorId || undefined,
      status: 'pending',
      notes: notes || undefined,
      noPHI: true,
      createdAt: now,
      updatedAt: now,
    };
    updateState(prev => ({ ...prev, shiftLogs: [...prev.shiftLogs, newShift] }));
    setShowAddModal(false);
    resetForm();
  };

  const updateShiftStatus = (id: string, status: 'submitted' | 'approved' | 'rejected') => {
    const shift = state.shiftLogs.find(s => s.id === id);
    updateState(prev => ({
      ...prev,
      shiftLogs: prev.shiftLogs.map(s =>
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
      ),
    }));
    // Notify student when their shift is approved or rejected from this page
    if (shift && (status === 'approved' || status === 'rejected')) {
      const reviewerName = currentUser?.name ?? 'A reviewer';
      addNotification(
        shift.studentId,
        `Shift ${status}`,
        `${reviewerName} ${status} your shift log for ${new Date(shift.date).toLocaleDateString()}`,
        status === 'approved' ? 'approval' : 'rejection',
        '/shift-hours',
      );
    }
  };

  const sortedShifts = [...userShifts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalHours = userShifts.reduce((sum, s) => sum + s.computedHours, 0);
  const approvedHours = userShifts.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.computedHours, 0);

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary-500" /> Shift Hours
          </h1>
          <p className="text-gray-600 mt-1">
            {isStudent ? 'Log and track your clinical shift hours' : 'Review and approve student shift hours'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-colors text-base"
          >
            <Plus className="w-5 h-5" /> Add Shift
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Total Hours</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">{totalHours.toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Check className="w-4 h-4" />
            <span className="text-sm">Approved Hours</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">{approvedHours.toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Total Shifts</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">{userShifts.length}</p>
        </div>
      </div>

      {/* PHI Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow mb-6 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 mb-1">NO PHI – Privacy Warning</h3>
          <p className="text-sm text-red-700">
            Do not include any patient information, names, or identifiable details in your shift notes.
          </p>
        </div>
      </div>

      {/* Shifts List */}
      <div className="space-y-4">
        {sortedShifts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No shift hours logged yet</p>
            {isStudent && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" /> Log Your First Shift
              </button>
            )}
          </div>
        ) : (
          sortedShifts.map(shift => {
            const site = state.sites.find(s => s.id === shift.siteId);
            const student = state.profiles.find(u => u.id === shift.studentId);
            const preceptor = shift.preceptorId ? state.profiles.find(u => u.id === shift.preceptorId) : null;

            return (
              <div key={shift.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {!isStudent && student && (
                      <p className="text-sm text-gray-500 mb-1">Student: {student.name}</p>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" /> {site?.name ?? 'Unknown Site'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(shift.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {shift.startTime} – {shift.endTime}
                      </span>
                      <span className="font-medium">{shift.computedHours.toFixed(1)} hrs</span>
                      {shift.breakMinutes > 0 && (
                        <span className="text-gray-400">({shift.breakMinutes}m break)</span>
                      )}
                    </div>
                    {preceptor && (
                      <p className="text-sm text-gray-500 mt-1">Preceptor: {preceptor.name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge(shift.status)}`}>
                    {shift.status.toUpperCase()}
                  </span>
                </div>

                {shift.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{shift.notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    {shift.noPHI ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                    NO PHI Confirmed
                  </span>

                  <div className="flex gap-2">
                    {isStudent && shift.status === 'pending' && (
                      <button
                        onClick={() => updateShiftStatus(shift.id, 'submitted')}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        <Send className="w-4 h-4" /> Submit
                      </button>
                    )}
                    {isPreceptorOrInstructor && shift.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => updateShiftStatus(shift.id, 'approved')}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => updateShiftStatus(shift.id, 'rejected')}
                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" /> Log Shift Hours
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Break Minutes</label>
                <input
                  type="number"
                  min={0}
                  value={breakMinutes}
                  onChange={e => setBreakMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              {startTime && endTime && (
                <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-900">
                    Computed Hours: <strong>{computedHoursLive.toFixed(1)}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Site *</label>
                <select value={siteId} onChange={e => setSiteId(e.target.value)} className={inputClass}>
                  <option value="">Select a site…</option>
                  {state.sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preceptor / Instructor (Optional)</label>
                <select value={preceptorId} onChange={e => setPreceptorId(e.target.value)} className={inputClass}>
                  <option value="">Select later…</option>
                  {preceptors.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (NO PHI!)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={inputClass}
                  rows={3}
                  placeholder="General notes about the shift (no patient information)"
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noPHI}
                    onChange={e => setNoPHI(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-red-900">
                    <strong>I confirm NO Protected Health Information (PHI)</strong> is included.
                    No patient names, IDs, or identifiable information. *
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddShift}
                  disabled={!date || !startTime || !endTime || !siteId || !noPHI}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors text-base"
                >
                  <Check className="w-5 h-5" /> Log Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftHoursPage;
