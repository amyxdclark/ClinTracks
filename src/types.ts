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
  isLoggedIn: boolean;
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

// ─── Programs: Maine colleges & EMS training programs ───
export const DEFAULT_PROGRAMS: Program[] = [
  { id: 'prog-ems', name: 'SMCC Paramedic Program', description: 'Southern Maine Community College — Paramedic certificate program' },
  { id: 'prog-nursing', name: 'USM School of Nursing', description: 'University of Southern Maine — BSN nursing program' },
  { id: 'prog-emcc-ems', name: 'EMCC Paramedicine', description: 'Eastern Maine Community College — Paramedicine AAS degree' },
  { id: 'prog-une-nursing', name: 'UNE Nursing', description: 'University of New England — BSN nursing program' },
  { id: 'prog-husson-nursing', name: 'Husson University Nursing', description: 'Husson University — BSN nursing program' },
  { id: 'prog-kvcc-ems', name: 'KVCC EMT-Paramedic', description: 'Kennebec Valley Community College — EMT-Paramedic program' },
];

// ─── Cohorts ───
export const DEFAULT_COHORTS: Cohort[] = [
  { id: 'cohort-smcc-ems-f26', programId: 'prog-ems', name: 'SMCC Paramedic Fall 2026', startDate: '2026-08-01', endDate: '2026-12-15' },
  { id: 'cohort-usm-nurs-s26', programId: 'prog-nursing', name: 'USM Nursing Spring 2026', startDate: '2026-01-15', endDate: '2026-05-30' },
  { id: 'cohort-emcc-ems-f26', programId: 'prog-emcc-ems', name: 'EMCC Paramedicine Fall 2026', startDate: '2026-08-15', endDate: '2026-12-20' },
  { id: 'cohort-une-nurs-f26', programId: 'prog-une-nursing', name: 'UNE Nursing Fall 2026', startDate: '2026-08-20', endDate: '2027-05-15' },
  { id: 'cohort-husson-nurs-s26', programId: 'prog-husson-nursing', name: 'Husson Nursing Spring 2026', startDate: '2026-01-10', endDate: '2026-05-20' },
  { id: 'cohort-kvcc-ems-f26', programId: 'prog-kvcc-ems', name: 'KVCC EMT-Paramedic Fall 2026', startDate: '2026-08-01', endDate: '2026-12-15' },
];

