# ClinTrack

A Progressive Web App (PWA) for tracking EMS and Nursing clinical requirements, shift hours, skills, and scheduling.

![Onboarding](https://github.com/user-attachments/assets/a9583807-d7f8-4d2a-ae52-02e870a09584)
![Dashboard](https://github.com/user-attachments/assets/ffc43f0a-033e-452a-bacc-416e70619e2e)

## Features

### 🎓 Role-Based Interface
- **Student**: Track requirements, log shift hours, view progress
- **Preceptor**: Review and approve student submissions
- **Coordinator**: Manage site capacity and student placements
- **Admin**: Full system access and oversight

![Profile Switcher](https://github.com/user-attachments/assets/44ed84cb-5363-46c7-be4b-d9fdbf1e2431)

### 📋 Clinical Requirements Tracking
- Add and manage clinical skill completions
- Submit for preceptor review
- Track approval status
- Built-in PHI protection reminders

![Requirements](https://github.com/user-attachments/assets/6bd1a6c5-b5bd-4edf-8a50-a02a7ba5b002)

### ⏰ Shift Hours Management
- Log clinical shift hours with date/time
- Calculate total hours automatically
- Submit for approval workflow
- Track approved vs pending hours

### 📅 Site Capacity Scheduling
- View clinical site availability
- Monitor student capacity limits
- Color-coded capacity indicators
- Coordinator-managed placements

![Scheduling](https://github.com/user-attachments/assets/e0ef7e1f-6f4e-4e26-8a8a-0949d4f88ebc)

### 🔒 Privacy First
- **NO PHI** checkbox required for all entries
- Prominent warnings throughout the app
- Privacy reminders on every page
- Local-only data storage

### 💾 Data Management
- All data stored in browser localStorage
- Import/Export backup functionality
- No external servers or cloud storage
- Complete data portability

### 📱 Progressive Web App
- Mobile-first responsive design
- Works offline
- Installable on mobile devices
- Fast and lightweight

### 🎨 Modern UI
- Colorful, gradient-based design
- Intuitive navigation
- Mobile bottom navigation
- Desktop sidebar navigation
- Onboarding flow for new users

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router (HashRouter for GitHub Pages)
- **PWA**: vite-plugin-pwa with Workbox
- **State Management**: React Context API
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/amyxdclark/ClinTracks.git
cd ClinTracks

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app runs at `http://localhost:5173/clintrack/` in development mode with hot module replacement.

### Building
```bash
npm run build
```
Outputs to `dist/` directory, ready for deployment.

## Deployment

### GitHub Pages
The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on push to the main branch.

**Setup Steps:**
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch to trigger deployment
4. Access at `https://[username].github.io/clintrack/`

### Manual Deployment
```bash
npm run build
# Upload contents of dist/ to your web server
```

## Usage

### First Time Setup
1. On first launch, complete the onboarding tutorial
2. Switch between roles using the profile button (top right)
3. Explore different user perspectives

### As a Student
1. Add clinical requirements from the Requirements page
2. Log shift hours from the Shift Hours page
3. Submit items for preceptor approval
4. Track your progress on the Dashboard

### As a Preceptor
1. Review pending requirements and shift hours
2. Approve or reject submissions
3. Provide feedback to students

### As a Coordinator/Admin
1. Monitor site capacity on Scheduling page
2. Oversee all student progress
3. Manage clinical placements

### Data Backup
1. Go to Settings page
2. Click "Export Backup" to download JSON file
3. Use "Import Backup" to restore from file
4. **Recommended**: Export regularly as backup

## Project Structure

```
ClinTracks/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── ProfileSwitcher.tsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Requirements.tsx
│   │   ├── ShiftHours.tsx
│   │   ├── Skills.tsx
│   │   ├── Scheduling.tsx
│   │   ├── Settings.tsx
│   │   ├── Onboarding.tsx
│   │   └── Help.tsx
│   ├── AppContext.tsx  # Global state management
│   ├── storage.ts      # localStorage utilities
│   ├── types.ts        # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment
├── index.html
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json
```

## Key Features Explained

### LocalStorage Data Structure
All app data is stored as a single JSON object in localStorage:
```typescript
{
  version: "1.0.0",
  currentUserId: "1",
  users: [...],
  skills: [...],
  requirements: [...],
  shiftHours: [...],
  sites: [...],
  hasSeenOnboarding: false
}
```

### Simulated Roles
The app simulates a multi-user system with role-based views:
- Profile switcher allows instant role changes
- Each role sees appropriate data and actions
- Submit/approve workflows demonstrate clinical documentation process

### PHI Protection
Multiple safeguards ensure privacy compliance:
- Mandatory "NO PHI" checkbox on all data entry forms
- Warning banners on every data entry page
- Reminder on dashboard
- Placeholder text emphasizes generic descriptions

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.

---

**⚠️ Important Privacy Notice**: This application is designed for educational and clinical tracking purposes. Never include Protected Health Information (PHI) such as patient names, medical record numbers, or other identifiable information.
