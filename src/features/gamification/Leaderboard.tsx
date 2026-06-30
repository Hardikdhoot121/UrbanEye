import { useApp } from '../../context/AppContext';
import { IssueStatus } from '../../types';
import { Award, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export function Leaderboard() {
  const { issues } = useApp();

  const mockHeroes = [
    { rank: 1, name: 'Alice Smith', level: 12, karma: 1240, badge: 'Grid Guardian' },
    { rank: 2, name: 'Bob Johnson', level: 9, karma: 950, badge: 'Pothole Patrol' },
    { rank: 3, name: 'Charlie Brown', level: 8, karma: 810, badge: 'Water Guard' },
  ];

  // Load actual community verified issues
  const verifiedIssues = issues.filter((i) => 
    i.status === IssueStatus.APPROVED || 
    i.status === IssueStatus.RESOLVED
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-slate-100" id="leaderboard-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <span>Citizen Engagement Hub</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review neighborhood verifications, track leaderboards, and see consensus achievements.</p>
        </div>
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mockHeroes.map((hero) => (
          <div key={hero.rank} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4 shadow-lg">
            <span className="text-2xl font-extrabold text-amber-500 font-mono">#{hero.rank}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-200 truncate">{hero.name}</h4>
              <p className="text-xs text-slate-400">Level {hero.level} • {hero.badge}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-400 font-mono">{hero.karma}</p>
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Karma pts</p>
            </div>
          </div>
        ))}
      </div>

      {/* Community Verified Issues */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Community Verified and Approved by Admin</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Issues that have achieved consensus threshold approvals (+15 PTS) and are greenlit for city-department dispatch.
            </p>
          </div>
          <span className="text-2xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2.5 py-1 rounded-lg">
            {verifiedIssues.length} Verified
          </span>
        </div>

        {verifiedIssues.length > 0 ? (
          <div className="divide-y divide-slate-800 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
            {verifiedIssues.map((issue) => (
              <div key={issue.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/20 transition-all">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="text-xl shrink-0 p-2 bg-emerald-500/10 rounded-lg leading-none">
                    {issue.category === 'TRANSPORTATION' ? '🚧' : issue.category === 'WATER_SUPPLY' ? '💧' : '📍'}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-200 truncate">
                      {issue.aiAnalysis.summary}
                    </h4>
                    <div className="flex items-center space-x-2 text-3xs font-mono text-slate-500 uppercase mt-0.5">
                      <span>{issue.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>By {issue.reporter.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 sm:text-right self-end sm:self-auto">
                  <div>
                    <div className="flex items-center sm:justify-end text-emerald-400 font-mono text-xs font-bold space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>+{issue.consensusScore} PTS</span>
                    </div>
                    <p className="text-3xs font-mono text-slate-500 uppercase mt-0.5">Community Weight</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-950 text-center text-slate-500 py-12 text-sm">
            No reports currently community-verified. Vote in the Verification Queue to help verify pending anomalies!
          </div>
        )}
      </div>
    </div>
  );
}
