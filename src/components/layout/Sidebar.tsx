import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { getLevelConfig } from '../../utils/levelUtils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { session, profile, isAdmin, signOut } = useAuth();
  
  const karma = profile?.karma_points || 0;
  const levelConfig = getLevelConfig(karma);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'issues', label: 'Issues Board', icon: '🗺️' },
    { id: 'verification', label: 'Verification Queue', icon: '🛡️' },
    { id: 'report', label: 'Report Issue', icon: '➕' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Moderation', icon: '⚙️' }] : []),
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
        {session ? (
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3 min-w-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                  {profile?.username?.charAt(0).toUpperCase() || '👤'}
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${levelConfig.color}`}>
                  {profile?.username || 'Citizen'}
                </p>
                <p className="text-xs text-emerald-400 font-semibold truncate flex items-center gap-1">
                  <span className="opacity-75">{levelConfig.title}</span>
                  <span className="opacity-50">•</span>
                  <span>{karma} pts</span>
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                signOut();
              }}
              title="Sign out"
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('auth')}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <span>Sign In to Participate</span>
          </button>
        )}
      </div>
    </aside>
  );
}
