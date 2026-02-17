import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto md:ml-64">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Guide ❓</h1>
        <p className="text-gray-600">Learn how to use ClinTrack effectively</p>
      </div>

      <div className="space-y-6">
        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Quick Start Guide
          </h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <h3 className="font-semibold mb-1">1. Choose Your Profile</h3>
              <p className="text-sm">Click your name in the top right to switch between roles and explore different perspectives.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">2. Track Requirements</h3>
              <p className="text-sm">Add clinical requirements, submit them for review, and track your progress toward completion.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">3. Log Shift Hours</h3>
              <p className="text-sm">Record your clinical hours at different sites and get them approved by your preceptor.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">4. Review Sites</h3>
              <p className="text-sm">Check site capacity and availability for scheduling clinical placements.</p>
            </div>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👥</span>
            User Roles
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center">
                <span className="mr-2">🎓</span>Student
              </h3>
              <p className="text-sm text-blue-800">
                Log clinical requirements and shift hours, submit for approval, and track progress toward program completion.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-1 flex items-center">
                <span className="mr-2">👨‍⚕️</span>Preceptor
              </h3>
              <p className="text-sm text-green-800">
                Review and approve student requirements and shift hours. Provide feedback and verify clinical competencies.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-1 flex items-center">
                <span className="mr-2">📊</span>Coordinator
              </h3>
              <p className="text-sm text-purple-800">
                Manage site capacity, coordinate student placements, and oversee program requirements across all students.
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-1 flex items-center">
                <span className="mr-2">⚙️</span>Admin
              </h3>
              <p className="text-sm text-red-800">
                Full system access including user management, site configuration, and data oversight.
              </p>
            </div>
          </div>
        </div>

        {/* PHI Information */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center">
            <span className="mr-2">🚫</span>
            Protected Health Information (PHI)
          </h2>
          <div className="space-y-3 text-red-800">
            <p className="font-semibold">
              NEVER include the following in your notes or records:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Patient names or initials</li>
              <li>Medical record numbers</li>
              <li>Dates of birth or specific ages</li>
              <li>Addresses or contact information</li>
              <li>Social security numbers</li>
              <li>Any other identifying patient information</li>
            </ul>
            <p className="text-sm mt-3">
              <strong>Use generic descriptions only:</strong> Instead of "Patient John Smith, age 45," 
              write "Male patient, middle-aged adult."
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💾</span>
              <div>
                <h3 className="font-semibold">Automatic Saving</h3>
                <p className="text-sm text-gray-600">All data is automatically saved to your browser's local storage.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold">Mobile-First Design</h3>
                <p className="text-sm text-gray-600">Optimized for use on phones and tablets in clinical settings.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h3 className="font-semibold">Import/Export</h3>
                <p className="text-sm text-gray-600">
                  Backup and restore your data using the <Link to="/settings" className="text-primary-600 underline">Settings</Link> page.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📡</span>
              <div>
                <h3 className="font-semibold">Works Offline</h3>
                <p className="text-sm text-gray-600">Progressive Web App technology allows offline access.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💬</span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Q: Where is my data stored?</h3>
              <p className="text-sm text-gray-600">
                All data is stored locally in your browser's localStorage. Nothing is sent to external servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Q: Can I use this on multiple devices?</h3>
              <p className="text-sm text-gray-600">
                Use the Export feature on one device and Import on another to transfer your data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Q: What if I clear my browser data?</h3>
              <p className="text-sm text-gray-600">
                Your ClinTrack data will be deleted. Regular backups via Export are recommended.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Q: How do I switch between roles?</h3>
              <p className="text-sm text-gray-600">
                Click your name in the top right corner to open the profile switcher and select a different role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
