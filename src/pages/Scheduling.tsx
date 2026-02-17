import { useApp } from '../AppContext';

const Scheduling = () => {
  const { state } = useApp();
  
  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const isCoordinator = currentUser?.role === 'Coordinator' || currentUser?.role === 'ProgramAdmin';

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
          return (
            <div key={site.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{site.name}</h3>
                  {site.address && (
                    <p className="text-sm text-gray-600">{site.address}</p>
                  )}
                  {site.notes && (
                    <p className="text-sm text-gray-500 mt-1">{site.notes}</p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  Available
                </span>
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