// ─── Sites: Real Maine hospitals, units, and ambulance services ───
export const DEFAULT_SITES: Site[] = [
  // Maine Medical Center – Portland
  { id: 'site-mmc-ed', name: 'Maine Medical Center — Emergency Dept', address: '22 Bramhall St, Portland, ME 04102' },
  { id: 'site-mmc-icu', name: 'Maine Medical Center — ICU', address: '22 Bramhall St, Portland, ME 04102' },
  { id: 'site-mmc-medsurg', name: 'Maine Medical Center — Med/Surg Unit', address: '22 Bramhall St, Portland, ME 04102' },
  { id: 'site-mmc-lnd', name: 'Maine Medical Center — Labor & Delivery', address: '22 Bramhall St, Portland, ME 04102' },
  { id: 'site-mmc-peds', name: 'Maine Medical Center — Pediatrics', address: '22 Bramhall St, Portland, ME 04102' },
  { id: 'site-mmc-or', name: 'Maine Medical Center — Operating Room', address: '22 Bramhall St, Portland, ME 04102' },
  // Northern Light Eastern Maine Medical Center – Bangor
  { id: 'site-emmc-ed', name: 'Northern Light EMMC — Emergency Dept', address: '489 State St, Bangor, ME 04401' },
  { id: 'site-emmc-icu', name: 'Northern Light EMMC — ICU', address: '489 State St, Bangor, ME 04401' },
  { id: 'site-emmc-medsurg', name: 'Northern Light EMMC — Med/Surg Unit', address: '489 State St, Bangor, ME 04401' },
  { id: 'site-emmc-psych', name: 'Northern Light EMMC — Behavioral Health', address: '489 State St, Bangor, ME 04401' },
  // Central Maine Medical Center – Lewiston
  { id: 'site-cmmc-ed', name: 'Central Maine Medical Center — Emergency Dept', address: '300 Main St, Lewiston, ME 04240' },
  { id: 'site-cmmc-icu', name: 'Central Maine Medical Center — ICU', address: '300 Main St, Lewiston, ME 04240' },
  { id: 'site-cmmc-medsurg', name: 'Central Maine Medical Center — Med/Surg', address: '300 Main St, Lewiston, ME 04240' },
  // MaineGeneral Medical Center – Augusta
  { id: 'site-mgmc-ed', name: 'MaineGeneral Medical Center — Emergency Dept', address: '35 Medical Center Pkwy, Augusta, ME 04330' },
  { id: 'site-mgmc-medsurg', name: 'MaineGeneral Medical Center — Med/Surg', address: '35 Medical Center Pkwy, Augusta, ME 04330' },
  // Mercy Hospital – Portland
  { id: 'site-mercy-ed', name: 'Mercy Hospital — Emergency Dept', address: '144 State St, Portland, ME 04101' },
  { id: 'site-mercy-medsurg', name: 'Mercy Hospital — Med/Surg Unit', address: '144 State St, Portland, ME 04101' },
  // Mid Coast Hospital – Brunswick
  { id: 'site-midcoast-ed', name: 'Mid Coast Hospital — Emergency Dept', address: '123 Medical Center Dr, Brunswick, ME 04011' },
  // Pen Bay Medical Center – Rockport
  { id: 'site-penbay-ed', name: 'Pen Bay Medical Center — Emergency Dept', address: '6 Glen Cove Dr, Rockport, ME 04856' },
  // Ambulance services
  { id: 'site-portland-ems', name: 'Portland Fire/EMS', address: '380 Congress St, Portland, ME 04101', notes: 'ALS ambulance service' },
  { id: 'site-bangor-ems', name: 'Bangor Fire/EMS', address: '292 Main St, Bangor, ME 04401', notes: 'ALS ambulance service' },
  { id: 'site-lewiston-ems', name: 'Lewiston Fire/EMS', address: '2 College St, Lewiston, ME 04240', notes: 'ALS ambulance service' },
  { id: 'site-united-amb', name: 'United Ambulance Service', address: '41 Enterprise Dr, Lewiston, ME 04240', notes: 'ILS/ALS ambulance service' },
  { id: 'site-northstar', name: 'NorthStar Ambulance Service', address: '111 Franklin Health Commons, Farmington, ME 04938', notes: 'ALS ambulance service' },
  { id: 'site-atlantic-ems', name: 'Atlantic Partners EMS', address: 'Scarborough, ME 04074', notes: 'ALS ambulance service' },
  // Community health sites
  { id: 'site-chc-portland', name: 'Greater Portland Health', address: '63 Preble St, Portland, ME 04101', notes: 'Community health center' },
  { id: 'site-penquis-chc', name: 'Penquis Community Health Center', address: 'Bangor, ME 04401', notes: 'Community health center' },
];

