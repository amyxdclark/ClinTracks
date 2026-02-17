import { useState } from 'react';
import { useApp } from '../AppContext';
import type { ShiftHours } from '../types';

const ShiftHoursPage = () => {
  const { state, updateState } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [siteId, setSiteId] = useState('');
  const [preceptorId, setPreceptorId] = useState('');
  const [notes, setNotes] = useState('');
  const [noPHI, setNoPHI] = useState(false);

  const currentUser = state.users.find(u => u.id === state.currentUserId);
  const isStudent = currentUser?.role === 'Student';
  const isPreceptor = currentUser?.role === 'Preceptor';

  const userShifts = isStudent
    ? state.shiftHours.filter(s => s.studentId === state.currentUserId)
    : state.shiftHours.filter(s => s.preceptorId === state.currentUserId);

  const preceptors = state.users.filter(u => u.role === 'Preceptor');

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(0, diff / (1000 * 60 * 60));
  };

  const handleAddShift = () => {
    if (!date || !startTime || !endTime || !siteId || !noPHI) {
      alert('Please fill all required fields and confirm NO PHI');
      return;
    }

    const hours = calculateHours(startTime, endTime);
    if (hours <= 0) {
      alert('End time must be after start time');
      return;
    }

    const newShift: ShiftHours = {
      id: Date.now().toString(),
      studentId: state.currentUserId,
      date,
      startTime,
      endTime,
      hours,
      siteId,
      preceptorId: preceptorId || undefined,
      status: 'pending',
      notes,
      noPHI: true,
    };

    updateState(prev => ({
      ...prev,
      shiftHours: [...prev.shiftHours, newShift],
    }));

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDate('');
    setStartTime('');
    setEndTime('');
    setSiteId('');
    setPreceptorId('');
    setNotes('');
    setNoPHI(false);
  };

  const handleSubmit = (id: string) => {
    updateState(prev => ({
      ...prev,
      shiftHours: prev.shiftHours.map(s =>
        s.id === id ? { ...s, status: 'submitted' as const } : s
      ),
    }));
  };

  const handleApprove = (id: string) => {
    updateState(prev => ({
      ...prev,
      shiftHours: prev.shiftHours.map(s =>
        s.id === id ? { ...s, status: 'approved' as const } : s
      ),
    }));
  };

  const handleReject = (id: string) => {
    updateState(prev => ({
      ...prev,
      shiftHours: prev.shiftHours.map(s =>
        s.id === id ? { ...s, status: 'rejected' as const } : s
      ),
    }));
  };

  const totalHours = userShifts.reduce((sum, shift) => sum + shift.hours, 0);
  const approvedHours = userShifts
    .filter(s => s.status === 'approved')
    .reduce((sum, shift) => sum + shift.hours, 0);

  return (
    <div className="max-w-6xl mx-auto md:ml-64">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shift Hours ⏰</h1>
          <p className="text-gray-600">
            {isStudent ? 'Log and track your clinical shift hours' : 'Review and approve student shift hours'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            + Add Shift
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Total Hours Logged</p>
            <p className="text-4xl font-bold">{totalHours.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Approved Hours</p>
            <p className="text-4xl font-bold">{approvedHours.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Total Shifts</p>
            <p className="text-4xl font-bold">{userShifts.length}</p>
          </div>
        </div>
      )}

      {/* PHI Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <span className="text-2xl mr-3">🚫</span>
          <div>
            <h3 className="font-semibold text-red-800 mb-1">NO PHI - Privacy Warning</h3>
            <p className="text-sm text-red-700">
              Do not include any patient information, names, or identifiable details in your shift notes.
            </p>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      <div className="space-y-4">
        {userShifts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <span className="text-6xl mb-4 block">⏰</span>
            <p className="text-gray-500 mb-4">No shift hours logged yet</p>
            {isStudent && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Log Your First Shift
              </button>
            )}
          </div>
        ) : (
          userShifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(shift => {
            const site = state.sites.find(s => s.id === shift.siteId);
            const student = state.users.find(u => u.id === shift.studentId);
            const preceptor = shift.preceptorId ? state.users.find(u => u.id === shift.preceptorId) : null;

            return (
              <div key={shift.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {!isStudent && (
                      <p className="text-sm text-gray-600 mb-1">Student: {student?.name}</p>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{site?.name}</h3>
                    <p className="text-gray-600">
                      📅 {new Date(shift.date).toLocaleDateString()} • 
                      {' '}⏰ {shift.startTime} - {shift.endTime} • 
                      {' '}⌛ {shift.hours.toFixed(1)} hours
                    </p>
                    {preceptor && (
                      <p className="text-sm text-gray-600 mt-1">Preceptor: {preceptor.name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    shift.status === 'approved' ? 'bg-green-100 text-green-800' :
                    shift.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    shift.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {shift.status.toUpperCase()}
                  </span>
                </div>

                {shift.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{shift.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    {shift.noPHI ? '✅' : '❌'} NO PHI Confirmed
                  </span>

                  <div className="flex space-x-2">
                    {isStudent && shift.status === 'pending' && (
                      <button
                        onClick={() => handleSubmit(shift.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                      >
                        Submit for Approval
                      </button>
                    )}
                    {isPreceptor && shift.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => handleApprove(shift.id)}
                          className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(shift.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                        >
                          ✗ Reject
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-t-xl sticky top-0">
              <h2 className="text-2xl font-bold">Log Shift Hours</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {startTime && endTime && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Total Hours: <strong>{calculateHours(startTime, endTime).toFixed(1)}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Site *
                </label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a site...</option>
                  {state.sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preceptor (Optional)
                </label>
                <select
                  value={preceptorId}
                  onChange={(e) => setPreceptorId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select later...</option>
                  {preceptors.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (NO PHI!)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="General notes about the shift (no patient information)"
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noPHI}
                    onChange={(e) => setNoPHI(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-red-900">
                    <strong>I confirm NO Protected Health Information (PHI)</strong> is included. 
                    No patient names, IDs, or identifiable information. *
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddShift}
                  disabled={!date || !startTime || !endTime || !siteId || !noPHI}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Log Shift
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
