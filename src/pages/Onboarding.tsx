import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

const Onboarding = () => {
  const { updateState } = useApp();
  const navigate = useNavigate();

  const completeOnboarding = () => {
    updateState(prev => ({
      ...prev,
      hasSeenOnboarding: true,
    }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500 text-white p-8 text-center">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-4xl font-bold mb-2">Welcome to ClinTrack!</h1>
          <p className="text-lg opacity-90">Your Clinical Requirements Companion</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Track Requirements</h3>
                <p className="text-sm text-gray-600">
                  Log and manage your clinical skills and requirements with ease
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
              <span className="text-3xl">⏰</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Log Shift Hours</h3>
                <p className="text-sm text-gray-600">
                  Record your clinical hours and get them approved by preceptors
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
              <span className="text-3xl">📅</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Schedule Sites</h3>
                <p className="text-sm text-gray-600">
                  View site capacity and coordinate clinical placements
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-pink-50 rounded-lg">
              <span className="text-3xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">PHI Protection</h3>
                <p className="text-sm text-gray-600">
                  Built-in reminders to keep patient information confidential
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Important Privacy Notice</h4>
                <p className="text-sm text-yellow-700">
                  <strong>Never include Protected Health Information (PHI)</strong> such as patient names, 
                  medical record numbers, or other identifiable information in your notes or records.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Quick Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Switch between roles using the profile button</li>
              <li>• All data is stored locally on your device</li>
              <li>• Export backups regularly from Settings</li>
              <li>• Works offline as a Progressive Web App</li>
            </ul>
          </div>

          <button
            onClick={completeOnboarding}
            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
