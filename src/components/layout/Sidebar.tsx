interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'issues', label: 'Issues Board', icon: '🗺️' },
    { id: 'verification', label: 'Verification Queue', icon: '🛡️' },
    { id: 'report', label: 'Report Issue', icon: '➕' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 p-4 flex flex-col h-screen">
      <div className="py-4 px-2 mb-6">
        <h1 className="text-xl font-bold text-emerald-400 tracking-tight">Community Hero</h1>
        <p className="text-xs text-slate-500 font-mono">🟢 Local Hub: Active</p>
      </div>

      <nav className="space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                : 'hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-800 pt-4 mt-auto">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white">
            👤
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Hardik Dhoot</p>
            <p className="text-xs text-emerald-400 font-semibold">Karma: 350 pts</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
