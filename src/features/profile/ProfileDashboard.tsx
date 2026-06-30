import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, Shield, Clock, MapPin, 
  CheckCircle, AlertTriangle, XCircle, Droplets, Leaf, Activity, Settings, Bell, Palette, LogOut, Star, Edit2, Check
} from 'lucide-react';
import { IssueStatus } from '../../types/issue';
import { getKarmaProgress, getUnlockedBadges } from '../../utils/levelUtils';
import { supabase } from '../../lib/supabase';

export function ProfileDashboard() {
  const { session, profile, signOut } = useAuth();
  const { issues } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.username || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Temporary mock data aggregation until Supabase backend is fully connected
  const stats = useMemo(() => {
    const userIssues = issues.filter(i => i.reporter.id === session?.user?.id);
    return {
      reportsCreated: userIssues.length,
      reportsApproved: userIssues.filter(i => i.status === IssueStatus.APPROVED).length,
      reportsResolved: userIssues.filter(i => i.status === IssueStatus.RESOLVED).length,
      reportsRejected: userIssues.filter(i => i.status === IssueStatus.REJECTED).length,
      reportsPending: userIssues.filter(i => 
        i.status === IssueStatus.PENDING_VERIFICATION || i.status === IssueStatus.COMMUNITY_VERIFIED
      ).length,
      votesCast: profile?.karma_points ? Math.floor(profile.karma_points / 2) : 0, // Mock calculation
      duplicatesPrevented: 3, // Mock data
      waterSaved: userIssues.length * 450, // Mock data
      carbonOffset: userIssues.length * 15 // Mock data
    };
  }, [issues, session, profile]);

  // Generate real activity timeline from issues and votes
  const recentActivities = useMemo(() => {
    const activities: Array<{ id: string; type: string; title: string; desc: string; date: Date; icon: any; color: string }> = [];
    
    issues.filter(i => i.reporter.id === session?.user?.id).forEach(issue => {
      activities.push({
        id: `report-${issue.id}`,
        type: 'report',
        title: 'Reported Issue',
        desc: `Submitted a ${issue.category.toLowerCase().replace(/_/g, ' ')} report.`,
        date: new Date(issue.createdAt || Date.now()),
        icon: MapPin,
        color: 'text-blue-400 bg-blue-500/20'
      });
    });

    issues.forEach(issue => {
      const userVote = issue.votes?.find(v => v.userId === session?.user?.id);
      if (userVote) {
        activities.push({
          id: `vote-${issue.id}-${userVote.timestamp}`,
          type: 'vote',
          title: 'Voted on Issue',
          desc: `${userVote.isApproved ? 'Verified' : 'Flagged'} a report.`,
          date: new Date(userVote.timestamp),
          icon: Shield,
          color: 'text-emerald-400 bg-emerald-500/20'
        });
      }
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [issues, session]);

  const karmaStats = getKarmaProgress(profile?.karma_points || 0);
  const badges = getUnlockedBadges(profile?.karma_points || 0, stats.reportsCreated);

  const handleSaveName = async () => {
    if (!newName.trim() || !session?.user?.id) return;
    setIsSavingName(true);
    const { error } = await supabase.from('profiles').update({ username: newName.trim() }).eq('id', session.user.id);
    if (!error) {
      setIsEditingName(false);
    }
    setIsSavingName(false);
  };

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Please sign in to view your Command Center.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-8 space-y-8">
      {/* 1. Premium Profile Header */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 overflow-hidden shadow-2xl shadow-emerald-900/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl object-cover" 
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-xl">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {profile?.username?.charAt(0).toUpperCase() || '👤'}
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold text-xl w-48 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(profile?.username || '');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 group">
                  {profile?.username || 'Citizen'}
                </h1>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                profile?.role === 'admin' 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {profile?.role === 'admin' ? 'System Admin' : 'Active Citizen'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">{session.user?.email}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Trophy className={`w-4 h-4 ${karmaStats.color}`} />
                <span>Level <strong className="text-white">{karmaStats.currentLevel}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${karmaStats.color}`} />
                <span className={`font-bold ${karmaStats.color}`}>{karmaStats.currentTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Joined <strong className="text-white">{(profile as any)?.created_at ? new Date((profile as any).created_at).toLocaleDateString() : 'Today'}</strong></span>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-20 bg-slate-800" />
          
          <div className="w-full md:w-auto min-w-[200px]">
            {/* 2. Karma Progress */}
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-400">Karma XP</span>
              <span className={`${karmaStats.color} font-mono font-bold`}>
                {karmaStats.currentKarma} {karmaStats.isMaxLevel ? '' : `/ ${karmaStats.currentKarma + (karmaStats.karmaRequiredForNext || 0)}`}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${karmaStats.progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">
              {karmaStats.isMaxLevel ? (
                <span className="text-amber-400 font-bold tracking-wider">MAX LEVEL ACHIEVED</span>
              ) : (
                `${karmaStats.karmaRequiredForNext} XP to reach ${karmaStats.currentLevel + 1}`
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. Community Impact Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Community Impact
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Trust Score</p>
                <p className="text-2xl font-bold text-emerald-400">98%</p>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Reports</p>
                <p className="text-2xl font-bold text-white">{stats.reportsCreated}</p>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Votes Cast</p>
                <p className="text-2xl font-bold text-white">{stats.votesCast}</p>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Dupes Caught</p>
                <p className="text-2xl font-bold text-teal-400">{stats.duplicatesPrevented}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-950/20 rounded-xl p-4 border border-emerald-900/30 flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Water Saved</p>
                  <p className="text-xl font-bold text-white">{stats.waterSaved.toLocaleString()} <span className="text-sm font-normal text-slate-500">GAL</span></p>
                </div>
              </div>
              <div className="bg-emerald-950/20 rounded-xl p-4 border border-emerald-900/30 flex items-center gap-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Carbon Offset</p>
                  <p className="text-xl font-bold text-white">{stats.carbonOffset.toLocaleString()} <span className="text-sm font-normal text-slate-500">KG</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. My Reports Overview */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              My Reports Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-amber-500/30 transition-colors">
                <Clock className="w-6 h-6 text-amber-400 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.reportsPending}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Pending</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                <Shield className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.reportsApproved}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Approved</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-blue-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-blue-400 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.reportsResolved}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Resolved</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-rose-500/30 transition-colors">
                <XCircle className="w-6 h-6 text-rose-400 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.reportsRejected}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Rejected</span>
              </div>
            </div>
          </div>

          {/* 5. Recent Activity Timeline */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  // Calculate relative time like "2h ago"
                  const diffMs = Date.now() - activity.date.getTime();
                  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffHrs / 24);
                  const timeStr = diffDays > 0 ? `${diffDays}d ago` : diffHrs > 0 ? `${diffHrs}h ago` : 'Just now';

                  return (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${activity.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-950 border border-slate-800/50 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-white text-sm">{activity.title}</h4>
                          <span className="text-xs text-slate-500">{timeStr}</span>
                        </div>
                        <p className="text-sm text-slate-400">{activity.desc}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <p className="text-slate-500 text-sm">No recent activity found. Start reporting issues to build your history!</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* 4. Achievement Badges */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Achievements
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {badges.map(badge => (
                <div 
                  key={badge.id}
                  className={`aspect-square flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    badge.isEarned 
                      ? 'bg-slate-800/50 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                      : 'bg-slate-950 border-slate-800/50 opacity-40 grayscale'
                  }`}
                  title={badge.name}
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-[10px] text-center text-slate-300 font-medium leading-tight truncate w-full px-1">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Quick Actions */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setNewName(profile?.username || '');
                  setIsEditingName(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-sm">Edit Profile Name</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                <Palette className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-sm">Appearance</span>
              </button>
              <div className="h-px bg-slate-800 my-2" />
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
