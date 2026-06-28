import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPanel } from './features/dashboard/DashboardPanel';
import { MapVisualizer } from './features/map/MapVisualizer';
import { ReportWizard } from './features/reporting/ReportWizard';
import { Leaderboard } from './features/gamification/Leaderboard';
import { VerificationQueue } from './features/verification/VerificationQueue';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <AppProvider>
      <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderActivePanel()}
        </main>
      </div>
    </AppProvider>
  );
}
