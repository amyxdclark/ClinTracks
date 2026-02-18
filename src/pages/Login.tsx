import { useState } from 'react';
import { useApp } from '../AppContext';
import type { Role } from '../types';
import {
  GraduationCap,
  Stethoscope,
  BookOpen,
  BarChart,
  Shield,
  LogIn,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const roleConfig: Record<Role, { color: string; bg: string; Icon: LucideIcon }> = {
  Student: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', Icon: GraduationCap },
  Preceptor: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', Icon: Stethoscope },
  Instructor: { color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', Icon: BookOpen },
  Coordinator: { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', Icon: BarChart },
  ProgramAdmin: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', Icon: Shield },
};

const Login = () => {
  const { state, login } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');

  const filteredProfiles = state.profiles.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || p.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roles: (Role | 'all')[] = ['all', 'Student', 'Preceptor', 'Instructor', 'Coordinator', 'ProgramAdmin'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🏥</span>
            <h1 className="text-4xl font-bold text-gray-900">ClinTrack</h1>
          </div>
          <p className="text-gray-600 text-lg">Clinical Tracking for Healthcare Education</p>
          <p className="text-gray-400 text-sm mt-1">Select your profile to sign in</p>
        </div>

        {/* Search and filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedRole === r
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {r === 'all' ? 'All Roles' : r === 'ProgramAdmin' ? 'Admin' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Profile list */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="max-h-[28rem] overflow-y-auto divide-y divide-gray-100">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map(profile => {
                const { color, bg, Icon } = roleConfig[profile.role];
                const program = state.programs.find(p => p.id === profile.programId);
                return (
                  <button
                    key={profile.id}
                    onClick={() => login(profile.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={`p-2.5 rounded-xl border ${bg} shrink-0`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{profile.name}</p>
                      <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                      {program && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{program.name}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${bg} ${color} shrink-0`}>
                      {profile.role === 'ProgramAdmin' ? 'Admin' : profile.role}
                    </span>
                    <LogIn className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center text-gray-400">
                No profiles match your search.
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo application — select any profile to explore the clinical tracking system.
        </p>
      </div>
    </div>
  );
};

export default Login;
