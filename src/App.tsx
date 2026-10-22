import React, { useState, useEffect } from 'react';
import { HemoTwinProvider, useHemoTwin } from './context/HemoTwinContext';
import { Sidebar, NavPage } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Bags } from './pages/Bags';
import { BagDetails } from './pages/BagDetails';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Donors } from './pages/Donors';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PublicDonorProfile } from './pages/PublicDonorProfile';
import './App.css';

const MainLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavPage | 'bag-details'>('dashboard');
  const [selectedDetailBagId, setSelectedDetailBagId] = useState<string>('HT-001');
  const { selectedBagId } = useHemoTwin();

  const handleSelectBagForDetails = (bagId: string) => {
    setSelectedDetailBagId(bagId);
    setCurrentPage('bag-details');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage === 'bag-details' ? 'bags' : currentPage}
        onNavigate={(p) => setCurrentPage(p)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full bg-slate-50 text-slate-800">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'bags' && <Bags onSelectBagForDetails={handleSelectBagForDetails} />}
          {currentPage === 'bag-details' && (
            <BagDetails
              bagId={selectedDetailBagId || selectedBagId || 'HT-001'}
              onBack={() => setCurrentPage('bags')}
            />
          )}
          {currentPage === 'digital-twin' && <DigitalTwinPage />}
          {currentPage === 'donors' && <Donors />}
          {currentPage === 'analytics' && <Analytics />}
          {currentPage === 'reports' && <Reports />}
          {currentPage === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  // Simple route interception for the public donor profile
  const [isPublicProfile, setIsPublicProfile] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith('/donor/')) {
      setIsPublicProfile(true);
    }
  }, []);

  if (isPublicProfile) {
    return <PublicDonorProfile />;
  }

  return (
    <HemoTwinProvider>
      <MainLayout />
    </HemoTwinProvider>
  );
};

export default App;


