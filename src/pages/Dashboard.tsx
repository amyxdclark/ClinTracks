import { useApp } from '../AppContext';

const Dashboard = () => {
  const { state } = useApp();
  
  const currentUser = state.users.find(u => u.id === state.currentUserId);
  const isStudent = currentUser?.role === 'Student';
  
  // Get user-specific data
  const userRequirements = state.requirements.filter(
    r => r.studentId === state.currentUserId
  );
  const userShifts = state.shiftHours.filter(
    s => s.studentId === state.currentUserId
  );
  
  // Calculate stats
  const totalHours = userShifts.reduce((sum, shift) => sum + shift.hours, 0);
  const approvedRequirements = userRequirements.filter(r => r.status === 'approved').length;
  const pendingApprovals = isStudent
    ? userRequirements.filter(r => r.status === 'submitted').length
    : state.requirements.filter(r => r.status === 'submitted' && r.preceptorId === state.currentUserId).length;
  
  // For preceptors/coordinators/admins, show pending items
  const pendingShifts = !isStudent
    ? state.shiftHours.filter(s => s.status === 'submitted' && s.preceptorId === state.currentUserId).length
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
              label="Approved Requirements"
              value={approvedRequirements}
              color="bg-gradient-to-br from-green-400 to-green-600 text-white"
            />
            <StatCard
              icon="📋"
              label="Total Requirements"
              value={userRequirements.length}
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
              value={state.users.filter(u => u.role === 'Student').length}
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
            {userRequirements.slice(0, 5).map(req => {
              const skill = state.skills.find(s => s.id === req.skillId);
              return (
                <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{skill?.name}</p>
                    <p className="text-sm text-gray-600">{skill?.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    req.status === 'approved' ? 'bg-green-100 text-green-800' :
                    req.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              );
            })}
            {userRequirements.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No requirements yet. Start by adding your first requirement!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {state.requirements
              .filter(r => r.status === 'submitted' && r.preceptorId === state.currentUserId)
              .slice(0, 5)
              .map(req => {
                const student = state.users.find(u => u.id === req.studentId);
                const skill = state.skills.find(s => s.id === req.skillId);
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student?.name}</p>
                      <p className="text-sm text-gray-600">{skill?.name}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Needs Review
                    </span>
                  </div>
                );
              })}
            {state.requirements.filter(r => r.status === 'submitted' && r.preceptorId === state.currentUserId).length === 0 && (
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
