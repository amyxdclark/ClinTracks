import { useState } from 'react';
import { useApp } from '../AppContext';
import type { SkillLog } from '../types';

const Requirements = () => {
  const { state, updateState } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [notes, setNotes] = useState('');
  const [noPHI, setNoPHI] = useState(false);
  const [selectedPreceptor, setSelectedPreceptor] = useState('');

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  const isPreceptor = currentUser?.role === 'Preceptor';

  const userSkillLogs = isStudent
    ? state.skillLogs.filter(r => r.studentId === state.activeProfileId)
    : state.skillLogs.filter(r => r.status === 'submitted');

  const preceptors = state.profiles.filter(u => u.role === 'Preceptor');

  const handleAddRequirement = () => {
    if (!selectedTemplateId || !noPHI) {
      alert('Please select a skill and confirm NO PHI is included');
      return;
    }

    const template = state.requirementTemplates.find(t => t.id === selectedTemplateId);
    const now = new Date().toISOString();

    const newSkillLog: SkillLog = {
      id: Date.now().toString(),
      studentId: state.activeProfileId,
      skillName: template?.name ?? '',
      skillType: template?.category ?? '',
      outcome: 'success',
      mode: 'independent',
      notes,
      noPHI: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    updateState(prev => ({
      ...prev,
      skillLogs: [...prev.skillLogs, newSkillLog],
    }));

    setShowAddModal(false);
    setSelectedTemplateId('');
    setNotes('');
    setNoPHI(false);
    setSelectedPreceptor('');
  };

  const handleSubmit = (id: string) => {
    updateState(prev => ({
      ...prev,
      skillLogs: prev.skillLogs.map(r =>
        r.id === id ? { ...r, status: 'submitted' as const, updatedAt: new Date().toISOString() } : r
      ),
    }));
  };

  const handleApprove = (id: string) => {
    updateState(prev => ({
      ...prev,
      skillLogs: prev.skillLogs.map(r =>
        r.id === id ? { ...r, status: 'approved' as const, updatedAt: new Date().toISOString() } : r
      ),
    }));
  };

  const handleReject = (id: string) => {
    updateState(prev => ({
      ...prev,
      skillLogs: prev.skillLogs.map(r =>
        r.id === id ? { ...r, status: 'rejected' as const, updatedAt: new Date().toISOString() } : r
      ),
    }));
  };

  return (
    <div className="max-w-6xl mx-auto md:ml-64">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Requirements 📋</h1>
          <p className="text-gray-600">
            {isStudent ? 'Track and submit your clinical skill completions' : 'Review and approve student requirements'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            + Add Requirement
          </button>
        )}
      </div>

      {/* PHI Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <span className="text-2xl mr-3">🚫</span>
          <div>
            <h3 className="font-semibold text-red-800 mb-1">NO PHI - Privacy Warning</h3>
            <p className="text-sm text-red-700">
              <strong>Do not include any Protected Health Information</strong> such as patient names, 
              dates of birth, medical record numbers, or other identifying information in your notes.
            </p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {userSkillLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <p className="text-gray-500 mb-4">No requirements yet</p>
            {isStudent && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Add Your First Requirement
              </button>
            )}
          </div>
        ) : (
          userSkillLogs.map(req => {
            const student = state.profiles.find(u => u.id === req.studentId);

            return (
              <div key={req.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {!isStudent && (
                      <p className="text-sm text-gray-600 mb-1">Student: {student?.name}</p>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{req.skillName}</h3>
                    <p className="text-sm text-gray-600">{req.skillType} — {req.outcome} ({req.mode})</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    req.status === 'approved' ? 'bg-green-100 text-green-800' :
                    req.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>

                {req.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{req.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      {req.noPHI ? '✅' : '❌'} NO PHI Confirmed
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {isStudent && req.status === 'pending' && (
                      <button
                        onClick={() => handleSubmit(req.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                      >
                        Submit for Review
                      </button>
                    )}
                    {isPreceptor && req.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Add New Requirement</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Skill *
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a skill...</option>
                  {state.requirementTemplates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preceptor (Optional)
                </label>
                <select
                  value={selectedPreceptor}
                  onChange={(e) => setSelectedPreceptor(e.target.value)}
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
                  placeholder="Enter general notes (no patient information)"
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
                    <strong>I confirm that NO Protected Health Information (PHI)</strong> is included 
                    in this requirement entry. No patient names, IDs, or identifiable information. *
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedTemplateId('');
                    setNotes('');
                    setNoPHI(false);
                    setSelectedPreceptor('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRequirement}
                  disabled={!selectedTemplateId || !noPHI}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Requirement
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
