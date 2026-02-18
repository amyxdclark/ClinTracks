import { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  TrendingUp,
  Award,
  Target,
} from 'lucide-react';

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  programId: string;
  cohortId: string;
  totalRequirements: number;
  completedRequirements: number;
  completionPct: number;
  totalApprovedHours: number;
  totalApprovedSkills: number;
  pendingItems: number;
}

const Reports = () => {
  const { state } = useApp();
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');

  const currentUser = state.profiles.find(u => u.id === state.activeProfileId);
  const hasAccess =
    currentUser?.role === 'Instructor' ||
    currentUser?.role === 'Coordinator' ||
    currentUser?.role === 'ProgramAdmin';

  const students = useMemo(() => state.profiles.filter(p => p.role === 'Student'), [state.profiles]);

  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectedProgramId !== 'all') {
      list = list.filter(s => s.programId === selectedProgramId);
    }
    if (selectedCohortId !== 'all') {
      list = list.filter(s => s.cohortId === selectedCohortId);
    }
    return list;
  }, [students, selectedProgramId, selectedCohortId]);

  const availableCohorts = useMemo(() => {
    if (selectedProgramId === 'all') return state.cohorts;
    return state.cohorts.filter(c => c.programId === selectedProgramId);
  }, [state.cohorts, selectedProgramId]);

  const studentSummaries: StudentSummary[] = useMemo(() =>
    filteredStudents.map(student => {
      const templates = state.requirementTemplates.filter(t => t.programId === student.programId);
      const approvedShifts = state.shiftLogs.filter(s => s.studentId === student.id && s.status === 'approved');
      const approvedSkills = state.skillLogs.filter(s => s.studentId === student.id && s.status === 'approved');
      const pendingShifts = state.shiftLogs.filter(s => s.studentId === student.id && s.status === 'submitted').length;
      const pendingSkills = state.skillLogs.filter(s => s.studentId === student.id && s.status === 'submitted').length;

      const totalApprovedHours = approvedShifts.reduce((sum, s) => sum + s.computedHours, 0);

      let completedCount = 0;
      for (const template of templates) {
        let current = 0;
        if (template.category === 'Hours') {
          current = template.unit === 'hours'
            ? totalApprovedHours
            : approvedShifts.length;
        } else if (template.category === 'Skills') {
          current = approvedSkills.length;
        } else {
          const sp = state.studentProgress.find(
            p => p.studentId === student.id && p.templateId === template.id,
          );
          current = sp?.currentCount ?? 0;
        }
        if (current >= template.targetCount) completedCount++;
      }

      const completionPct = templates.length > 0
        ? Math.round((completedCount / templates.length) * 100)
        : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        programId: student.programId ?? '',
        cohortId: student.cohortId ?? '',
        totalRequirements: templates.length,
        completedRequirements: completedCount,
        completionPct,
        totalApprovedHours,
        totalApprovedSkills: approvedSkills.length,
        pendingItems: pendingShifts + pendingSkills,
      };
    }).sort((a, b) => b.completionPct - a.completionPct),
  [filteredStudents, state.requirementTemplates, state.shiftLogs, state.skillLogs, state.studentProgress]);

  // Aggregate stats
  const totalStudentCount = studentSummaries.length;
  const avgCompletion = totalStudentCount > 0
    ? Math.round(studentSummaries.reduce((sum, s) => sum + s.completionPct, 0) / totalStudentCount)
    : 0;
  const totalHoursAcrossStudents = studentSummaries.reduce((sum, s) => sum + s.totalApprovedHours, 0);
  const atRiskStudents = studentSummaries.filter(s => s.completionPct < 25 && s.totalRequirements > 0).length;

  const programName = (pid: string) => state.programs.find(p => p.id === pid)?.name ?? pid;
  const cohortName = (cid: string) => state.cohorts.find(c => c.id === cid)?.name ?? cid;

  const completionColor = (pct: number) => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const completionBadge = (pct: number) => {
    if (pct >= 75) return 'bg-green-100 text-green-800';
    if (pct >= 50) return 'bg-blue-100 text-blue-800';
    if (pct >= 25) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  if (!hasAccess) {
    return (
      <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mt-8">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">Reports are available for Instructors, Coordinators, and Program Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto md:ml-64 px-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-500" /> Student Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of student progress across programs and cohorts
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Users className="w-4 h-4" />
            <span className="text-sm">Students</span>
          </div>
          <p className="text-3xl font-bold">{totalStudentCount}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Avg Completion</span>
          </div>
          <p className="text-3xl font-bold">{avgCompletion}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Total Hours</span>
          </div>
          <p className="text-3xl font-bold">{totalHoursAcrossStudents.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">At Risk</span>
          </div>
          <p className="text-3xl font-bold">{atRiskStudents}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
              value={selectedProgramId}
              onChange={e => { setSelectedProgramId(e.target.value); setSelectedCohortId('all'); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Programs</option>
              {state.programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cohort</label>
            <select
              value={selectedCohortId}
              onChange={e => setSelectedCohortId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Cohorts</option>
              {availableCohorts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-500" /> Student Progress
          </h2>
        </div>

        {studentSummaries.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No students found for the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y">
            {studentSummaries.map(student => (
              <div key={student.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{student.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {programName(student.programId)}
                      {student.cohortId && ` · ${cohortName(student.cohortId)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{student.totalApprovedHours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Target className="w-3.5 h-3.5" />
                      <span>{student.totalApprovedSkills} skills</span>
                    </div>
                    {student.pendingItems > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {student.pendingItems} pending
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${completionBadge(student.completionPct)}`}>
                      {student.completionPct}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${completionColor(student.completionPct)}`}
                      style={{ width: `${student.completionPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    {student.completedRequirements} / {student.totalRequirements} requirements completed
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