// ─── Profiles: Multiple students per program + staff ───
export const DEFAULT_PROFILES: UserProfile[] = [
  // SMCC Paramedic students
  { id: 'user-1', name: 'Alex Thompson', email: 'athompson@smccme.edu', role: 'Student', programId: 'prog-ems', cohortId: 'cohort-smcc-ems-f26' },
  { id: 'user-s2', name: 'Riley Bouchard', email: 'rbouchard@smccme.edu', role: 'Student', programId: 'prog-ems', cohortId: 'cohort-smcc-ems-f26' },
  { id: 'user-s3', name: 'Sam Michaud', email: 'smichaud@smccme.edu', role: 'Student', programId: 'prog-ems', cohortId: 'cohort-smcc-ems-f26' },
  { id: 'user-s4', name: 'Taylor Gagnon', email: 'tgagnon@smccme.edu', role: 'Student', programId: 'prog-ems', cohortId: 'cohort-smcc-ems-f26' },
  // USM Nursing students
  { id: 'user-s5', name: 'Jordan Pelletier', email: 'jpelletier@maine.edu', role: 'Student', programId: 'prog-nursing', cohortId: 'cohort-usm-nurs-s26' },
  { id: 'user-s6', name: 'Morgan Cyr', email: 'mcyr@maine.edu', role: 'Student', programId: 'prog-nursing', cohortId: 'cohort-usm-nurs-s26' },
  { id: 'user-s7', name: 'Casey Levesque', email: 'clevesque@maine.edu', role: 'Student', programId: 'prog-nursing', cohortId: 'cohort-usm-nurs-s26' },
  { id: 'user-s8', name: 'Avery Dubois', email: 'adubois@maine.edu', role: 'Student', programId: 'prog-nursing', cohortId: 'cohort-usm-nurs-s26' },
  // EMCC Paramedicine students
  { id: 'user-s9', name: 'Cameron Ouellette', email: 'couellette@emcc.edu', role: 'Student', programId: 'prog-emcc-ems', cohortId: 'cohort-emcc-ems-f26' },
  { id: 'user-s10', name: 'Dakota Theriault', email: 'dtheriault@emcc.edu', role: 'Student', programId: 'prog-emcc-ems', cohortId: 'cohort-emcc-ems-f26' },
  { id: 'user-s11', name: 'Quinn Nadeau', email: 'qnadeau@emcc.edu', role: 'Student', programId: 'prog-emcc-ems', cohortId: 'cohort-emcc-ems-f26' },
  // UNE Nursing students
  { id: 'user-s12', name: 'Harper Sirois', email: 'hsirois@une.edu', role: 'Student', programId: 'prog-une-nursing', cohortId: 'cohort-une-nurs-f26' },
  { id: 'user-s13', name: 'Skyler Beaulieu', email: 'sbeaulieu@une.edu', role: 'Student', programId: 'prog-une-nursing', cohortId: 'cohort-une-nurs-f26' },
  { id: 'user-s14', name: 'Reese Thibodeau', email: 'rthibodeau@une.edu', role: 'Student', programId: 'prog-une-nursing', cohortId: 'cohort-une-nurs-f26' },
  // Husson Nursing students
  { id: 'user-s15', name: 'Peyton Caron', email: 'pcaron@husson.edu', role: 'Student', programId: 'prog-husson-nursing', cohortId: 'cohort-husson-nurs-s26' },
  { id: 'user-s16', name: 'Jamie Poirier', email: 'jpoirier@husson.edu', role: 'Student', programId: 'prog-husson-nursing', cohortId: 'cohort-husson-nurs-s26' },
  // KVCC EMS students
  { id: 'user-s17', name: 'Drew Lavoie', email: 'dlavoie@kvcc.me.edu', role: 'Student', programId: 'prog-kvcc-ems', cohortId: 'cohort-kvcc-ems-f26' },
  { id: 'user-s18', name: 'Sage Morin', email: 'smorin@kvcc.me.edu', role: 'Student', programId: 'prog-kvcc-ems', cohortId: 'cohort-kvcc-ems-f26' },
  // Staff
  { id: 'user-2', name: 'Pat Preceptor', email: 'preceptor@mmc.org', role: 'Preceptor' },
  { id: 'user-3', name: 'Jordan Instructor', email: 'instructor@smccme.edu', role: 'Instructor' },
  { id: 'user-4', name: 'Casey Coordinator', email: 'coordinator@smccme.edu', role: 'Coordinator' },
  { id: 'user-5', name: 'Morgan Admin', email: 'admin@smccme.edu', role: 'ProgramAdmin' },
];

