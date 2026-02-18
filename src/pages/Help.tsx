import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Rocket, Users, CheckCircle, Database, Shield, Smartphone, HelpCircle, ChevronDown, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  Icon: LucideIcon;
  color: string;
  content: React.ReactNode;
}

const Accordion = ({ section, open, toggle }: { section: Section; open: boolean; toggle: () => void }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <button onClick={toggle} className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-lg ${section.color}`}>
        <section.Icon className="w-5 h-5 text-white" />
      </div>
      <span className="flex-1 text-lg font-bold text-gray-900">{section.title}</span>
      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{section.content}</div>}
  </div>
);

const Help = () => {
  useApp(); // ensure context is available
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['quick-start']));
  const [query, setQuery] = useState('');

  const toggle = (id: string) => setOpenIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });

  const sections: Section[] = useMemo(() => [
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      Icon: Rocket,
      color: 'bg-orange-500',
      content: (
        <div className="space-y-3 text-gray-700">
          <div><h3 className="font-semibold mb-1">1. Choose Your Profile</h3><p className="text-sm">Click your name in the sidebar or top bar to switch between roles (Student, Preceptor, Instructor, Coordinator, Program Admin). Each role provides a different view of the app.</p></div>
          <div><h3 className="font-semibold mb-1">2. Track Requirements</h3><p className="text-sm">Navigate to the Requirements page to view your program's clinical requirements. You can see your progress, log completed items, and submit them for review by a preceptor or instructor.</p></div>
          <div><h3 className="font-semibold mb-1">3. Log Shift Hours</h3><p className="text-sm">Go to Shift Logs to record clinical hours. Enter your site, start/end times, and break minutes. The app calculates your hours automatically. Submit the log for preceptor approval.</p></div>
          <div><h3 className="font-semibold mb-1">4. Log Skills</h3><p className="text-sm">Record individual skills (IV starts, assessments, etc.) from the Skills page. Link them to a shift, choose the outcome and mode, then submit for review.</p></div>
          <div><h3 className="font-semibold mb-1">5. Check the Dashboard</h3><p className="text-sm">Your Dashboard shows role-specific stats: approved hours, pending reviews, completion counts, and quick actions to jump to common tasks.</p></div>
        </div>
      ),
    },
    {
      id: 'roles',
      title: 'Role Descriptions',
      Icon: Users,
      color: 'bg-blue-500',
      content: (
        <div className="space-y-4">
          {[
            { name: 'Student', bg: 'bg-blue-50', text: 'text-blue-800', perms: 'Create and submit shift logs, skill logs, and requirement progress. View own dashboard and completion status. Cannot approve or reject submissions.' },
            { name: 'Preceptor', bg: 'bg-green-50', text: 'text-green-800', perms: 'Review and approve or reject student shift logs and skill logs. Add comments and feedback. View all submissions assigned to them. Cannot manage programs or sites.' },
            { name: 'Instructor', bg: 'bg-indigo-50', text: 'text-indigo-800', perms: 'Review and approve student submissions similar to Preceptors. Additionally can view cohort-wide progress, manage requirement templates, and oversee multiple students.' },
            { name: 'Coordinator', bg: 'bg-purple-50', text: 'text-purple-800', perms: 'Manage clinical site capacity and scheduling. Approve or deny schedule requests. Oversee student placements across all sites and programs. View program-wide analytics.' },
            { name: 'Program Admin', bg: 'bg-red-50', text: 'text-red-800', perms: 'Full system access. Manage all profiles, programs, cohorts, sites, and requirement templates. View audit logs. Export/import data. Configure all aspects of the application.' },
          ].map(r => (
            <div key={r.name} className={`p-4 ${r.bg} rounded-lg`}>
              <h3 className={`font-semibold ${r.text} mb-1`}>{r.name}</h3>
              <p className={`text-sm ${r.text}`}>{r.perms}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'approvals',
      title: 'Approval Workflow',
      Icon: CheckCircle,
      color: 'bg-green-500',
      content: (
        <div className="space-y-3 text-gray-700 text-sm">
          <p className="font-medium text-base">ClinTrack uses a submit → review → approve/reject workflow:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Student submits</strong> — After creating a shift log or skill log, click "Submit for Review." The status changes from <span className="font-mono bg-gray-100 px-1 rounded">pending</span> to <span className="font-mono bg-gray-100 px-1 rounded">submitted</span>.</li>
            <li><strong>Reviewer receives</strong> — Preceptors and Instructors see submitted items in their Review queue on the Dashboard.</li>
            <li><strong>Approve or Reject</strong> — The reviewer can approve (status → <span className="font-mono bg-green-100 px-1 rounded text-green-800">approved</span>) or reject with comments (status → <span className="font-mono bg-red-100 px-1 rounded text-red-800">rejected</span>).</li>
            <li><strong>Student revises</strong> — If rejected, the student can edit and re-submit the item.</li>
          </ol>
          <p>Each action is recorded in the audit log with a timestamp and user ID.</p>
        </div>
      ),
    },
    {
      id: 'import-export',
      title: 'Import/Export & Data Backup',
      Icon: Database,
      color: 'bg-teal-500',
      content: (
        <div className="space-y-3 text-gray-700 text-sm">
          <p>All data lives in your browser's <code className="bg-gray-100 px-1 rounded">localStorage</code>. Nothing is sent to a server.</p>
          <h4 className="font-semibold text-base">Exporting</h4>
          <p>Go to <Link to="/settings" className="text-primary-600 underline font-medium">Settings</Link> and click <strong>Export Backup</strong>. This downloads a <code className="bg-gray-100 px-1 rounded">clintrack-backup-YYYY-MM-DD.json</code> file containing your entire app state.</p>
          <h4 className="font-semibold text-base">Importing</h4>
          <p>Click <strong>Import Backup</strong> and select a previously exported JSON file. You'll be asked to choose:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Replace All</strong> — Overwrites your current data completely with the backup.</li>
            <li><strong>Merge</strong> — Keeps your existing data and adds new records from the file. Duplicate IDs are updated with the imported version.</li>
          </ul>
          <p>After import, a summary toast shows how many records were added or changed.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mt-2">
            <p className="text-yellow-800 font-medium">💡 We recommend exporting a backup at least once per week, and before clearing your browser data or switching devices.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'privacy',
      title: 'Privacy & PHI Rules',
      Icon: Shield,
      color: 'bg-red-500',
      content: (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700">ClinTrack stores all data locally on your device. No data is transmitted to external servers. However, you must still protect patient privacy:</p>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="font-bold text-red-900 mb-2">NEVER include the following in any notes or records:</p>
            <ul className="list-disc list-inside space-y-1 text-red-800">
              <li>Patient names, initials, or nicknames</li>
              <li>Medical record numbers (MRN)</li>
              <li>Dates of birth, death dates, or specific ages over 89</li>
              <li>Phone numbers, fax numbers, or email addresses</li>
              <li>Street addresses (city/state/zip are generally okay)</li>
              <li>Social Security numbers</li>
              <li>Health plan beneficiary numbers</li>
              <li>Photos or biometric identifiers</li>
              <li>Any other unique identifying number or code</li>
            </ul>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
            <p className="text-green-800"><strong>Instead, use generic descriptions:</strong> "Middle-aged male presenting with chest pain" rather than "John Smith, age 52, MRN 12345."</p>
          </div>
          <p className="text-gray-700">Each shift log and skill log includes a <strong>No PHI</strong> checkbox that you must confirm before submitting. This serves as a reminder to review your entry for any protected information.</p>
        </div>
      ),
    },
    {
      id: 'pwa',
      title: 'Install as PWA',
      Icon: Smartphone,
      color: 'bg-purple-500',
      content: (
        <div className="space-y-4 text-sm text-gray-700">
          <p>ClinTrack is a Progressive Web App (PWA) — you can install it on your device for quick access, an app-like experience, and offline support.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">🍎 iOS (iPhone / iPad)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open ClinTrack in <strong>Safari</strong></li>
                <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> in the top right</li>
              </ol>
              <p className="text-xs text-gray-500 mt-2">Note: PWA installation is only supported in Safari on iOS.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">🤖 Android</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open ClinTrack in <strong>Chrome</strong></li>
                <li>Tap the <strong>⋮ menu</strong> (three dots, top right)</li>
                <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong></li>
                <li>Confirm by tapping <strong>"Install"</strong></li>
              </ol>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">🖥️ Desktop (Chrome / Edge)</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Look for the <strong>install icon</strong> in the address bar (or use the browser menu)</li>
              <li>Click <strong>"Install"</strong> when prompted</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      Icon: HelpCircle,
      color: 'bg-gray-600',
      content: (
        <div className="space-y-4 text-sm text-gray-700">
          {[
            { q: 'My data disappeared after clearing browser cache', a: 'ClinTrack stores data in localStorage. Clearing browser data removes it. Restore from your last exported backup via Settings → Import Backup.' },
            { q: 'Import fails with "Invalid ClinTrack backup file"', a: 'The JSON file must contain a valid "version" field and a "profiles" array. Make sure you are importing a file that was exported from ClinTrack, not edited manually.' },
            { q: 'The app looks broken or shows a white screen', a: 'Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). If that doesn\'t help, clear the site data for this URL and import your backup.' },
            { q: 'I can\'t see the Install PWA option', a: 'Make sure you are using a supported browser (Safari on iOS, Chrome on Android/desktop). The install prompt may not appear if the app is already installed.' },
            { q: 'Shift hours are calculating incorrectly', a: 'Hours are computed as (end time − start time − break minutes). Make sure your start/end times and break minutes are entered correctly. Times crossing midnight are supported.' },
            { q: 'I submitted a log but my preceptor can\'t see it', a: 'Ensure both of you are using the same exported data file. Since data is local-only, reviewers need the same dataset. Export from the student device and import on the reviewer\'s device.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <h4 className="font-semibold text-gray-900 mb-1">{q}</h4>
              <p>{a}</p>
            </div>
          ))}
        </div>
      ),
    },
  ], []);

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter(s => s.title.toLowerCase().includes(q) || s.id.includes(q));
  }, [query, sections]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-primary-500" />
          Help &amp; Guide
        </h1>
        <p className="text-gray-600">Learn how to use ClinTrack effectively</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Filter sections…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none text-sm"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No sections match your search.</p>
        )}
        {filtered.map(s => (
          <Accordion key={s.id} section={s} open={openIds.has(s.id)} toggle={() => toggle(s.id)} />
        ))}
      </div>
    </div>
  );
};

export default Help;
