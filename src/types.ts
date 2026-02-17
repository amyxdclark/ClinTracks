// Core types for the ClinTrack application

export type Role = 'Student' | 'Preceptor' | 'Instructor' | 'Coordinator' | 'ProgramAdmin';

export type RequirementStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  programId?: string;
  cohortId?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
}

export interface Cohort {
  id: string;
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Site {
  id: string;
  name: string;
  address?: string;
  notes?: string;
}

export interface SiteCapacity {
  id: string;
  siteId: string;
  date: string;
  capacityCount: number;
  notes?: string;
}

export interface RequirementTemplate {
  id: string;
  programId: string;
  cohortId?: string;
  name: string;
  category: 'Skills' | 'Hours' | 'Documents' | 'Evaluations';
  targetCount: number;
  unit: string;
  description?: string;
}

export interface StudentRequirementProgress {
  id: string;
  studentId: string;
  templateId: string;
  currentCount: number;
  status: 'in_progress' | 'completed';
}

export interface ShiftLog {
  id: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  computedHours: number;
  siteId: string;
  preceptorId?: string;
  notes?: string;
  status: RequirementStatus;
  noPHI: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillLog {
  id: string;
  studentId: string;
  shiftLogId?: string;
  skillName: string;
  skillType: string;
  outcome: 'success' | 'fail';
  mode: 'assisted' | 'independent';
  ageRange?: string;
  complaintCategory?: string;
  notes?: string;
  status: RequirementStatus;
  noPHI: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  entityType: 'shift' | 'skill';
  entityId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  comments?: string;
  decidedAt: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details?: string;
}

export interface ScheduleRequest {
  id: string;
  studentId: string;
  siteId: string;
  date: string;
  status: 'requested' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface AppState {
  version: number;
  lastSavedAt: string;
  profiles: UserProfile[];
  activeProfileId: string;
  programs: Program[];
  cohorts: Cohort[];
  sites: Site[];
  capacities: SiteCapacity[];
  requirementTemplates: RequirementTemplate[];
  studentProgress: StudentRequirementProgress[];
  shiftLogs: ShiftLog[];
  skillLogs: SkillLog[];
  approvals: Approval[];
  scheduleRequests: ScheduleRequest[];
  audit: AuditEvent[];
  hasSeenOnboarding: boolean;
}

export const DEFAULT_PROGRAMS: Program[] = [
  { id: 'prog-ems', name: 'EMS', description: 'Emergency Medical Services program' },
  { id: 'prog-nursing', name: 'Nursing', description: 'Nursing program' },
];

export const DEFAULT_COHORTS: Cohort[] = [
  { id: 'cohort-ems-f26', programId: 'prog-ems', name: 'EMS Fall 2026', startDate: '2026-08-01', endDate: '2026-12-15' },
  { id: 'cohort-nurs-s26', programId: 'prog-nursing', name: 'Nursing Spring 2026', startDate: '2026-01-15', endDate: '2026-05-30' },
];

export const DEFAULT_SITES: Site[] = [
  { id: 'site-1', name: 'City ED' },
  { id: 'site-2', name: 'County EMS' },
  { id: 'site-3', name: 'Clinic A' },
];

export const DEFAULT_PROFILES: UserProfile[] = [
  { id: 'user-1', name: 'Alex Student', email: 'student@example.com', role: 'Student', programId: 'prog-ems', cohortId: 'cohort-ems-f26' },
  { id: 'user-2', name: 'Pat Preceptor', email: 'preceptor@example.com', role: 'Preceptor' },
  { id: 'user-3', name: 'Jordan Instructor', email: 'instructor@example.com', role: 'Instructor' },
  { id: 'user-4', name: 'Casey Coordinator', email: 'coordinator@example.com', role: 'Coordinator' },
  { id: 'user-5', name: 'Morgan Admin', email: 'admin@example.com', role: 'ProgramAdmin' },
];

export const DEFAULT_REQUIREMENT_TEMPLATES: RequirementTemplate[] = [
  // EMS requirements
  { id: 'rt-ems-1', programId: 'prog-ems', name: 'ALS Shifts', category: 'Hours', targetCount: 10, unit: 'shifts', description: 'Complete 10 ALS ambulance shifts' },
  { id: 'rt-ems-2', programId: 'prog-ems', name: 'Field Hours', category: 'Hours', targetCount: 100, unit: 'hours', description: 'Accumulate 100 field hours' },
  { id: 'rt-ems-3', programId: 'prog-ems', name: 'IV Starts', category: 'Skills', targetCount: 10, unit: 'attempts', description: 'Perform 10 IV starts' },
  { id: 'rt-ems-4', programId: 'prog-ems', name: '12-Lead EKGs', category: 'Skills', targetCount: 15, unit: 'interpretations', description: 'Interpret 15 12-lead EKGs' },
  { id: 'rt-ems-5', programId: 'prog-ems', name: 'Airway Management', category: 'Skills', targetCount: 5, unit: 'procedures', description: 'Perform 5 airway management procedures' },
  { id: 'rt-ems-6', programId: 'prog-ems', name: 'BLS Card', category: 'Documents', targetCount: 1, unit: 'document', description: 'Upload current BLS certification' },
  { id: 'rt-ems-7', programId: 'prog-ems', name: 'ACLS Card', category: 'Documents', targetCount: 1, unit: 'document', description: 'Upload current ACLS certification' },
  // Nursing requirements
  { id: 'rt-nurs-1', programId: 'prog-nursing', name: 'Med Pass Skills', category: 'Skills', targetCount: 20, unit: 'passes', description: 'Complete 20 medication passes' },
  { id: 'rt-nurs-2', programId: 'prog-nursing', name: 'IV Starts', category: 'Skills', targetCount: 10, unit: 'attempts', description: 'Perform 10 IV starts' },
  { id: 'rt-nurs-3', programId: 'prog-nursing', name: 'Assessment Checkoffs', category: 'Evaluations', targetCount: 8, unit: 'checkoffs', description: 'Complete 8 assessment checkoffs' },
  { id: 'rt-nurs-4', programId: 'prog-nursing', name: 'Clinical Hours', category: 'Hours', targetCount: 120, unit: 'hours', description: 'Accumulate 120 clinical hours' },
  { id: 'rt-nurs-5', programId: 'prog-nursing', name: 'Immunization Records', category: 'Documents', targetCount: 1, unit: 'document', description: 'Upload immunization records' },
  { id: 'rt-nurs-6', programId: 'prog-nursing', name: 'CPR Certification', category: 'Documents', targetCount: 1, unit: 'document', description: 'Upload current CPR certification' },
];

export const INITIAL_STATE: AppState = {
  version: 1,
  lastSavedAt: new Date().toISOString(),
  profiles: DEFAULT_PROFILES,
  activeProfileId: 'user-1',
  programs: DEFAULT_PROGRAMS,
  cohorts: DEFAULT_COHORTS,
  sites: DEFAULT_SITES,
  capacities: [],
  requirementTemplates: DEFAULT_REQUIREMENT_TEMPLATES,
  studentProgress: [],
  shiftLogs: [],
  skillLogs: [],
  approvals: [],
  scheduleRequests: [],
  audit: [],
  hasSeenOnboarding: false,
};
