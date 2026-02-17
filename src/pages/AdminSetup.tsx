import { useState } from 'react';
import { useApp } from '../AppContext';
import type { Program, Cohort, Site, RequirementTemplate } from '../types';
import { Settings, Building, Users, BookOpen, Plus, Trash2, Edit, Save } from 'lucide-react';

type SectionTab = 'programs' | 'cohorts' | 'sites' | 'templates';
type ModalMode = 'add' | 'edit';

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

const CATEGORIES: RequirementTemplate['category'][] = ['Skills', 'Hours', 'Documents', 'Evaluations'];

const AdminSetup = () => {
  const { state, updateState, addAuditEvent } = useApp();

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isAdmin = currentUser?.role === 'ProgramAdmin' || currentUser?.role === 'Coordinator';

  const [tab, setTab] = useState<SectionTab>('programs');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editId, setEditId] = useState<string | null>(null);

  // Form state for Programs
  const [progName, setProgName] = useState('');
  const [progDesc, setProgDesc] = useState('');

  // Form state for Cohorts
  const [cohortProgramId, setCohortProgramId] = useState('');
  const [cohortName, setCohortName] = useState('');
  const [cohortStart, setCohortStart] = useState('');
  const [cohortEnd, setCohortEnd] = useState('');

  // Form state for Sites
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteNotes, setSiteNotes] = useState('');

  // Form state for Requirement Templates
  const [rtProgramId, setRtProgramId] = useState('');
  const [rtName, setRtName] = useState('');
  const [rtCategory, setRtCategory] = useState<RequirementTemplate['category']>('Skills');
  const [rtTarget, setRtTarget] = useState('');
  const [rtUnit, setRtUnit] = useState('');
  const [rtDesc, setRtDesc] = useState('');

  const resetForm = () => {
    setProgName(''); setProgDesc('');
    setCohortProgramId(''); setCohortName(''); setCohortStart(''); setCohortEnd('');
    setSiteName(''); setSiteAddress(''); setSiteNotes('');
    setRtProgramId(''); setRtName(''); setRtCategory('Skills'); setRtTarget(''); setRtUnit(''); setRtDesc('');
    setEditId(null);
  };

  const openAdd = () => { resetForm(); setModalMode('add'); setShowModal(true); };

  const openEdit = (id: string) => {
    setEditId(id);
    setModalMode('edit');
    if (tab === 'programs') {
      const p = state.programs.find(x => x.id === id)!;
      setProgName(p.name); setProgDesc(p.description);
    } else if (tab === 'cohorts') {
      const c = state.cohorts.find(x => x.id === id)!;
      setCohortProgramId(c.programId); setCohortName(c.name);
      setCohortStart(c.startDate); setCohortEnd(c.endDate);
    } else if (tab === 'sites') {
      const s = state.sites.find(x => x.id === id)!;
      setSiteName(s.name); setSiteAddress(s.address ?? ''); setSiteNotes(s.notes ?? '');
    } else {
      const r = state.requirementTemplates.find(x => x.id === id)!;
      setRtProgramId(r.programId); setRtName(r.name); setRtCategory(r.category);
      setRtTarget(String(r.targetCount)); setRtUnit(r.unit); setRtDesc(r.description ?? '');
    }
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (tab === 'programs') {
      updateState(prev => ({ ...prev, programs: prev.programs.filter(x => x.id !== id) }));
      addAuditEvent('delete', 'program', id);
    } else if (tab === 'cohorts') {
      updateState(prev => ({ ...prev, cohorts: prev.cohorts.filter(x => x.id !== id) }));
      addAuditEvent('delete', 'cohort', id);
    } else if (tab === 'sites') {
      updateState(prev => ({ ...prev, sites: prev.sites.filter(x => x.id !== id) }));
      addAuditEvent('delete', 'site', id);
    } else {
      updateState(prev => ({ ...prev, requirementTemplates: prev.requirementTemplates.filter(x => x.id !== id) }));
      addAuditEvent('delete', 'requirementTemplate', id);
    }
  };

  const handleSave = () => {
    if (tab === 'programs') {
      if (!progName.trim()) return;
      const item: Program = editId
        ? { id: editId, name: progName.trim(), description: progDesc.trim() }
        : { id: genId('prog'), name: progName.trim(), description: progDesc.trim() };
      updateState(prev => ({
        ...prev,
        programs: editId
          ? prev.programs.map(p => (p.id === editId ? item : p))
          : [...prev.programs, item],
      }));
      addAuditEvent(editId ? 'update' : 'create', 'program', item.id);
    } else if (tab === 'cohorts') {
      if (!cohortName.trim() || !cohortProgramId || !cohortStart || !cohortEnd) return;
      const item: Cohort = {
        id: editId ?? genId('cohort'),
        programId: cohortProgramId,
        name: cohortName.trim(),
        startDate: cohortStart,
        endDate: cohortEnd,
      };
      updateState(prev => ({
        ...prev,
        cohorts: editId
          ? prev.cohorts.map(c => (c.id === editId ? item : c))
          : [...prev.cohorts, item],
      }));
      addAuditEvent(editId ? 'update' : 'create', 'cohort', item.id);
    } else if (tab === 'sites') {
      if (!siteName.trim()) return;
      const item: Site = {
        id: editId ?? genId('site'),
        name: siteName.trim(),
        address: siteAddress.trim() || undefined,
        notes: siteNotes.trim() || undefined,
      };
      updateState(prev => ({
        ...prev,
        sites: editId
          ? prev.sites.map(s => (s.id === editId ? item : s))
          : [...prev.sites, item],
      }));
      addAuditEvent(editId ? 'update' : 'create', 'site', item.id);
    } else {
      if (!rtName.trim() || !rtProgramId || !rtTarget || !rtUnit.trim()) return;
      const item: RequirementTemplate = {
        id: editId ?? genId('rt'),
        programId: rtProgramId,
        name: rtName.trim(),
        category: rtCategory,
        targetCount: Number(rtTarget),
        unit: rtUnit.trim(),
        description: rtDesc.trim() || undefined,
      };
      updateState(prev => ({
        ...prev,
        requirementTemplates: editId
          ? prev.requirementTemplates.map(r => (r.id === editId ? item : r))
          : [...prev.requirementTemplates, item],
      }));
      addAuditEvent(editId ? 'update' : 'create', 'requirementTemplate', item.id);
    }
    setShowModal(false);
    resetForm();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mt-8">
          <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">Only Coordinators and Program Admins can access this page.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: SectionTab; label: string; icon: React.ReactNode }[] = [
    { key: 'programs', label: 'Programs', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'cohorts', label: 'Cohorts', icon: <Users className="w-4 h-4" /> },
    { key: 'sites', label: 'Sites', icon: <Building className="w-4 h-4" /> },
    { key: 'templates', label: 'Requirement Templates', icon: <Settings className="w-4 h-4" /> },
  ];

  const renderModalFields = () => {
    if (tab === 'programs') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={progName} onChange={e => setProgName(e.target.value)} className={inputClass} placeholder="Program name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={progDesc} onChange={e => setProgDesc(e.target.value)} className={inputClass} rows={3} placeholder="Description" />
          </div>
        </>
      );
    }
    if (tab === 'cohorts') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
            <select value={cohortProgramId} onChange={e => setCohortProgramId(e.target.value)} className={inputClass}>
              <option value="">Select program…</option>
              {state.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={cohortName} onChange={e => setCohortName(e.target.value)} className={inputClass} placeholder="Cohort name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" value={cohortStart} onChange={e => setCohortStart(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" value={cohortEnd} onChange={e => setCohortEnd(e.target.value)} className={inputClass} />
            </div>
          </div>
        </>
      );
    }
    if (tab === 'sites') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} className={inputClass} placeholder="Site name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={siteAddress} onChange={e => setSiteAddress(e.target.value)} className={inputClass} placeholder="Optional address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={siteNotes} onChange={e => setSiteNotes(e.target.value)} className={inputClass} rows={2} placeholder="Optional notes" />
          </div>
        </>
      );
    }
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
          <select value={rtProgramId} onChange={e => setRtProgramId(e.target.value)} className={inputClass}>
            <option value="">Select program…</option>
            {state.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input value={rtName} onChange={e => setRtName(e.target.value)} className={inputClass} placeholder="Requirement name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={rtCategory} onChange={e => setRtCategory(e.target.value as RequirementTemplate['category'])} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Count *</label>
            <input type="number" min="1" value={rtTarget} onChange={e => setRtTarget(e.target.value)} className={inputClass} placeholder="e.g. 10" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
          <input value={rtUnit} onChange={e => setRtUnit(e.target.value)} className={inputClass} placeholder="e.g. hours, attempts" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={rtDesc} onChange={e => setRtDesc(e.target.value)} className={inputClass} rows={2} placeholder="Optional description" />
        </div>
      </>
    );
  };

  return (
    <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Settings className="w-7 h-7" /> Admin Setup
        </h1>
        <p className="mt-1 text-indigo-100">Manage programs, cohorts, sites, and requirement templates</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              tab === t.key
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add {tab === 'templates' ? 'Template' : tab.slice(0, -1).replace(/^./, c => c.toUpperCase())}
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {tab === 'programs' &&
          state.programs.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                <p className="text-sm text-gray-500 truncate">{p.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(p.id)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

        {tab === 'cohorts' &&
          state.cohorts.map(c => {
            const prog = state.programs.find(p => p.id === c.programId);
            return (
              <div key={c.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  <p className="text-sm text-gray-500">{prog?.name ?? 'Unknown'} · {c.startDate} → {c.endDate}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(c.id)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}

        {tab === 'sites' &&
          state.sites.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                {s.address && <p className="text-sm text-gray-500 truncate">{s.address}</p>}
                {s.notes && <p className="text-xs text-gray-400 truncate">{s.notes}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s.id)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

        {tab === 'templates' &&
          state.requirementTemplates.map(r => {
            const prog = state.programs.find(p => p.id === r.programId);
            return (
              <div key={r.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{r.name}</h3>
                  <p className="text-sm text-gray-500">
                    {prog?.name ?? 'Unknown'} · {r.category} · {r.targetCount} {r.unit}
                  </p>
                  {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(r.id)} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {modalMode === 'add' ? <Plus className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                {modalMode === 'add' ? 'Add' : 'Edit'} {tab === 'templates' ? 'Template' : tab.slice(0, -1).replace(/^./, c => c.toUpperCase())}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {renderModalFields()}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl transition-colors text-base"
                >
                  <Save className="w-5 h-5" /> {modalMode === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
