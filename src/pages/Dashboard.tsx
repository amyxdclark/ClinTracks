import { useApp } from '../AppContext';

const Dashboard = () => {
  const { state } = useApp();
  
  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isStudent = currentUser?.role === 'Student';
  
  // Get user-specific data
  const userProgress = state.studentProgress.filter(
    p => p.studentId === state.activeProfileId
  );
  const userShifts = state.shiftLogs.filter(
    s => s.studentId === state.activeProfileId
  );
  
  // Calculate stats
  const totalHours = userShifts.reduce((sum, shift) => sum + shift.computedHours, 0);
  const completedRequirements = userProgress.filter(p => p.status === 'completed').length;
  const pendingApprovals = isStudent
    ? state.shiftLogs.filter(s => s.studentId === state.activeProfileId && s.status === 'submitted').length
    : state.shiftLogs.filter(s => s.status === 'submitted' && s.preceptorId === state.activeProfileId).length;
  
  // For preceptors/coordinators/admins, show pending items
  const pendingShifts = !isStudent
    ? state.shiftLogs.filter(s => s.status === 'submitted' && s.preceptorId === state.activeProfileId).length
    : 0;

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) => (
    <div className={`${color} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <span className="text-5xl opacity-80">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto md:ml-64">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.name}! 👋
        </h1>
        <p className="text-gray-600">
          {isStudent
            ? "Track your clinical progress and manage your requirements"
            : `Review and approve submissions as a ${currentUser?.role}`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isStudent ? (
          <>
            <StatCard
              icon="⏰"
              label="Total Hours"
              value={totalHours}
              color="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
            />
            <StatCard
              icon="✅"
              label="Completed Requirements"
              value={completedRequirements}
              color="bg-gradient-to-br from-green-400 to-green-600 text-white"
            />
            <StatCard
              icon="📋"
              label="Total Requirements"
              value={userProgress.length}
              color="bg-gradient-to-br from-purple-400 to-purple-600 text-white"
            />
            <StatCard
              icon="⏳"
              label="Pending Approval"
              value={pendingApprovals}
              color="bg-gradient-to-br from-orange-400 to-orange-600 text-white"
            />
          </>
        ) : (
          <>
            <StatCard
              icon="📋"
              label="Pending Requirements"
              value={pendingApprovals}
              color="bg-gradient-to-br from-orange-400 to-orange-600 text-white"
            />
            <StatCard
              icon="⏰"
              label="Pending Shifts"
              value={pendingShifts}
              color="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
            />
            <StatCard
              icon="👥"
              label="Total Students"
              value={state.profiles.filter(u => u.role === 'Student').length}
              color="bg-gradient-to-br from-purple-400 to-purple-600 text-white"
            />
            <StatCard
              icon="🏥"
              label="Clinical Sites"
              value={state.sites.length}
              color="bg-gradient-to-br from-green-400 to-green-600 text-white"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Recent Activity
        </h2>
        
        {isStudent ? (
          <div className="space-y-3">
            {userProgress.slice(0, 5).map(prog => {
              const template = state.requirementTemplates.find(t => t.id === prog.templateId);
              return (
                <div key={prog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{template?.name}</p>
                    <p className="text-sm text-gray-600">{template?.category} — {prog.currentCount} / {template?.targetCount} {template?.unit}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    prog.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {prog.status}
                  </span>
                </div>
              );
            })}
            {userProgress.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No requirements yet. Start by adding your first requirement!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {state.shiftLogs
              .filter(s => s.status === 'submitted' && s.preceptorId === state.activeProfileId)
              .slice(0, 5)
              .map(shift => {
                const student = state.profiles.find(u => u.id === shift.studentId);
                const site = state.sites.find(s => s.id === shift.siteId);
                return (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student?.name}</p>
                      <p className="text-sm text-gray-600">{site?.name} — {shift.computedHours.toFixed(1)} hrs</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Needs Review
                    </span>
                  </div>
                );
              })}
            {state.shiftLogs.filter(s => s.status === 'submitted' && s.preceptorId === state.activeProfileId).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No pending reviews at this time.
              </p>
            )}
          </div>
        )}
      </div>

      {/* PHI Reminder */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
        <div className="flex">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Privacy Reminder</h3>
            <p className="text-sm text-yellow-700">
              Remember: Never include Protected Health Information (PHI) in your notes or records. 
              Use generic descriptions only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
