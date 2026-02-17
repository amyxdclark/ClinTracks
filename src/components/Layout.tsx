import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext';
import Navbar from './Navbar';
import ProfileSwitcher from './ProfileSwitcher';

const Layout = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const currentProfile = state.profiles.find(p => p.id === state.activeProfileId);

  useEffect(() => {
    if (!state.hasSeenOnboarding && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [state.hasSeenOnboarding, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar
        onProfileClick={() => setShowProfileSwitcher(true)}
        currentProfile={currentProfile}
      />

      {showProfileSwitcher && (
        <ProfileSwitcher onClose={() => setShowProfileSwitcher(false)} />
      )}

      <main className="md:ml-64 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
