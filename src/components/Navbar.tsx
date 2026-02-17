import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { UserProfile, Role } from '../types';
import {
  LayoutDashboard,
  ClipboardCheck,
  Clock,
  Star,
  Calendar,
  Inbox,
  Settings,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface NavbarProps {
  onProfileClick: () => void;
  currentProfile?: UserProfile;
}

const allNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/requirements', label: 'Requirements', icon: ClipboardCheck },
  { path: '/shift-hours', label: 'Shift Hours', icon: Clock },
  { path: '/skills', label: 'Skills', icon: Star },
  { path: '/scheduling', label: 'Schedule', icon: Calendar },
  { path: '/approvals', label: 'Approvals', icon: Inbox },
  { path: '/admin', label: 'Admin Setup', icon: Settings },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

/** Return nav items visible for the given role */
const getNavForRole = (role: Role): NavItem[] => {
  const visiblePaths: Record<Role, string[]> = {
    Student: ['/dashboard', '/requirements', '/shift-hours', '/skills', '/scheduling', '/help'],
    Preceptor: ['/dashboard', '/requirements', '/shift-hours', '/skills', '/approvals', '/help'],
    Instructor: ['/dashboard', '/requirements', '/shift-hours', '/skills', '/approvals', '/help'],
    Coordinator: ['/dashboard', '/requirements', '/scheduling', '/approvals', '/admin', '/help'],
    ProgramAdmin: ['/dashboard', '/requirements', '/approvals', '/admin', '/help'],
  };
  const paths = visiblePaths[role];
  return allNavItems.filter(item => paths.includes(item.path));
};

/** Mobile bottom bar shows at most 5 items */
const getMobileNav = (role: Role): NavItem[] => {
  const mobileOrder: Record<Role, string[]> = {
    Student: ['/dashboard', '/shift-hours', '/skills', '/scheduling', '/requirements'],
    Preceptor: ['/dashboard', '/shift-hours', '/skills', '/approvals', '/requirements'],
    Instructor: ['/dashboard', '/shift-hours', '/skills', '/approvals', '/requirements'],
    Coordinator: ['/dashboard', '/scheduling', '/approvals', '/admin', '/requirements'],
    ProgramAdmin: ['/dashboard', '/approvals', '/admin', '/requirements', '/help'],
  };
  const paths = mobileOrder[role];
  return allNavItems.filter(item => paths.includes(item.path));
};

const Navbar = ({ onProfileClick, currentProfile }: NavbarProps) => {
  const location = useLocation();
  const role = currentProfile?.role ?? 'Student';

  const sidebarItems = useMemo(() => getNavForRole(role), [role]);
  const mobileItems = useMemo(() => getMobileNav(role), [role]);

  const isActive = (path: string) => location.pathname === path;

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
              {currentProfile?.name || 'User'}
            </span>
            <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
              {currentProfile?.role || 'Student'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-around items-center py-2">
          {mobileItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
                title={item.label}
              >
                <Icon size={20} />
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex md:flex-col fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
        <div className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-primary-600 bg-primary-50 font-semibold'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Settings at bottom of sidebar */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'text-primary-600 bg-primary-50 font-semibold'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
