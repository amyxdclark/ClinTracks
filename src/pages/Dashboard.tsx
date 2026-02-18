import { Link } from 'react-router-dom';
import {
  Clock,
  ClipboardCheck,
  Calendar,
  FileCheck,
  Plus,
  ArrowRight,
  AlertTriangle,
  User,
  BookOpen,
  Activity,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { useApp } from '../AppContext';
import type { RequirementTemplate, ShiftLog } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient: string;
}

const StatCard = ({ icon, label, value, gradient }: StatCardProps) => (
  <div className={`${gradient} rounded-2xl p-5 shadow-lg text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const QuickAction = ({ to, icon, label, description, color }: QuickActionProps) => (
  <Link
    to={to}
    className={`${color} group flex items-center gap-4 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0`}
  >
    <div className="shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 truncate">{description}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
  </Link>
);

interface ProgressRowProps {
  template: RequirementTemplate;
  current: number;
  target: number;
}

const ProgressRow = ({ template, current, target }: ProgressRowProps) => {
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const isComplete = pct >= 100;
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-gray-900 text-sm">{template.name}</p>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isComplete ? 'Complete' : `${pct}%`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-blue-400 to-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {current} / {target} {template.unit}
      </p>
    </div>
  );
};

const isShiftLog = (item: ShiftLog | { skillName: string }): item is ShiftLog =>
  'computedHours' in item;

const Dashboard = () => {
  const { state } = useApp();

  const currentUser = state.profiles.find((p) => p.id === state.activeProfileId);
  const role = currentUser?.role ?? 'Student';
  const isStudent = role === 'Student';
  const isPreceptorOrInstructor = role === 'Preceptor' || role === 'Instructor';
  const isAdminOrCoordinator = role === 'Coordinator' || role === 'ProgramAdmin';

  // Student data
  const programTemplates = isStudent && currentUser?.programId
    ? state.requirementTemplates.filter((t) => t.programId === currentUser.programId)
    : [];

  const studentShifts = state.shiftLogs.filter((s) => s.studentId === state.activeProfileId);

  const studentSkills = state.skillLogs.filter((s) => s.studentId === state.activeProfileId);

  // Compute requirement progress from actual logs
  const requirementProgress = programTemplates.map((template) => {
    let current = 0;
    if (template.category === 'Hours') {
      if (template.unit === 'hours') {
        current = studentShifts
          .filter((s) => s.status === 'approved')
          .reduce((sum, s) => sum + s.computedHours, 0);
      } else {
        current = studentShifts.filter((s) => s.status === 'approved').length;
      }
    } else if (template.category === 'Skills') {
      current = studentSkills.filter((s) => s.status === 'approved').length;
    } else {
      const prog = state.studentProgress.find(
        (p) => p.studentId === state.activeProfileId && p.templateId === template.id,
      );
      current = prog?.currentCount ?? 0;
    }
    return { template, current, target: template.targetCount };
  });

  const totalApprovedHours = studentShifts.filter((s) => s.status === 'approved').reduce((sum, s) => sum + s.computedHours, 0);
  const completedCount = requirementProgress.filter((r) => r.current >= r.target).length;
  const studentPending = studentShifts.filter((s) => s.status === 'submitted').length +
    studentSkills.filter((s) => s.status === 'submitted').length;

  // Upcoming scheduled shifts for student
  const upcomingSchedules = (() => {
    const today = new Date().toISOString().split('T')[0];
    return state.scheduleRequests
      .filter(
        (sr) =>
          sr.studentId === state.activeProfileId &&
          sr.status === 'approved' &&
          sr.date >= today,
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  })();

  // Preceptor / Instructor data
  const pendingShiftReviews = state.shiftLogs.filter(
    (s) => s.status === 'submitted' && s.preceptorId === state.activeProfileId,
  );
  const pendingSkillReviews = state.skillLogs.filter((s) => s.status === 'submitted');
  const recentSubmissions = [...state.shiftLogs, ...state.skillLogs]
    .filter((s) => s.status === 'submitted')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Admin / Coordinator data
  const totalStudents = state.profiles.filter((p) => p.role === 'Student').length;
  const allPendingItems =
    state.shiftLogs.filter((s) => s.status === 'submitted').length +
    state.skillLogs.filter((s) => s.status === 'submitted').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Welcome back, {currentUser?.name ?? 'User'}!
        </h1>
        <p className="text-gray-500 text-lg">
          {isStudent && 'Track your clinical progress and requirements.'}
          {isPreceptorOrInstructor && `Review and approve student submissions as ${role}.`}
          {isAdminOrCoordinator && 'Manage programs, students, and approvals.'}
        </p>
      </div>

      {/* ─── STUDENT DASHBOARD ─── */}
      {isStudent && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Clock className="w-8 h-8" />}
              label="Approved Hours"
              value={totalApprovedHours.toFixed(1)}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={<FileCheck className="w-8 h-8" />}
              label="Completed"
              value={`${completedCount}/${programTemplates.length}`}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
            <StatCard
              icon={<Activity className="w-8 h-8" />}
              label="Pending Review"
              value={studentPending}
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StatCard
              icon={<Calendar className="w-8 h-8" />}
              label="Upcoming Shifts"
              value={upcomingSchedules.length}
              gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
            />
          </div>

          {/* Quick actions */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <QuickAction
              to="/shift-hours"
              icon={<Clock className="w-7 h-7 text-blue-600" />}
              label="Log Shift"
              description="Record a new shift"
              color="bg-blue-50 border border-blue-200"
            />
            <QuickAction
              to="/skills"
              icon={<ClipboardCheck className="w-7 h-7 text-emerald-600" />}
              label="Log Skill"
              description="Record a completed skill"
              color="bg-emerald-50 border border-emerald-200"
            />
            <QuickAction
              to="/requirements"
              icon={<BookOpen className="w-7 h-7 text-purple-600" />}
              label="View Requirements"
              description="See all program requirements"
              color="bg-purple-50 border border-purple-200"
            />
          </div>

          {/* Requirement progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Requirement Progress
            </h2>
            {requirementProgress.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {requirementProgress.map(({ template, current, target }) => (
                  <ProgressRow key={template.id} template={template} current={current} target={target} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No requirement templates found for your program.
              </p>
            )}
          </div>

          {/* Upcoming scheduled shifts */}
          {upcomingSchedules.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" /> Upcoming Shifts
              </h2>
              <div className="space-y-3">
                {upcomingSchedules.map((sr) => {
                  const site = state.sites.find((s) => s.id === sr.siteId);
                  return (
                    <div
                      key={sr.id}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{site?.name ?? 'Unknown Site'}</p>
                        <p className="text-sm text-gray-500">{sr.date}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        Scheduled
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── PRECEPTOR / INSTRUCTOR DASHBOARD ─── */}
      {isPreceptorOrInstructor && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<ClipboardCheck className="w-8 h-8" />}
              label="Pending Shift Reviews"
              value={pendingShiftReviews.length}
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StatCard
              icon={<Activity className="w-8 h-8" />}
              label="Pending Skill Reviews"
              value={pendingSkillReviews.length}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={<User className="w-8 h-8" />}
              label="Total Students"
              value={totalStudents}
              gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Recent Submissions
            </h2>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((item) => {
                  const student = state.profiles.find((p) => p.id === item.studentId);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{student?.name ?? 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          {isShiftLog(item) ? `Shift — ${item.computedHours.toFixed(1)} hrs` : `Skill — ${item.skillName}`}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 shrink-0">
                        Needs Review
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No pending submissions.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <QuickAction
              to="/shift-hours"
              icon={<Clock className="w-7 h-7 text-blue-600" />}
              label="Review Shifts"
              description="Approve or reject shift logs"
              color="bg-blue-50 border border-blue-200"
            />
            <QuickAction
              to="/skills"
              icon={<ClipboardCheck className="w-7 h-7 text-emerald-600" />}
              label="Review Skills"
              description="Approve or reject skill logs"
              color="bg-emerald-50 border border-emerald-200"
            />
          </div>
        </>
      )}

      {/* ─── COORDINATOR / PROGRAM ADMIN DASHBOARD ─── */}
      {isAdminOrCoordinator && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<BookOpen className="w-8 h-8" />}
              label="Programs"
              value={state.programs.length}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={<User className="w-8 h-8" />}
              label="Total Students"
              value={totalStudents}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
            <StatCard
              icon={<AlertTriangle className="w-8 h-8" />}
              label="Pending Items"
              value={allPendingItems}
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              label="Sites"
              value={state.sites.length}
              gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
            />
          </div>

          {/* Programs overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" /> Programs Overview
            </h2>
            {state.programs.length > 0 ? (
              <div className="space-y-3">
                {state.programs.map((program) => {
                  const enrolledStudents = state.profiles.filter(
                    (p) => p.role === 'Student' && p.programId === program.id,
                  ).length;
                  const templates = state.requirementTemplates.filter(
                    (t) => t.programId === program.id,
                  ).length;
                  return (
                    <div key={program.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{program.name}</p>
                        <p className="text-sm text-gray-500">{program.description}</p>
                      </div>
                      <div className="text-right text-sm shrink-0 ml-4">
                        <p className="text-gray-700 font-medium">{enrolledStudents} students</p>
                        <p className="text-gray-500">{templates} requirements</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No programs configured.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <QuickAction
              to="/requirements"
              icon={<BookOpen className="w-7 h-7 text-purple-600" />}
              label="Manage Requirements"
              description="View and edit templates"
              color="bg-purple-50 border border-purple-200"
            />
            <QuickAction
              to="/shift-hours"
              icon={<Clock className="w-7 h-7 text-blue-600" />}
              label="All Shift Logs"
              description="View all student shift logs"
              color="bg-blue-50 border border-blue-200"
            />
            <QuickAction
              to="/settings"
              icon={<Settings className="w-7 h-7 text-gray-600" />}
              label="Settings"
              description="App configuration"
              color="bg-gray-50 border border-gray-200"
            />
          </div>
        </>
      )}

      {/* PHI Reminder */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl shadow mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">Privacy Reminder</h3>
            <p className="text-sm text-amber-700">
              Never include Protected Health Information (PHI) in your notes or records. Use generic
              descriptions only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
