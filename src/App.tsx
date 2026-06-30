import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPanel } from './features/dashboard/DashboardPanel';
import { MapVisualizer } from './features/map/MapVisualizer';
import { ReportWizard } from './features/reporting/ReportWizard';
import { Leaderboard } from './features/gamification/Leaderboard';
import { VerificationQueue } from './features/verification/VerificationQueue';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './features/auth/AuthPage';
import { ProfileDashboard } from './features/profile/ProfileDashboard';

// Inner component to access auth context
function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { session, isLoading } = useAuth();

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'issues':
        return <MapVisualizer />;
      case 'verification':
        return <VerificationQueue />;
      case 'report':
        return <ReportWizard />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <ProfileDashboard />;
      case 'auth':
        return <AuthPage onAuthSuccess={() => setActiveTab('dashboard')} />;
      default:
        return <DashboardPanel />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-mono">Loading session...</div>;
  }

  return (
    <AppProvider>
      <div className="flex bg-slate-950 h-screen overflow-hidden text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 md:pt-0">
          {renderActivePanel()}
        </main>
      </div>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
