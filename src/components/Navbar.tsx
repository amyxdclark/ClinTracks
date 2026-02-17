import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext';

interface NavbarProps {
  onProfileClick: () => void;
}

const Navbar = ({ onProfileClick }: NavbarProps) => {
  const location = useLocation();
  const { state } = useApp();
  
  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  
  const navItems = [
    { path: '/dashboard', label: '🏠', tooltip: 'Dashboard' },
    { path: '/requirements', label: '📋', tooltip: 'Requirements' },
    { path: '/shift-hours', label: '⏰', tooltip: 'Shift Hours' },
    { path: '/skills', label: '⭐', tooltip: 'Skills' },
    { path: '/scheduling', label: '📅', tooltip: 'Scheduling' },
    { path: '/help', label: '❓', tooltip: 'Help' },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-primary-600">ClinTrack</span>
          </Link>
          
          <button
            onClick={onProfileClick}
            className="flex items-center space-x-2 bg-primary-100 hover:bg-primary-200 px-3 py-2 rounded-lg transition-colors"
            title="Switch Profile"
          >
            <span className="text-sm font-medium text-primary-800">
              {currentUser?.name || 'User'}
            </span>
            <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
              {currentUser?.role || 'Student'}
            </span>
          </button>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
              title={item.tooltip}
            >
              <span className="text-xl">{item.label}</span>
              <span className="text-xs mt-0.5">{item.tooltip}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar navigation */}
      <nav className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{item.label}</span>
              <span>{item.tooltip}</span>
            </Link>
          ))}
          
          <div className="pt-4 border-t border-gray-200">
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/settings'
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