// ─── Real NREMT Paramedic Clinical Requirements ───
const NREMT_REQUIREMENTS: RequirementTemplate[] = [
  // Field internship hours & patient contacts
  { id: 'rt-ems-1', programId: 'prog-ems', name: 'Field Internship Hours', category: 'Hours', targetCount: 480, unit: 'hours', description: 'Minimum 480 hours of field internship on an ALS unit' },
  { id: 'rt-ems-2', programId: 'prog-ems', name: 'ALS Patient Contacts (Team Lead)', category: 'Skills', targetCount: 50, unit: 'contacts', description: 'Minimum 50 patient contacts as team leader on ALS calls' },
  { id: 'rt-ems-3', programId: 'prog-ems', name: 'Hospital/Clinical Hours', category: 'Hours', targetCount: 200, unit: 'hours', description: 'Minimum 200 hours of hospital/clinical rotations' },
  // Airway management
  { id: 'rt-ems-4', programId: 'prog-ems', name: 'Endotracheal Intubation', category: 'Skills', targetCount: 5, unit: 'successful attempts', description: 'Minimum 5 successful endotracheal intubations (live or OR)' },
  { id: 'rt-ems-5', programId: 'prog-ems', name: 'Supraglottic Airway Placement', category: 'Skills', targetCount: 3, unit: 'placements', description: 'Minimum 3 supraglottic airway device placements' },
  { id: 'rt-ems-6', programId: 'prog-ems', name: 'BVM Ventilation', category: 'Skills', targetCount: 5, unit: 'procedures', description: 'Minimum 5 bag-valve-mask ventilations' },
  // Vascular access & medications
  { id: 'rt-ems-7', programId: 'prog-ems', name: 'IV Starts', category: 'Skills', targetCount: 25, unit: 'attempts', description: 'Minimum 25 IV initiation attempts' },
  { id: 'rt-ems-8', programId: 'prog-ems', name: 'IO Access', category: 'Skills', targetCount: 1, unit: 'procedures', description: 'Minimum 1 intraosseous access (live or simulated)' },
  { id: 'rt-ems-9', programId: 'prog-ems', name: 'Medication Administration', category: 'Skills', targetCount: 30, unit: 'administrations', description: 'Minimum 30 medication administrations across various routes' },
  // Cardiac
  { id: 'rt-ems-10', programId: 'prog-ems', name: '12-Lead EKG Acquisition & Interpretation', category: 'Skills', targetCount: 25, unit: 'EKGs', description: 'Acquire and interpret minimum 25 12-lead EKGs' },
  { id: 'rt-ems-11', programId: 'prog-ems', name: 'Cardiac Arrest Management (Team Lead)', category: 'Skills', targetCount: 3, unit: 'resuscitations', description: 'Lead minimum 3 cardiac arrest resuscitations' },
  // Patient contacts by age group
  { id: 'rt-ems-12', programId: 'prog-ems', name: 'Pediatric Patient Contacts (< 16 yrs)', category: 'Skills', targetCount: 10, unit: 'contacts', description: 'Minimum 10 patient contacts with pediatric patients' },
  { id: 'rt-ems-13', programId: 'prog-ems', name: 'Geriatric Patient Contacts (> 65 yrs)', category: 'Skills', targetCount: 15, unit: 'contacts', description: 'Minimum 15 patient contacts with geriatric patients' },
  // Patient contacts by complaint category
  { id: 'rt-ems-14', programId: 'prog-ems', name: 'Trauma Assessment (Team Lead)', category: 'Skills', targetCount: 15, unit: 'assessments', description: 'Minimum 15 trauma patient assessments as team leader' },
  { id: 'rt-ems-15', programId: 'prog-ems', name: 'Medical Assessment (Team Lead)', category: 'Skills', targetCount: 15, unit: 'assessments', description: 'Minimum 15 medical patient assessments as team leader' },
  { id: 'rt-ems-16', programId: 'prog-ems', name: 'Chest Pain / ACS Assessments', category: 'Skills', targetCount: 10, unit: 'assessments', description: 'Minimum 10 chest pain / acute coronary syndrome assessments' },
  { id: 'rt-ems-17', programId: 'prog-ems', name: 'Respiratory Distress Assessments', category: 'Skills', targetCount: 10, unit: 'assessments', description: 'Minimum 10 respiratory distress assessments' },
  { id: 'rt-ems-18', programId: 'prog-ems', name: 'OB/Delivery Observations', category: 'Skills', targetCount: 5, unit: 'observations', description: 'Observe minimum 5 deliveries or OB emergencies' },
  { id: 'rt-ems-19', programId: 'prog-ems', name: 'Psychiatric Patient Assessments', category: 'Skills', targetCount: 5, unit: 'assessments', description: 'Minimum 5 behavioral / psychiatric patient assessments' },
  // Documents & certifications
  { id: 'rt-ems-20', programId: 'prog-ems', name: 'BLS Provider Card', category: 'Documents', targetCount: 1, unit: 'document', description: 'Current AHA BLS Provider certification' },
  { id: 'rt-ems-21', programId: 'prog-ems', name: 'ACLS Provider Card', category: 'Documents', targetCount: 1, unit: 'document', description: 'Current AHA ACLS Provider certification' },
  { id: 'rt-ems-22', programId: 'prog-ems', name: 'PALS / PEPP Card', category: 'Documents', targetCount: 1, unit: 'document', description: 'Current PALS or PEPP certification' },
  { id: 'rt-ems-23', programId: 'prog-ems', name: 'PHTLS / ITLS Card', category: 'Documents', targetCount: 1, unit: 'document', description: 'Current PHTLS or ITLS certification' },
  { id: 'rt-ems-24', programId: 'prog-ems', name: 'Immunization Records', category: 'Documents', targetCount: 1, unit: 'document', description: 'Upload current immunization records including Hep B, Tdap, MMR, Varicella' },
  // Evaluations
  { id: 'rt-ems-25', programId: 'prog-ems', name: 'Preceptor Evaluations', category: 'Evaluations', targetCount: 6, unit: 'evaluations', description: 'Minimum 6 preceptor evaluations across clinical rotations' },
  { id: 'rt-ems-26', programId: 'prog-ems', name: 'Capstone Field Evaluation', category: 'Evaluations', targetCount: 1, unit: 'evaluation', description: 'Pass capstone field internship evaluation' },
];

