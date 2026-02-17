import { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { exportState, importState, resetState, mergeState } from '../storage';
import { Settings as SettingsIcon, Download, Upload, Trash2, RotateCcw, Info, Database, Shield } from 'lucide-react';
import type { AppState } from '../types';

type ImportMode = 'replace' | 'merge';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const Settings = () => {
  const { state, updateState } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportChoice, setShowImportChoice] = useState(false);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExport = () => {
    exportState(state);
    showToast('Backup exported as clintrack-backup.json');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedState = await importState(file);
      setPendingImport(importedState);
      setShowImportChoice(true);
    } catch {
      showToast('Failed to import data. Please check the file and try again.', 'error');
    }
    e.target.value = '';
  };

  const executeImport = (mode: ImportMode) => {
    if (!pendingImport) return;

    if (mode === 'replace') {
      updateState(() => pendingImport);
      showToast(
        `Replaced all data: ${pendingImport.profiles.length} profiles, ${pendingImport.shiftLogs.length} shift logs, ${pendingImport.skillLogs.length} skill logs`
      );
    } else {
      const merged = mergeState(state, pendingImport);
      const added = {
        profiles: merged.profiles.length - state.profiles.length,
        shiftLogs: merged.shiftLogs.length - state.shiftLogs.length,
        skillLogs: merged.skillLogs.length - state.skillLogs.length,
        sites: merged.sites.length - state.sites.length,
      };
      updateState(() => merged);
      showToast(
        `Merged: +${added.profiles} profiles, +${added.shiftLogs} shifts, +${added.skillLogs} skills, +${added.sites} sites`
      );
    }

    setPendingImport(null);
    setShowImportChoice(false);
  };

  const handleReset = () => {
    const newState = resetState();
    updateState(() => newState);
    setShowResetConfirm(false);
    showToast('All data reset to demo defaults');
  };

  const handleResetOnboarding = () => {
    updateState(prev => ({ ...prev, hasSeenOnboarding: false }));
    showToast('Onboarding reset — reload the page to see it again.');
  };

  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);

  return (
    <div className="max-w-4xl mx-auto md:ml-64">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary-500" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your ClinTrack data and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Data Management
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Export Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download a backup of all your data as a JSON file. We recommend weekly backups.
              </p>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Backup
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-2">Import Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Restore data from a backup file. You can choose to <strong>replace</strong> everything or <strong>merge</strong> new records by ID.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            App Information
          </h2>

          <div className="space-y-2 text-sm">
            {[
              ['Version', state.version],
              ['Active Profile', activeProfile ? `${activeProfile.name} (${activeProfile.role})` : '—'],
              ['Profiles', state.profiles.length],
              ['Programs', state.programs.length],
              ['Clinical Sites', state.sites.length],
              ['Requirement Templates', state.requirementTemplates.length],
              ['Shift Logs', state.shiftLogs.length],
              ['Skill Logs', state.skillLogs.length],
              ['Approvals', state.approvals.length],
              ['Audit Events', state.audit.length],
            ].map(([label, value], i, arr) => (
              <div key={label as string} className={`flex justify-between py-2 ${i < arr.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <span className="text-gray-600">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            Onboarding
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Reset onboarding to see the welcome screen again on next load.
          </p>
          <button
            onClick={handleResetOnboarding}
            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Onboarding
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Danger Zone
          </h2>

          <div>
            <h3 className="font-semibold text-red-900 mb-2">Reset Demo Data</h3>
            <p className="text-sm text-red-800 mb-3">
              This will permanently delete all your data and reset the app to its initial demo state.
              <strong> This action cannot be undone!</strong> Export a backup first if needed.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            About ClinTrack
          </h2>
          <p className="text-sm opacity-90 mb-3">
            ClinTrack is a Progressive Web App designed for EMS and Nursing students to track
            clinical requirements, shift hours, skills, and scheduling. Built with privacy in mind,
            all data is stored locally on your device.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Privacy-First</span>
            <span>📱 Mobile-Optimized</span>
            <span>📡 Works Offline</span>
          </div>
        </div>
      </div>

      {/* Import Mode Choice Modal */}
      {showImportChoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Import Mode
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-800 mb-4">How would you like to import the backup?</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => executeImport('replace')}
                  className="w-full text-left p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <span className="font-semibold text-red-700">Replace All</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Discard current data and replace with imported backup entirely.
                  </p>
                </button>
                <button
                  onClick={() => executeImport('merge')}
                  className="w-full text-left p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <span className="font-semibold text-green-700">Merge</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep existing data and add new records from the backup. Duplicate IDs are updated.
                  </p>
                </button>
              </div>

              <button
                onClick={() => { setShowImportChoice(false); setPendingImport(null); }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trash2 className="w-6 h-6" />
                Confirm Reset
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-800 mb-4">
                Are you absolutely sure you want to reset all data? This will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-6">
                <li>Delete all clinical requirements</li>
                <li>Delete all shift and skill logs</li>
                <li>Reset to default profiles and sites</li>
                <li>Clear all progress and notes</li>
              </ul>
              <p className="text-red-600 font-semibold mb-6">This action cannot be undone!</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
