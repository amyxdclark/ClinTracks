import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { ArrowRight, ArrowLeft, Shield, Users, Clock, ClipboardCheck, CheckCircle } from 'lucide-react';

const TOTAL_STEPS = 4;

const roles = [
  { name: 'Student', color: 'bg-blue-100 text-blue-800', desc: 'Log clinical requirements, shift hours, and skills. Submit work for review and track progress toward program completion.' },
  { name: 'Preceptor', color: 'bg-green-100 text-green-800', desc: 'Review and approve student shift hours and skill logs. Provide feedback and verify clinical competencies.' },
  { name: 'Instructor', color: 'bg-indigo-100 text-indigo-800', desc: 'Oversee student progress across cohorts, review submissions, and manage requirement templates.' },
  { name: 'Coordinator', color: 'bg-purple-100 text-purple-800', desc: 'Manage site capacity, coordinate student placements, and oversee scheduling across programs.' },
  { name: 'Program Admin', color: 'bg-red-100 text-red-800', desc: 'Full system access including user management, program configuration, and data oversight.' },
];

const Onboarding = () => {
  const { updateState } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const complete = () => {
    updateState(prev => ({ ...prev, hasSeenOnboarding: true }));
    navigate('/dashboard');
  };

  const next = () => (step < TOTAL_STEPS - 1 ? setStep(step + 1) : complete());
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Step 0 — Welcome */}
        {step === 0 && (
          <>
            <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500 text-white p-10 text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h1 className="text-4xl font-bold mb-2">Welcome to ClinTrack!</h1>
              <p className="text-lg opacity-90">Your Clinical Requirements Companion</p>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-center text-lg leading-relaxed">
                ClinTrack helps EMS and Nursing students track clinical requirements, log shift hours,
                manage skills, and coordinate site schedules — all from your device, with privacy built in.
              </p>
            </div>
          </>
        )}

        {/* Step 1 — Features */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You Can Do</h2>
            <div className="space-y-4">
              {[
                { Icon: ClipboardCheck, bg: 'bg-blue-50', title: 'Requirements Tracking', desc: 'Log and manage clinical skills and requirement progress toward program completion.' },
                { Icon: Clock, bg: 'bg-green-50', title: 'Shift Logging', desc: 'Record clinical hours at different sites and submit them for preceptor approval.' },
                { Icon: Users, bg: 'bg-purple-50', title: 'Scheduling', desc: 'View site capacity and coordinate clinical placements with your program.' },
                { Icon: Shield, bg: 'bg-pink-50', title: 'Privacy-First', desc: 'All data stays on your device. Built-in reminders help you avoid recording PHI.' },
              ].map(({ Icon, bg, title, desc }) => (
                <div key={title} className={`flex items-start gap-4 p-4 ${bg} rounded-lg`}>
                  <Icon className="w-7 h-7 mt-0.5 shrink-0 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Roles */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Five Roles, One App</h2>
            <p className="text-gray-500 text-center text-sm mb-6">Switch profiles any time to explore each role.</p>
            <div className="space-y-3">
              {roles.map(r => (
                <div key={r.name} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${r.color}`}>{r.name}</span>
                  <p className="text-sm text-gray-600">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Privacy & Get Started */}
        {step === 3 && (
          <div className="p-8">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Notice</h2>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
              <p className="text-sm text-red-800 font-semibold mb-2">
                Never include Protected Health Information (PHI)
              </p>
              <p className="text-sm text-red-700">
                Do not enter patient names, medical record numbers, dates of birth, addresses, or any other
                identifiable patient information. Use generic descriptions only (e.g., "middle-aged male").
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Quick Tips
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All data is stored locally — nothing is sent to a server</li>
                <li>• Export backups regularly from Settings</li>
                <li>• Works offline as a Progressive Web App</li>
              </ul>
            </div>
            <button
              onClick={complete}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Get Started
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div>
            {step > 0 && (
              <button onClick={back} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-primary-500' : 'bg-gray-300'}`} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={complete} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Skip
            </button>
            {step < TOTAL_STEPS - 1 && (
              <button onClick={next} className="inline-flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