// ─── Real Nursing (BSN) Clinical Requirements ───
const NURSING_REQUIREMENTS: RequirementTemplate[] = [
  // Clinical hours by rotation
  { id: 'rt-nurs-1', programId: 'prog-nursing', name: 'Fundamentals Clinical Hours', category: 'Hours', targetCount: 90, unit: 'hours', description: 'Fundamentals of nursing clinical rotation hours' },
  { id: 'rt-nurs-2', programId: 'prog-nursing', name: 'Med/Surg I Clinical Hours', category: 'Hours', targetCount: 135, unit: 'hours', description: 'Medical-Surgical nursing I clinical hours' },
  { id: 'rt-nurs-3', programId: 'prog-nursing', name: 'Med/Surg II Clinical Hours', category: 'Hours', targetCount: 135, unit: 'hours', description: 'Medical-Surgical nursing II clinical hours' },
  { id: 'rt-nurs-4', programId: 'prog-nursing', name: 'Pediatric Nursing Clinical Hours', category: 'Hours', targetCount: 90, unit: 'hours', description: 'Pediatric nursing clinical rotation hours' },
  { id: 'rt-nurs-5', programId: 'prog-nursing', name: 'OB / Maternal-Newborn Clinical Hours', category: 'Hours', targetCount: 90, unit: 'hours', description: 'Obstetric and maternal-newborn nursing clinical hours' },
  { id: 'rt-nurs-6', programId: 'prog-nursing', name: 'Psychiatric / Mental Health Clinical Hours', category: 'Hours', targetCount: 90, unit: 'hours', description: 'Psychiatric and mental health nursing clinical hours' },
  { id: 'rt-nurs-7', programId: 'prog-nursing', name: 'Community / Public Health Clinical Hours', category: 'Hours', targetCount: 90, unit: 'hours', description: 'Community and public health nursing clinical hours' },
  { id: 'rt-nurs-8', programId: 'prog-nursing', name: 'Leadership / Management Clinical Hours', category: 'Hours', targetCount: 90, unit: 'hours', description: 'Nursing leadership and management preceptorship hours' },
  // Nursing skills
  { id: 'rt-nurs-9', programId: 'prog-nursing', name: 'Medication Administration (Oral)', category: 'Skills', targetCount: 50, unit: 'administrations', description: 'Administer medications via oral route' },
  { id: 'rt-nurs-10', programId: 'prog-nursing', name: 'Medication Administration (IV Push)', category: 'Skills', targetCount: 15, unit: 'administrations', description: 'Administer IV push medications' },
  { id: 'rt-nurs-11', programId: 'prog-nursing', name: 'Medication Administration (IM/SubQ)', category: 'Skills', targetCount: 20, unit: 'injections', description: 'Administer intramuscular and subcutaneous injections' },
  { id: 'rt-nurs-12', programId: 'prog-nursing', name: 'IV Starts / Venipuncture', category: 'Skills', targetCount: 15, unit: 'attempts', description: 'Peripheral IV insertion attempts' },
  { id: 'rt-nurs-13', programId: 'prog-nursing', name: 'Foley Catheter Insertion', category: 'Skills', targetCount: 5, unit: 'procedures', description: 'Urinary catheter insertions (male and female)' },
  { id: 'rt-nurs-14', programId: 'prog-nursing', name: 'NG Tube Insertion', category: 'Skills', targetCount: 3, unit: 'procedures', description: 'Nasogastric tube insertions' },
  { id: 'rt-nurs-15', programId: 'prog-nursing', name: 'Wound Care / Dressing Changes', category: 'Skills', targetCount: 10, unit: 'procedures', description: 'Sterile wound care and dressing changes' },
  { id: 'rt-nurs-16', programId: 'prog-nursing', name: 'Blood Glucose Monitoring', category: 'Skills', targetCount: 15, unit: 'checks', description: 'Point-of-care blood glucose monitoring' },
  { id: 'rt-nurs-17', programId: 'prog-nursing', name: 'Head-to-Toe Physical Assessment', category: 'Skills', targetCount: 20, unit: 'assessments', description: 'Complete head-to-toe patient assessments' },
  { id: 'rt-nurs-18', programId: 'prog-nursing', name: 'Patient Education Sessions', category: 'Skills', targetCount: 10, unit: 'sessions', description: 'Conduct patient/family education sessions' },
  { id: 'rt-nurs-19', programId: 'prog-nursing', name: 'Sterile Technique Procedures', category: 'Skills', targetCount: 8, unit: 'procedures', description: 'Perform procedures requiring sterile technique' },
  { id: 'rt-nurs-20', programId: 'prog-nursing', name: 'Tracheostomy Care', category: 'Skills', targetCount: 3, unit: 'procedures', description: 'Tracheostomy care and suctioning' },
  // Documents
  { id: 'rt-nurs-21', programId: 'prog-nursing', name: 'BLS / CPR Certification', category: 'Documents', targetCount: 1, unit: 'document', description: 'Current AHA BLS for Healthcare Providers certification' },
  { id: 'rt-nurs-22', programId: 'prog-nursing', name: 'Immunization Records', category: 'Documents', targetCount: 1, unit: 'document', description: 'Complete immunization records (Hep B series, Tdap, MMR, Varicella, Flu)' },
  { id: 'rt-nurs-23', programId: 'prog-nursing', name: 'Background Check', category: 'Documents', targetCount: 1, unit: 'document', description: 'Current criminal background check clearance' },
  { id: 'rt-nurs-24', programId: 'prog-nursing', name: 'TB Screening', category: 'Documents', targetCount: 1, unit: 'document', description: 'Annual TB screening (PPD or chest X-ray)' },
  { id: 'rt-nurs-25', programId: 'prog-nursing', name: 'Health Insurance Documentation', category: 'Documents', targetCount: 1, unit: 'document', description: 'Proof of current health insurance' },
  // Evaluations
  { id: 'rt-nurs-26', programId: 'prog-nursing', name: 'Clinical Competency Checkoffs', category: 'Evaluations', targetCount: 12, unit: 'checkoffs', description: 'Pass all clinical competency skills checkoffs' },
  { id: 'rt-nurs-27', programId: 'prog-nursing', name: 'Preceptor Evaluations', category: 'Evaluations', targetCount: 8, unit: 'evaluations', description: 'Receive satisfactory preceptor evaluations each rotation' },
  { id: 'rt-nurs-28', programId: 'prog-nursing', name: 'Capstone Clinical Evaluation', category: 'Evaluations', targetCount: 1, unit: 'evaluation', description: 'Pass final capstone clinical evaluation' },
];

