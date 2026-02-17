// Core types for the ClinTrack application

export type Role = 'Student' | 'Preceptor' | 'Coordinator' | 'Admin';

export type RequirementStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface ClinicalRequirement {
  id: string;
  studentId: string;
  skillId: string;
  status: RequirementStatus;
  submittedDate?: string;
  approvedDate?: string;
  preceptorId?: string;
  notes?: string;
  noPHI: boolean;
}

export interface ShiftHours {
  id: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  siteId: string;
  preceptorId?: string;
  status: RequirementStatus;
  notes?: string;
  noPHI: boolean;
}

export interface Site {
  id: string;
  name: string;
  capacity: number;
  currentStudents: number;
  coordinatorId: string;
}

export interface AppState {
  version: string;
  currentUserId: string;
  users: User[];
  skills: Skill[];
  requirements: ClinicalRequirement[];
  shiftHours: ShiftHours[];
  sites: Site[];
  hasSeenOnboarding: boolean;
}

export const DEFAULT_SKILLS: Skill[] = [
  { id: '1', name: 'IV Insertion', category: 'Skills', description: 'Peripheral IV catheter insertion' },
  { id: '2', name: 'Intubation', category: 'Advanced', description: 'Endotracheal intubation' },
  { id: '3', name: 'CPR', category: 'Basic', description: 'Cardiopulmonary resuscitation' },
  { id: '4', name: 'Wound Care', category: 'Skills', description: 'Wound assessment and dressing' },
  { id: '5', name: 'Med Administration', category: 'Skills', description: 'Medication administration' },
  { id: '6', name: 'Patient Assessment', category: 'Basic', description: 'Complete patient assessment' },
  { id: '7', name: 'EKG Interpretation', category: 'Advanced', description: '12-lead EKG reading' },
  { id: '8', name: 'Oxygen Therapy', category: 'Basic', description: 'Oxygen delivery systems' },
];

export const DEFAULT_SITES: Site[] = [
  { id: '1', name: 'City General Hospital ER', capacity: 5, currentStudents: 2, coordinatorId: '3' },
  { id: '2', name: 'County Ambulance Service', capacity: 4, currentStudents: 3, coordinatorId: '3' },
  { id: '3', name: 'Regional Medical Center ICU', capacity: 3, currentStudents: 1, coordinatorId: '3' },
];

export const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Alex Student', email: 'student@example.com', role: 'Student' },
  { id: '2', name: 'Dr. Sarah Preceptor', email: 'preceptor@example.com', role: 'Preceptor' },
  { id: '3', name: 'Jamie Coordinator', email: 'coordinator@example.com', role: 'Coordinator' },
  { id: '4', name: 'Chris Admin', email: 'admin@example.com', role: 'Admin' },
];

export const INITIAL_STATE: AppState = {
  version: '1.0.0',
  currentUserId: '1',
  users: DEFAULT_USERS,
  skills: DEFAULT_SKILLS,
  requirements: [],
  shiftHours: [],
  sites: DEFAULT_SITES,
  hasSeenOnboarding: false,
};
