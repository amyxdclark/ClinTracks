# 🏥 ClinTrack — Clinical Requirements Tracker

A **Progressive Web App (PWA)** for EMS and Nursing students to track clinical requirements, shift hours, skills, and scheduling — all without storing any Protected Health Information.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎓 | **Role-Based Interface** | Five distinct roles with tailored views and permissions |
| 📋 | **Requirements Tracking** | Log skills, hours, documents, and evaluations against program templates |
| ⏰ | **Shift Hours Management** | Record shifts with auto-calculated hours and approval workflow |
| 📅 | **Site Scheduling** | View clinical-site capacity and manage student placements |
| ✅ | **Approval Workflow** | Submit → Review → Approve/Reject pipeline for all entries |
| 🔒 | **Privacy First** | Mandatory "No PHI" checkbox; zero patient data stored |
| 💾 | **Import / Export** | JSON backup with full-replace or smart-merge import modes |
| 📱 | **PWA & Offline** | Installable on any device; works without an internet connection |
| 🎨 | **Modern UI** | Gradient design, mobile bottom nav, desktop sidebar, onboarding flow |

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Build Tool | [Vite 7](https://vitejs.dev/) |
| UI Framework | [React 19](https://react.dev/) + TypeScript 5 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Routing | [React Router 7](https://reactrouter.com/) (HashRouter) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) with Workbox |
| State | React Context API + browser `localStorage` |
| Icons | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm**

### Installation

```bash
git clone https://github.com/amyxdclark/ClinTracks.git
cd ClinTracks
npm install
```

### Development

```bash
npm run dev
```

Opens at **<http://localhost:5173/clintrack/>** with hot-module replacement.

### Production Build

```bash
npm run build      # TypeScript check + Vite build → dist/
npm run preview    # Serve the production build locally
```

---

## 🌐 Deployment to GitHub Pages

The repository ships with a GitHub Actions workflow at `.github/workflows/deploy.yml` that deploys automatically on every push to `main`.

### Setup Steps

1. Go to **Settings → Pages** in your repository.
2. Set **Source** to **GitHub Actions**.
3. Push to the `main` branch — the workflow builds and deploys automatically.
4. Access the live app at `https://[username].github.io/clintrack/`.

### Troubleshooting

- The app uses **HashRouter** (`/#/path`) so that all routes resolve correctly on GitHub Pages — no custom `404.html` needed.
- If the page appears blank after deploy, clear the browser cache or hard-refresh.

---

## 💾 How Import / Export Works

All application state lives in `localStorage` as a single JSON object. The Settings page provides two data-management operations:

### Export

- Downloads the entire `AppState` as a timestamped JSON file (e.g. `clintrack-backup-2025-01-15.json`).

### Import

Two modes are available when importing a backup file:

| Mode | Behavior |
|---|---|
| **Replace All** | Overwrites the current state entirely with the imported file. |
| **Merge** | Combines data by `id` — existing records are updated, new records are added, and nothing is deleted. |

- The file is **validated** before import (`version` and `profiles` fields must be present).
- **Recommendation:** Export a backup at least once a week to guard against accidental data loss.

---

## 🔒 Privacy Rules — No PHI

> **⚠️ Never include Protected Health Information (PHI) in this application.**

### Requirements

- Every shift log and skill log has a mandatory **"No PHI"** checkbox that must be checked before saving.
- Warning banners appear on every data-entry page.

### What NOT to Include

- Patient names, initials, or nicknames
- Medical record numbers (MRN)
- Dates of birth or Social Security numbers
- Specific diagnoses tied to identifiable patients
- Photographs or any media containing patient information

### What to Use Instead

- Generic descriptions: *"adult male, chest pain"*
- Age ranges: *"40–50 y/o"*
- Skill-focused notes: *"successful IV start, 20g, AC"*

---

## 👥 User Roles

ClinTrack ships with five built-in roles. Switch between them instantly via the profile switcher.

| Role | Capabilities |
|---|---|
| **Student** | Log shifts & skills, track requirement progress, submit entries for review |
| **Preceptor** | Review and approve/reject student submissions |
| **Instructor** | Same as Preceptor — review and approve/reject student submissions |
| **Coordinator** | Manage schedules, monitor site capacity, approve scheduling requests |
| **Program Admin** | Full system access — manage programs, cohorts, sites, and requirement templates |

---

## ✅ Approval Workflow

```
Student creates entry ──► Draft / Pending
        │
Student submits      ──► Submitted
        │
Reviewer decides     ──► Approved  ✓  (counts toward requirements)
                     ──► Rejected  ✗  (student may revise & resubmit)
```

Only **approved** items count toward a student's requirement totals.

---

## 📁 Project Structure

```
ClinTracks/
├── public/                  # Static assets & PWA icons
├── src/
│   ├── components/          # Shared UI components
│   │   ├── Layout.tsx       #   App shell with nav
│   │   ├── Navbar.tsx       #   Responsive navigation
│   │   └── ProfileSwitcher.tsx  # Role-switching dropdown
│   ├── pages/               # Route-level page components
│   │   ├── AdminSetup.tsx   #   Program Admin configuration
│   │   ├── Approvals.tsx    #   Review queue
│   │   ├── Dashboard.tsx    #   Overview & progress
│   │   ├── Help.tsx         #   In-app help
│   │   ├── Onboarding.tsx   #   First-run tutorial
│   │   ├── Requirements.tsx #   Requirement tracking
│   │   ├── Scheduling.tsx   #   Site capacity calendar
│   │   ├── Settings.tsx     #   Import/export & reset
│   │   ├── ShiftHours.tsx   #   Shift logging
│   │   └── Skills.tsx       #   Skill logging
│   ├── AppContext.tsx        # React Context global state
│   ├── storage.ts           # localStorage read/write/merge utilities
│   ├── types.ts             # TypeScript interfaces & defaults
│   ├── App.tsx              # Root component & router
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles (Tailwind directives)
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages CI/CD
├── index.html               # HTML entry
├── vite.config.ts           # Vite config (base path, PWA plugin)
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── tsconfig.json            # TypeScript project references
├── tsconfig.app.json        # App-level TS config
├── tsconfig.node.json       # Node/tooling TS config
├── eslint.config.js         # ESLint flat config
└── package.json
```

---

## 🗃 Data Model

All state is persisted as a single `AppState` object in `localStorage`:

```typescript
interface AppState {
  version: number;
  lastSavedAt: string;
  profiles: UserProfile[];       // Users & roles
  activeProfileId: string;
  programs: Program[];           // EMS, Nursing, etc.
  cohorts: Cohort[];             // Semester groupings
  sites: Site[];                 // Clinical locations
  capacities: SiteCapacity[];    // Per-date seat counts
  requirementTemplates: RequirementTemplate[];  // What students must complete
  studentProgress: StudentRequirementProgress[];
  shiftLogs: ShiftLog[];         // Shift hour entries
  skillLogs: SkillLog[];         // Skill completion entries
  approvals: Approval[];         // Review decisions
  scheduleRequests: ScheduleRequest[];
  audit: AuditEvent[];           // Change history
  hasSeenOnboarding: boolean;
}
```

Each array is keyed by `id`, which enables the **merge** import strategy.

---

## 📲 PWA — Install on Your Device

ClinTrack is a Progressive Web App and can be installed for a native-like experience.

### iOS (Safari)

1. Open the app URL in **Safari**.
2. Tap the **Share** button (square with arrow).
3. Select **Add to Home Screen**.

### Android (Chrome)

1. Open the app URL in **Chrome**.
2. Tap the **⋮** menu.
3. Select **Install app** (or **Add to Home Screen**).

### Desktop (Chrome / Edge)

1. Look for the **install** icon in the address bar.
2. Click **Install**.

Once installed the app launches in its own window and works fully offline.

---

## 🌍 Browser Compatibility

| Browser | Minimum Version |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Mobile Safari (iOS) | 14+ |
| Chrome for Android | 90+ |

---

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
