import { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import type { SiteCapacity, ScheduleRequest, Notification } from '../types';
import { Calendar, MapPin, Users, Plus, Check, X, AlertTriangle, Clock, ChevronLeft, ChevronRight, Filter, List, Grid3X3 } from 'lucide-react';
import HelpIcon from '../components/HelpIcon';

type ViewMode = 'month' | 'week' | 'day' | 'list';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const Scheduling = () => {
  const { state, updateState, addAuditEvent } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterSiteId, setFilterSiteId] = useState<string>('');
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [capSiteId, setCapSiteId] = useState('');
  const [capDate, setCapDate] = useState('');
  const [capCount, setCapCount] = useState(1);
  const [capNotes, setCapNotes] = useState('');
  const [reqSiteId, setReqSiteId] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  // Assignment form state
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignSiteId, setAssignSiteId] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  const isInstructor = currentUser?.role === 'Instructor';
  const isCoordinator = currentUser?.role === 'Coordinator' || currentUser?.role === 'ProgramAdmin';
  const canAssign = isInstructor || isCoordinator;

  const today = new Date().toISOString().slice(0, 10);

  // Filtered capacities
  const filteredCapacities = useMemo(() => {
    let caps = [...state.capacities];
    if (filterSiteId) {
      caps = caps.filter(c => c.siteId === filterSiteId);
    }
    return caps.sort((a, b) => a.date.localeCompare(b.date));
  }, [state.capacities, filterSiteId]);

  // Group capacities by date
  const capacitiesByDate = useMemo(() => {
    const map = new Map<string, SiteCapacity[]>();
    for (const cap of filteredCapacities) {
      const list = map.get(cap.date) ?? [];
      list.push(cap);
      map.set(cap.date, list);
    }
    return map;
  }, [filteredCapacities]);

  // Requests by date
  const requestsByDate = useMemo(() => {
    const map = new Map<string, ScheduleRequest[]>();
    for (const req of state.scheduleRequests) {
      const list = map.get(req.date) ?? [];
      list.push(req);
      map.set(req.date, list);
    }
    return map;
  }, [state.scheduleRequests]);

  const approvedCountFor = (siteId: string, date: string) =>
    state.scheduleRequests.filter(r => r.siteId === siteId && r.date === date && r.status === 'approved').length;

  const myRequests = useMemo(
    () => isStudent
      ? [...state.scheduleRequests].filter(r => r.studentId === state.activeProfileId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : [...state.scheduleRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [isStudent, state.scheduleRequests, state.activeProfileId],
  );

  // Calendar helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add padding days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add padding days from next month
    const endPadding = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return days;
  };

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const resetCapForm = () => { setCapSiteId(''); setCapDate(''); setCapCount(1); setCapNotes(''); };
  const resetReqForm = () => { setReqSiteId(''); setReqDate(''); setReqNotes(''); };
  const resetAssignForm = () => { setAssignStudentId(''); setAssignSiteId(''); setAssignDate(''); setAssignNotes(''); };

  const handleAddCapacity = () => {
    if (!capSiteId || !capDate || capCount < 1) { alert('Please fill all required fields'); return; }
    const newCap: SiteCapacity = {
      id: genId('cap'),
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
      id: genId('sr'),
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

  // Instructor/Coordinator can assign students directly
  const handleAssignStudent = () => {
    if (!assignStudentId || !assignSiteId || !assignDate) {
      alert('Please fill all required fields');
      return;
    }
    const newReq: ScheduleRequest = {
      id: genId('sr'),
      studentId: assignStudentId,
      siteId: assignSiteId,
      date: assignDate,
      status: 'approved', // Pre-approved when assigned by instructor/coordinator
      notes: assignNotes ? `Assigned by ${currentUser?.name}: ${assignNotes}` : `Assigned by ${currentUser?.name}`,
      createdAt: new Date().toISOString(),
    };
    
    // Create notification for the student
    const notification: Notification = {
      id: genId('notif'),
      userId: assignStudentId,
      type: 'schedule_approved',
      title: 'Clinical Shift Assigned',
      message: `You have been assigned a clinical shift at ${state.sites.find(s => s.id === assignSiteId)?.name} on ${new Date(assignDate).toLocaleDateString()}`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedEntityId: newReq.id,
    };

    updateState(prev => ({
      ...prev,
      scheduleRequests: [...prev.scheduleRequests, newReq],
      notifications: [...prev.notifications, notification],
    }));
    addAuditEvent('assign_shift', 'scheduleRequest', newReq.id);
    setShowAssignModal(false);
    resetAssignForm();
  };

  const handleDecision = (id: string, decision: 'approved' | 'rejected') => {
    const req = state.scheduleRequests.find(r => r.id === id);
    if (!req) return;

    if (decision === 'approved') {
      const cap = state.capacities.find(c => c.siteId === req.siteId && c.date === req.date);
      if (cap && approvedCountFor(req.siteId, req.date) >= cap.capacityCount) {
        if (!confirm('This will exceed the site capacity for this date. Approve anyway?')) return;
      }
    }

    // Create notification for the student
    const notification: Notification = {
      id: genId('notif'),
      userId: req.studentId,
      type: decision === 'approved' ? 'schedule_approved' : 'schedule_rejected',
      title: decision === 'approved' ? 'Shift Request Approved' : 'Shift Request Denied',
      message: decision === 'approved'
        ? `Your clinical shift request at ${state.sites.find(s => s.id === req.siteId)?.name} on ${new Date(req.date).toLocaleDateString()} has been approved.`
        : `Your clinical shift request at ${state.sites.find(s => s.id === req.siteId)?.name} on ${new Date(req.date).toLocaleDateString()} has been denied.`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedEntityId: id,
    };

    updateState(prev => ({
      ...prev,
      scheduleRequests: prev.scheduleRequests.map(r => r.id === id ? { ...r, status: decision } : r),
      notifications: [...prev.notifications, notification],
    }));
    addAuditEvent(`schedule_${decision}`, 'scheduleRequest', id);
  };

  const siteName = (id: string) => state.sites.find(s => s.id === id)?.name ?? id;
  const studentName = (id: string) => state.profiles.find(p => p.id === id)?.name ?? id;

  // Available dates for student request dropdown
  const availableDatesForSite = (siteId: string) =>
    filteredCapacities.filter(c => c.siteId === siteId && c.date >= today);

  // Students list for assignment
  const students = state.profiles.filter(p => p.role === 'Student');

  // Stats
  const totalSlots = filteredCapacities.filter(c => c.date >= today).reduce((s, c) => s + c.capacityCount, 0);
  const pendingRequests = state.scheduleRequests.filter(r => r.status === 'requested').length;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  // Calendar day cell content
  const renderDayContent = (date: Date) => {
    const dateKey = formatDateKey(date);
    const caps = capacitiesByDate.get(dateKey) || [];
    const reqs = requestsByDate.get(dateKey) || [];
    const isToday = dateKey === today;
    const isPast = dateKey < today;
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    
    const myReq = reqs.find(r => r.studentId === state.activeProfileId);
    const hasAvailability = caps.length > 0;

    return (
      <div
        className={`min-h-[80px] p-1 border border-gray-100 ${
          isToday ? 'bg-blue-50 border-blue-300' : 
          isPast ? 'bg-gray-50' : 
          !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
        } hover:bg-gray-50 cursor-pointer transition-colors`}
        onClick={() => {
          if (!isPast && hasAvailability && isStudent) {
            setReqDate(dateKey);
            setShowRequestModal(true);
          } else if (!isPast && (canAssign || isCoordinator)) {
            setAssignDate(dateKey);
            setCapDate(dateKey);
          }
        }}
      >
        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : !isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
          {date.getDate()}
        </div>
        
        {hasAvailability && (
          <div className="mt-1 space-y-0.5">
            {caps.slice(0, 2).map(cap => {
              const approved = approvedCountFor(cap.siteId, cap.date);
              const isFull = approved >= cap.capacityCount;
              return (
                <div
                  key={cap.id}
                  className={`text-xs px-1 py-0.5 rounded truncate ${
                    isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                  title={`${siteName(cap.siteId)}: ${approved}/${cap.capacityCount}`}
                >
                  {siteName(cap.siteId).split(' — ')[0]}
                </div>
              );
            })}
            {caps.length > 2 && (
              <div className="text-xs text-gray-500 px-1">+{caps.length - 2} more</div>
            )}
          </div>
        )}

        {myReq && (
          <div className={`mt-1 text-xs px-1 py-0.5 rounded ${statusBadge(myReq.status)}`}>
            {myReq.status === 'approved' ? '✓ Scheduled' : myReq.status === 'requested' ? '⏳ Pending' : '✗ Denied'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-500" /> Scheduling
            <HelpIcon
              title="Schedule Management"
              content={
                <div className="space-y-2">
                  <p><strong>Calendar Views:</strong> Switch between month, week, day, and list views.</p>
                  <p><strong>Students:</strong> Click on dates with availability to request shifts.</p>
                  <p><strong>Coordinators:</strong> Add site capacity, approve requests, and assign students directly.</p>
                  <p><strong>Color Coding:</strong> Green = available, Yellow = filling up, Red = full.</p>
                </div>
              }
            />
          </h1>
          <p className="text-gray-600 mt-1">
            {isCoordinator ? 'Manage site capacity and approve student requests' : 
             canAssign ? 'View schedules and assign students to shifts' :
             'View site availability and request shifts'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isCoordinator && (
            <button
              onClick={() => setShowCapacityModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add Capacity
            </button>
          )}
          {canAssign && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-colors text-sm"
            >
              <Users className="w-4 h-4" /> Assign Student
            </button>
          )}
          {isStudent && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Request Slot
            </button>
          )}
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Buttons */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day', 'list'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'list' ? <List className="w-4 h-4 inline mr-1" /> : mode === 'month' ? <Grid3X3 className="w-4 h-4 inline mr-1" /> : null}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              {viewMode === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && `Week of ${getWeekDays(currentDate)[0].toLocaleDateString()}`}
              {viewMode === 'day' && currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterSiteId}
              onChange={e => setFilterSiteId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Sites</option>
              {state.sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
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

      {/* Calendar View */}
      {viewMode !== 'list' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {DAYS.map(day => (
              <div key={day} className="px-2 py-3 text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7">
              {getMonthDays(currentDate).map((date, i) => (
                <div key={i}>{renderDayContent(date)}</div>
              ))}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-7">
              {getWeekDays(currentDate).map((date, i) => (
                <div key={i} className="min-h-[200px]">{renderDayContent(date)}</div>
              ))}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="p-4">
              {renderDayContent(currentDate)}
              {/* Show detailed info for the day */}
              <div className="mt-4 space-y-3">
                {(capacitiesByDate.get(formatDateKey(currentDate)) || []).map(cap => {
                  const approved = approvedCountFor(cap.siteId, cap.date);
                  return (
                    <div key={cap.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{siteName(cap.siteId)}</h4>
                          {cap.notes && <p className="text-sm text-gray-500">{cap.notes}</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${capacityColor(approved, cap.capacityCount)}`}>
                          {approved}/{cap.capacityCount} filled
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View / Requests */}
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
          myRequests.slice(0, viewMode === 'list' ? undefined : 5).map(req => (
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
              {(isCoordinator || isInstructor) && req.status === 'requested' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDecision(req.id, 'approved')}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision(req.id, 'rejected')}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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
                <button onClick={() => { setShowCapacityModal(false); resetCapForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleAddCapacity} disabled={!capSiteId || !capDate} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors">
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
                <button onClick={() => { setShowRequestModal(false); resetReqForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleRequestSlot} disabled={!reqSiteId || !reqDate} className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors">
                  <Check className="w-5 h-5" /> Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" /> Assign Student to Shift
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select value={assignStudentId} onChange={e => setAssignStudentId(e.target.value)} className={inputClass}>
                  <option value="">Select a student…</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select value={assignSiteId} onChange={e => setAssignSiteId(e.target.value)} className={inputClass}>
                  <option value="">Select a site…</option>
                  {state.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} min={today} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={assignNotes} onChange={e => setAssignNotes(e.target.value)} className={inputClass} rows={2} placeholder="Optional notes for the student" />
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  The student will be automatically approved for this shift and will receive a notification.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowAssignModal(false); resetAssignForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleAssignStudent} disabled={!assignStudentId || !assignSiteId || !assignDate} className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-xl transition-colors">
                  <Check className="w-5 h-5" /> Assign
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
