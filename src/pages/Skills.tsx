import { useState } from 'react';
import { useApp } from '../AppContext';
import type { SkillLog } from '../types';
import { Star, Plus, Check, X, AlertTriangle, Send, Activity } from 'lucide-react';

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return styles[status] ?? styles.pending;
};

const SKILL_TYPES = ['IV Start', 'Intubation', 'Medication Administration', 'Patient Assessment', '12-Lead EKG', 'CPR', 'Splinting', 'Wound Care', 'Other'];
const AGE_RANGES = ['Pediatric', 'Adult', 'Geriatric'];
const COMPLAINT_CATEGORIES = ['Cardiac', 'Respiratory', 'Trauma', 'Medical', 'Other'];

const Skills = () => {
  const { state, updateState } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillType, setSkillType] = useState('');
  const [outcome, setOutcome] = useState<'success' | 'fail'>('success');
  const [mode, setMode] = useState<'assisted' | 'independent'>('assisted');
  const [ageRange, setAgeRange] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('');
  const [shiftLogId, setShiftLogId] = useState('');
  const [notes, setNotes] = useState('');
  const [noPHI, setNoPHI] = useState(false);

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  const isPreceptorOrInstructor = currentUser?.role === 'Preceptor' || currentUser?.role === 'Instructor';

  const userSkills = isStudent
    ? state.skillLogs.filter(s => s.studentId === state.activeProfileId)
    : isPreceptorOrInstructor
      ? state.skillLogs.filter(s => {
          const shift = state.shiftLogs.find(sh => sh.id === s.shiftLogId);
          return shift?.preceptorId === state.activeProfileId;
        })
      : [];

  const studentShifts = state.shiftLogs.filter(s => s.studentId === state.activeProfileId);

  const resetForm = () => {
    setSkillName('');
    setSkillType('');
    setOutcome('success');
    setMode('assisted');
    setAgeRange('');
    setComplaintCategory('');
    setShiftLogId('');
    setNotes('');
    setNoPHI(false);
  };

  const handleAddSkill = () => {
    if (!skillName.trim() || !skillType.trim() || !noPHI) {
      alert('Please fill all required fields and confirm NO PHI');
      return;
    }
    const now = new Date().toISOString();
    const newSkill: SkillLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      studentId: state.activeProfileId,
      shiftLogId: shiftLogId || undefined,
      skillName: skillName.trim(),
      skillType: skillType.trim(),
      outcome,
      mode,
      ageRange: ageRange || undefined,
      complaintCategory: complaintCategory || undefined,
      notes: notes || undefined,
      status: 'pending',
      noPHI: true,
      createdAt: now,
      updatedAt: now,
    };
    updateState(prev => ({ ...prev, skillLogs: [...prev.skillLogs, newSkill] }));
    setShowAddModal(false);
    resetForm();
  };

  const updateSkillStatus = (id: string, status: 'submitted' | 'approved' | 'rejected') => {
    updateState(prev => ({
      ...prev,
      skillLogs: prev.skillLogs.map(s =>
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
      ),
    }));
  };

  const sortedSkills = [...userSkills].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary-500" /> Skill Log
          </h1>
          <p className="text-gray-600 mt-1">
            {isStudent ? 'Log and track your clinical skills' : 'Review and approve student skill entries'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-colors text-base"
          >
            <Plus className="w-5 h-5" /> Log Skill
          </button>
        )}
      </div>

      {/* PHI Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow mb-6 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 mb-1">NO PHI – Privacy Warning</h3>
          <p className="text-sm text-red-700">
            Do not include any patient information, names, or identifiable details in your skill notes.
          </p>
        </div>
      </div>

      {/* Skill List */}
      <div className="space-y-4">
        {sortedSkills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No skills logged yet</h3>
            <p className="text-gray-500 mb-4">Start logging your clinical skills to track your progress.</p>
            {isStudent && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" /> Log Your First Skill
              </button>
            )}
          </div>
        ) : (
          sortedSkills.map(skill => {
            const student = state.profiles.find(u => u.id === skill.studentId);
            const linkedShift = skill.shiftLogId ? state.shiftLogs.find(s => s.id === skill.shiftLogId) : null;
            const linkedSite = linkedShift ? state.sites.find(s => s.id === linkedShift.siteId) : null;

            return (
              <div key={skill.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {!isStudent && student && (
                      <p className="text-sm text-gray-500 mb-1">Student: {student.name}</p>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{skill.skillName}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                        <Activity className="w-3 h-3" /> {skill.skillType}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${skill.outcome === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {skill.outcome === 'success' ? 'Success' : 'Fail'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${skill.mode === 'independent' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                        {skill.mode === 'independent' ? 'Independent' : 'Assisted'}
                      </span>
                      {skill.ageRange && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">{skill.ageRange}</span>
                      )}
                      {skill.complaintCategory && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">{skill.complaintCategory}</span>
                      )}
                    </div>
                    {linkedShift && (
                      <p className="text-xs text-gray-400 mt-1">
                        Linked to shift: {linkedSite?.name ?? 'Unknown'} on {new Date(linkedShift.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge(skill.status)}`}>
                    {skill.status.toUpperCase()}
                  </span>
                </div>

                {skill.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{skill.notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    {skill.noPHI ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                    NO PHI Confirmed
                  </span>

                  <div className="flex gap-2">
                    {isStudent && skill.status === 'pending' && (
                      <button
                        onClick={() => updateSkillStatus(skill.id, 'submitted')}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        <Send className="w-4 h-4" /> Submit
                      </button>
                    )}
                    {isPreceptorOrInstructor && skill.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => updateSkillStatus(skill.id, 'approved')}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => updateSkillStatus(skill.id, 'rejected')}
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

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" /> Log Skill
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. IV Start on simulated arm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Type *</label>
                <select value={skillType} onChange={e => setSkillType(e.target.value)} className={inputClass}>
                  <option value="">Select type…</option>
                  {SKILL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome *</label>
                  <select value={outcome} onChange={e => setOutcome(e.target.value as 'success' | 'fail')} className={inputClass}>
                    <option value="success">Success</option>
                    <option value="fail">Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
                  <select value={mode} onChange={e => setMode(e.target.value as 'assisted' | 'independent')} className={inputClass}>
                    <option value="assisted">Assisted</option>
                    <option value="independent">Independent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                  <select value={ageRange} onChange={e => setAgeRange(e.target.value)} className={inputClass}>
                    <option value="">Optional</option>
                    {AGE_RANGES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complaint</label>
                  <select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className={inputClass}>
                    <option value="">Optional</option>
                    {COMPLAINT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Shift (Optional)</label>
                <select value={shiftLogId} onChange={e => setShiftLogId(e.target.value)} className={inputClass}>
                  <option value="">No linked shift</option>
                  {studentShifts.map(s => {
                    const site = state.sites.find(st => st.id === s.siteId);
                    return (
                      <option key={s.id} value={s.id}>
                        {new Date(s.date).toLocaleDateString()} – {site?.name ?? 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (NO PHI!)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={inputClass}
                  rows={3}
                  placeholder="General notes about the skill (no patient information)"
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
                  onClick={handleAddSkill}
                  disabled={!skillName.trim() || !skillType.trim() || !noPHI}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors text-base"
                >
                  <Check className="w-5 h-5" /> Log Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
