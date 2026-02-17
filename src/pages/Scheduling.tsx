import { useApp } from '../AppContext';

const Scheduling = () => {
  const { state } = useApp();
  
  const currentUser = state.users.find(u => u.id === state.currentUserId);
  const isCoordinator = currentUser?.role === 'Coordinator' || currentUser?.role === 'Admin';

  return (
    <div className="max-w-6xl mx-auto md:ml-64">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Capacity & Scheduling 📅</h1>
        <p className="text-gray-600">
          {isCoordinator 
            ? 'Manage clinical site capacity and student placements'
            : 'View available clinical sites and current capacity'
          }
        </p>
      </div>

      <div className="space-y-4">
        {state.sites.map(site => {
          const percentFull = (site.currentStudents / site.capacity) * 100;
          const coordinator = state.users.find(u => u.id === site.coordinatorId);
          
          return (
            <div key={site.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{site.name}</h3>
                  <p className="text-sm text-gray-600">
                    Coordinator: {coordinator?.name || 'Unassigned'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {site.currentStudents} / {site.capacity}
                  </div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Capacity</span>
                  <span>{percentFull.toFixed(0)}% Full</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      percentFull >= 100 ? 'bg-red-500' :
                      percentFull >= 80 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentFull, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  percentFull >= 100 ? 'bg-red-100 text-red-800' :
                  percentFull >= 80 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {percentFull >= 100 ? 'Full' : percentFull >= 80 ? 'Nearly Full' : 'Available'}
                </span>
                
                {percentFull < 100 && (
                  <span className="text-sm text-gray-600">
                    {site.capacity - site.currentStudents} spots remaining
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isCoordinator && (
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Note for Students</h3>
              <p className="text-sm text-blue-700">
                Contact your coordinator to request placement at a specific site. 
                Site assignments are managed by coordinators based on capacity and program requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
