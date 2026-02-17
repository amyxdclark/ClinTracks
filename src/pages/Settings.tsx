import { useState } from 'react';
import { useApp } from '../AppContext';
import { exportState, importState, resetState } from '../storage';

const Settings = () => {
  const { state, updateState } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    exportState(state);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedState = await importState(file);
      updateState(() => importedState);
      alert('Data imported successfully!');
    } catch (err) {
      alert('Failed to import data. Please check the file and try again.');
    }
    e.target.value = '';
  };

  const handleReset = () => {
    const newState = resetState();
    updateState(() => newState);
    setShowResetConfirm(false);
    alert('Data reset to defaults');
  };

  const handleResetOnboarding = () => {
    updateState(prev => ({
      ...prev,
      hasSeenOnboarding: false,
    }));
    alert('Onboarding reset. Reload the page to see it again.');
  };

  return (
    <div className="max-w-4xl mx-auto md:ml-64">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings ⚙️</h1>
        <p className="text-gray-600">Manage your ClinTrack data and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💾</span>
            Data Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Export Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download a backup of all your data as a JSON file. This file can be imported later to restore your data.
              </p>
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                📥 Export Backup
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-2">Import Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Restore your data from a previously exported backup file. This will replace all current data.
              </p>
              <label className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer">
                📤 Import Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">ℹ️</span>
            App Information
          </h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">{state.version}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Total Requirement Templates</span>
              <span className="font-medium">{state.requirementTemplates.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Total Shift Logs</span>
              <span className="font-medium">{state.shiftLogs.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Profiles</span>
              <span className="font-medium">{state.profiles.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Clinical Sites</span>
              <span className="font-medium">{state.sites.length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Skill Logs</span>
              <span className="font-medium">{state.skillLogs.length}</span>
            </div>
          </div>
        </div>

        {/* Onboarding */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎓</span>
            Onboarding
          </h2>
          
          <p className="text-sm text-gray-600 mb-3">
            Reset onboarding to see the welcome screen again on next load.
          </p>
          <button
            onClick={handleResetOnboarding}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reset Onboarding
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Danger Zone
          </h2>
          
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Reset All Data</h3>
            <p className="text-sm text-red-800 mb-3">
              This will permanently delete all your data and reset the app to its initial state. 
              <strong> This action cannot be undone!</strong> Export a backup first if needed.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🗑️ Reset All Data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            <span className="mr-2">🏥</span>
            About ClinTrack
          </h2>
          <p className="text-sm opacity-90 mb-3">
            ClinTrack is a Progressive Web App designed for EMS and Nursing students to track 
            clinical requirements, shift hours, skills, and scheduling. Built with privacy in mind, 
            all data is stored locally on your device.
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span>🔒 Privacy-First</span>
            <span>📱 Mobile-Optimized</span>
            <span>📡 Works Offline</span>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-2">⚠️</span>
                Confirm Reset
              </h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-800 mb-4">
                Are you absolutely sure you want to reset all data? This will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-6">
                <li>Delete all clinical requirements</li>
                <li>Delete all shift hours</li>
                <li>Reset to default users and sites</li>
                <li>Clear all progress and notes</li>
              </ul>
              <p className="text-red-600 font-semibold mb-6">
                This action cannot be undone!
              </p>

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
