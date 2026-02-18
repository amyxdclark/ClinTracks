import { useState } from 'react';
import { useApp } from '../AppContext';
import type { RequirementTemplate } from '../types';
import { ClipboardCheck, BookOpen, FileText, Award, CheckCircle, AlertTriangle, Plus, Target, CalendarClock } from 'lucide-react';

const CATEGORIES = ['Skills', 'Hours', 'Documents', 'Evaluations'] as const;
type Category = (typeof CATEGORIES)[number];

const EXPIRATION_WARNING_DAYS = 30;

const categoryMeta: Record<Category, { icon: typeof ClipboardCheck; gradient: string }> = {
  Skills: { icon: ClipboardCheck, gradient: 'from-blue-500 to-blue-700' },
  Hours: { icon: BookOpen, gradient: 'from-emerald-500 to-emerald-700' },
  Documents: { icon: FileText, gradient: 'from-amber-500 to-amber-700' },
  Evaluations: { icon: Award, gradient: 'from-purple-500 to-purple-700' },
};

const Requirements = () => {
  const { state, updateState, addAuditEvent } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category>('Skills');
  const [evidenceModal, setEvidenceModal] = useState<RequirementTemplate | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [noPHI, setNoPHI] = useState(false);

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';

  const templates = (() => {
    if (isStudent && currentUser?.programId) {
      return state.requirementTemplates.filter(t => t.programId === currentUser.programId);
    }
    return state.requirementTemplates;
  })();

  const getProgress = (template: RequirementTemplate): number => {
    if (!isStudent) return 0;
    const uid = state.activeProfileId;

    if (template.category === 'Skills') {
      return state.skillLogs.filter(
        s => s.studentId === uid && s.status === 'approved' && s.skillType === template.name
      ).length;
    }
    if (template.category === 'Hours') {
      const approved = state.shiftLogs.filter(s => s.studentId === uid && s.status === 'approved');
      return template.unit === 'hours'
        ? approved.reduce((sum, s) => sum + s.computedHours, 0)
        : approved.length;
    }
    const sp = state.studentProgress.find(
      p => p.studentId === uid && p.templateId === template.id
    );
    return sp?.currentCount ?? 0;
  };

  const grouped = (() => {
    const map: Record<Category, RequirementTemplate[]> = { Skills: [], Hours: [], Documents: [], Evaluations: [] };
    for (const t of templates) map[t.category].push(t);
    return map;
  })();

  const programName = (pid: string) => state.programs.find(p => p.id === pid)?.name ?? pid;

  const handleAddEvidence = () => {
    if (!evidenceModal || !noPHI) return;
    const tid = evidenceModal.id;
    const uid = state.activeProfileId;
    const expDate = expirationDate || undefined;
    updateState(prev => {
      const existing = prev.studentProgress.find(p => p.studentId === uid && p.templateId === tid);
      if (existing) {
        const newCount = existing.currentCount + 1;
        return {
          ...prev,
          studentProgress: prev.studentProgress.map(p =>
            p.id === existing.id
              ? { ...p, currentCount: newCount, status: newCount >= evidenceModal.targetCount ? 'completed' as const : 'in_progress' as const, expirationDate: expDate ?? p.expirationDate }
              : p
          ),
        };
      }
      return {
        ...prev,
        studentProgress: [...prev.studentProgress, {
          id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          studentId: uid,
          templateId: tid,
          currentCount: 1,
          status: 1 >= evidenceModal.targetCount ? 'completed' as const : 'in_progress' as const,
          expirationDate: expDate,
        }],
      };
    });
    addAuditEvent('add_evidence', 'studentProgress', tid, evidenceNotes || undefined);
    setEvidenceModal(null);
    setEvidenceNotes('');
    setExpirationDate('');
    setNoPHI(false);
  };

  const progressBar = (current: number, target: number) => {
    const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0);
    const color = pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300';
    return (
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const statusLabel = (current: number, target: number) => {
    if (current >= target) return { text: 'Complete', cls: 'bg-green-100 text-green-800' };
    if (current > 0) return { text: 'In Progress', cls: 'bg-blue-100 text-blue-800' };
    return { text: 'Not Started', cls: 'bg-gray-100 text-gray-600' };
  };

  // Summary counts for student
  const totalTemplates = templates.length;
  const completedCount = isStudent ? templates.filter(t => getProgress(t) >= t.targetCount).length : 0;
  const inProgressCount = isStudent ? templates.filter(t => { const p = getProgress(t); return p > 0 && p < t.targetCount; }).length : 0;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-7 h-7 text-primary-500" /> Clinical Requirements
          </h1>
          <p className="text-gray-600 mt-1">
            {isStudent ? 'Track your progress across all program requirements' : 'View requirement templates across programs'}
          </p>
        </div>
      </div>

      {/* Summary Stats (student only) */}
      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <Target className="w-4 h-4" />
              <span className="text-sm">Total Requirements</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">{totalTemplates}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Completed</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">{completedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">In Progress</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">{inProgressCount}</p>
          </div>
        </div>
      )}

      {/* PHI Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow mb-6 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 mb-1">NO PHI – Privacy Warning</h3>
          <p className="text-sm text-red-700">
            Do not include any patient information, names, or identifiable details when adding evidence.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => {
          const Icon = categoryMeta[cat].icon;
          const count = grouped[cat].length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                activeCategory === cat
                  ? `bg-gradient-to-r ${categoryMeta[cat].gradient} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <Icon className="w-4 h-4" /> {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Requirement Cards */}
      <div className="space-y-4">
        {grouped[activeCategory].length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ClipboardCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No {activeCategory.toLowerCase()} requirements found</p>
          </div>
        ) : (
          grouped[activeCategory].map(template => {
            const current = isStudent ? getProgress(template) : 0;
            const { text: statusText, cls: statusCls } = statusLabel(current, template.targetCount);
            const Icon = categoryMeta[template.category].icon;

            return (
              <div key={template.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {!isStudent && (
                      <p className="text-xs text-gray-500 mb-1">{programName(template.programId)}</p>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary-500 flex-shrink-0" /> {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    )}
                  </div>
                  {isStudent && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusCls}`}>
                      {statusText}
                    </span>
                  )}
                </div>

                {/* Progress (student only) */}
                {isStudent && (
                  <div className="mb-3">
                    {progressBar(current, template.targetCount)}
                    <p className="text-sm text-gray-600 mt-1">
                      {template.category === 'Hours' && template.unit === 'hours'
                        ? `${current.toFixed(1)} / ${template.targetCount} ${template.unit}`
                        : `${current} / ${template.targetCount} ${template.unit}`}
                    </p>
                  </div>
                )}

                {!isStudent && (
                  <p className="text-sm text-gray-500">
                    Target: {template.targetCount} {template.unit}
                  </p>
                )}

                {/* Expiration date for Documents (student only) */}
                {isStudent && template.category === 'Documents' && (() => {
                  const sp = state.studentProgress.find(
                    p => p.studentId === state.activeProfileId && p.templateId === template.id
                  );
                  if (!sp?.expirationDate) return null;
                  const expDate = new Date(sp.expirationDate + 'T00:00:00');
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysUntil < 0;
                  const isExpiringSoon = daysUntil >= 0 && daysUntil <= EXPIRATION_WARNING_DAYS;
                  return (
                    <div className={`mt-2 flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                      isExpired ? 'bg-red-50 text-red-700' : isExpiringSoon ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                    }`}>
                      <CalendarClock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {isExpired
                          ? `Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago (${expDate.toLocaleDateString()})`
                          : isExpiringSoon
                            ? `Expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (${expDate.toLocaleDateString()})`
                            : `Valid until ${expDate.toLocaleDateString()}`}
                      </span>
                    </div>
                  );
                })()}

                {/* Add Evidence button for Documents / Evaluations (student only) */}
                {isStudent && (template.category === 'Documents' || template.category === 'Evaluations') && current < template.targetCount && (
                  <div className="mt-3">
                    <button
                      onClick={() => setEvidenceModal(template)}
                      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Evidence
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Evidence Modal */}
      {evidenceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Evidence
              </h2>
              <p className="text-sm opacity-90 mt-1">{evidenceModal.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Confirm that you are documenting evidence for <strong>{evidenceModal.name}</strong>.
                This will increment your progress by 1.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (NO PHI!)</label>
                <textarea
                  value={evidenceNotes}
                  onChange={e => setEvidenceNotes(e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Brief description of evidence (no patient info)"
                />
              </div>

              {evidenceModal.category === 'Documents' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarClock className="w-4 h-4 inline mr-1" />
                    Expiration Date (optional)
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When does this certification or document expire?
                  </p>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noPHI}
                    onChange={e => setNoPHI(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-red-900">
                    <strong>I confirm NO Protected Health Information (PHI)</strong> is included. *
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setEvidenceModal(null); setEvidenceNotes(''); setExpirationDate(''); setNoPHI(false); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvidence}
                  disabled={!noPHI}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  <CheckCircle className="w-5 h-5" /> Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requirements;
