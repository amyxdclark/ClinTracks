import { useApp } from '../AppContext';
import type { UserProfile, Role } from '../types';
import {
  GraduationCap,
  Stethoscope,
  BookOpen,
  BarChart,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ProfileSwitcherProps {
  onClose: () => void;
}

const roleConfig: Record<Role, { color: string; Icon: LucideIcon }> = {
  Student: { color: 'bg-blue-100 text-blue-800 border-blue-300', Icon: GraduationCap },
  Preceptor: { color: 'bg-green-100 text-green-800 border-green-300', Icon: Stethoscope },
  Instructor: { color: 'bg-teal-100 text-teal-800 border-teal-300', Icon: BookOpen },
  Coordinator: { color: 'bg-purple-100 text-purple-800 border-purple-300', Icon: BarChart },
  ProgramAdmin: { color: 'bg-red-100 text-red-800 border-red-300', Icon: Shield },
};

const ProfileSwitcher = ({ onClose }: ProfileSwitcherProps) => {
  const { state, updateState } = useApp();

  const switchProfile = (userId: string) => {
    updateState(prev => ({
      ...prev,
      activeProfileId: userId,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Switch Profile</h2>
          <p className="text-sm opacity-90">
            Select a role to simulate different user experiences
          </p>
        </div>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {state.profiles.map((user: UserProfile) => {
            const { color, Icon } = roleConfig[user.role];
            const active = user.id === state.activeProfileId;
            return (
              <button
                key={user.id}
                onClick={() => switchProfile(user.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  active
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={28} className={color.split(' ')[1]} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
                    {user.role}
                  </span>
                </div>
                {active && (
                  <div className="mt-2 text-xs text-primary-600 font-medium">
                    ✓ Currently Active
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSwitcher;
