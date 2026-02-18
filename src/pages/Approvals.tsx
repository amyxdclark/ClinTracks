import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../AppContext';
import type { Approval } from '../types';
import { Inbox, Check, X, Clock, FileText, Activity, MessageSquare } from 'lucide-react';

const Approvals = () => {
  const { state, updateState, addAuditEvent, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'shifts' | 'skills'>('shifts');
  const [comments, setComments] = useState<Record<string, string>>({});

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isReviewer =
    currentUser?.role === 'Preceptor' ||
    currentUser?.role === 'Instructor' ||
    currentUser?.role === 'Coordinator' ||
    currentUser?.role === 'ProgramAdmin';

  const pendingShifts = useMemo(
    () => state.shiftLogs.filter(s => s.status === 'submitted'),
    [state.shiftLogs],
  );

  const pendingSkills = useMemo(
    () => state.skillLogs.filter(s => s.status === 'submitted'),
    [state.skillLogs],
  );

  const handleDecision = useCallback((
    entityType: 'shift' | 'skill',
    entityId: string,
    decision: 'approved' | 'rejected',
  ) => {
    const now = new Date().toISOString();
    const approval: Approval = {
      id: `appr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      entityType,
      entityId,
      reviewerId: state.activeProfileId,
      decision,
      comments: comments[entityId] || undefined,
      decidedAt: now,
    };

    // Find the student who submitted this item
    const studentId = entityType === 'shift'
      ? state.shiftLogs.find(s => s.id === entityId)?.studentId
      : state.skillLogs.find(s => s.id === entityId)?.studentId;

    updateState(prev => {
      const updatedShiftLogs =
        entityType === 'shift'
          ? prev.shiftLogs.map(s =>
              s.id === entityId ? { ...s, status: decision as 'approved' | 'rejected', updatedAt: now } : s,
            )
          : prev.shiftLogs;

      const updatedSkillLogs =
        entityType === 'skill'
          ? prev.skillLogs.map(s =>
              s.id === entityId ? { ...s, status: decision as 'approved' | 'rejected', updatedAt: now } : s,
            )
          : prev.skillLogs;

      return {
        ...prev,
        shiftLogs: updatedShiftLogs,
        skillLogs: updatedSkillLogs,
        approvals: [...prev.approvals, approval],
      };
    });

    addAuditEvent(
      decision,
      entityType,
      entityId,
      comments[entityId] ? `Comment: ${comments[entityId]}` : undefined,
    );

    // Send notification to the student
    if (studentId) {
      const reviewerName = state.profiles.find(p => p.id === state.activeProfileId)?.name ?? 'A reviewer';
      const itemLabel = entityType === 'shift' ? 'shift log' : 'skill log';
      const notifType = decision === 'approved' ? 'approval' : 'rejection';
      const commentText = comments[entityId] ? ` — "${comments[entityId]}"` : '';
      addNotification(
        studentId,
        `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ${decision}`,
        `${reviewerName} ${decision} your ${itemLabel}${commentText}`,
        notifType,
        entityType === 'shift' ? '/shift-hours' : '/skills',
      );
    }

    setComments(prev => {
      const next = { ...prev };
      delete next[entityId];
      return next;
    });
  }, [state.activeProfileId, state.shiftLogs, state.skillLogs, state.profiles, comments, updateState, addAuditEvent, addNotification]);

  if (!isReviewer) {
    return (
      <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mt-8">
          <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Reviewer Access Only</h2>
          <p className="text-gray-500">Only reviewers can access this page.</p>
        </div>
      </div>
    );
  }

  const items = activeTab === 'shifts' ? pendingShifts : pendingSkills;

  return (
    <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Inbox className="w-7 h-7" /> Approvals Inbox
        </h1>
        <p className="mt-1 text-blue-100">Review and approve pending student submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'shifts'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
          }`}
        >
          <Clock className="w-4 h-4" /> Shifts
          {pendingShifts.length > 0 && (
            <span className="ml-1 bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingShifts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
          }`}
        >
          <Activity className="w-4 h-4" /> Skills
          {pendingSkills.length > 0 && (
            <span className="ml-1 bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingSkills.length}
            </span>
          )}
        </button>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No pending items</h3>
            <p className="text-gray-500">
              All {activeTab} have been reviewed. Check back later.
            </p>
          </div>
        ) : activeTab === 'shifts' ? (
          pendingShifts.map(shift => {
            const student = state.profiles.find(u => u.id === shift.studentId);
            const site = state.sites.find(s => s.id === shift.siteId);
            return (
              <div key={shift.id} className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Student: {student?.name ?? 'Unknown'}</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {site?.name ?? 'Unknown Site'} – {new Date(shift.date).toLocaleDateString()}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {shift.computedHours} hrs
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    SUBMITTED
                  </span>
                </div>
                {shift.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700">{shift.notes}</div>
                )}
                {/* Comment input */}
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Optional comment…"
                    value={comments[shift.id] ?? ''}
                    onChange={e => setComments(prev => ({ ...prev, [shift.id]: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleDecision('shift', shift.id, 'approved')}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision('shift', shift.id, 'rejected')}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          pendingSkills.map(skill => {
            const student = state.profiles.find(u => u.id === skill.studentId);
            return (
              <div key={skill.id} className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Student: {student?.name ?? 'Unknown'}</p>
                    <h3 className="text-lg font-bold text-gray-900">{skill.skillName}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${skill.outcome === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {skill.outcome === 'success' ? 'Success' : 'Fail'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${skill.mode === 'independent' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                        {skill.mode === 'independent' ? 'Independent' : 'Assisted'}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    SUBMITTED
                  </span>
                </div>
                {skill.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700">{skill.notes}</div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Optional comment…"
                    value={comments[skill.id] ?? ''}
                    onChange={e => setComments(prev => ({ ...prev, [skill.id]: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleDecision('skill', skill.id, 'approved')}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision('skill', skill.id, 'rejected')}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Approvals;