// Clone requirements for other EMS and nursing programs
const cloneRequirements = (templates: RequirementTemplate[], fromProgramId: string, toProgramId: string, idPrefix: string): RequirementTemplate[] =>
  templates.filter(t => t.programId === fromProgramId).map(t => ({ ...t, id: `${idPrefix}-${t.id}`, programId: toProgramId }));

export const DEFAULT_REQUIREMENT_TEMPLATES: RequirementTemplate[] = [
  ...NREMT_REQUIREMENTS,
  ...NURSING_REQUIREMENTS,
  // EMCC uses same NREMT requirements
  ...cloneRequirements(NREMT_REQUIREMENTS, 'prog-ems', 'prog-emcc-ems', 'emcc'),
  // KVCC uses same NREMT requirements
  ...cloneRequirements(NREMT_REQUIREMENTS, 'prog-ems', 'prog-kvcc-ems', 'kvcc'),
  // UNE Nursing uses same nursing requirements
  ...cloneRequirements(NURSING_REQUIREMENTS, 'prog-nursing', 'prog-une-nursing', 'une'),
  // Husson Nursing uses same nursing requirements
  ...cloneRequirements(NURSING_REQUIREMENTS, 'prog-nursing', 'prog-husson-nursing', 'husson'),
];

export const INITIAL_STATE: AppState = {
  version: 1,
  lastSavedAt: new Date().toISOString(),
  isLoggedIn: false,
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
