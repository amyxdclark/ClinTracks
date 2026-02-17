import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Requirements from './pages/Requirements';
import ShiftHours from './pages/ShiftHours';
import Skills from './pages/Skills';
import Scheduling from './pages/Scheduling';
import Approvals from './pages/Approvals';
import AdminSetup from './pages/AdminSetup';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Help from './pages/Help';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requirements" element={<Requirements />} />
            <Route path="shift-hours" element={<ShiftHours />} />
            <Route path="skills" element={<Skills />} />
            <Route path="scheduling" element={<Scheduling />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="admin" element={<AdminSetup />} />
            <Route path="settings" element={<Settings />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;

