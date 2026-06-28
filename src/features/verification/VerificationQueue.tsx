import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Inbox, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Layers,
  Zap,
  RotateCcw,
  Award,
  ThumbsUp,
  FileText,
  Clock,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Issue, IssueStatus } from '../../types';
import { QueueCard } from './components/QueueCard';
import { Button } from '../../components/ui/Button';

// Mock tester personas representing community hierarchy
const TESTER_PERSONAS = [
  { id: 'tester-1', username: 'Jane Doe', karmaPoints: 45, level: 2, roleLabel: 'Citizen', voteWeight: 1 },
  { id: 'tester-2', username: 'Mark Garcia', karmaPoints: 150, level: 4, roleLabel: 'Volunteer', voteWeight: 2 },
  { id: 'tester-3', username: 'Hardik Dhoot', karmaPoints: 350, level: 8, roleLabel: 'Community Hero', voteWeight: 3 },
  { id: 'tester-4', username: 'Sarah Connor', karmaPoints: 950, level: 14, roleLabel: 'Guardian', voteWeight: 5 },
  { id: 'tester-5', username: 'Marcus Aurelius', karmaPoints: 2400, level: 25, roleLabel: 'Civic Champion', voteWeight: 8 }
];

export function VerificationQueue() {
  const { issues, castVote } = useApp();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  
  // Choose tester profile to simulate votes from different community ranks
  const [activeTesterIdx, setActiveTesterIdx] = useState(2); // Default to Community Hero (Hardik Dhoot)
  const currentTester = TESTER_PERSONAS[activeTesterIdx];

  // Active view tab in this queue panel
  const [queueView, setQueueView] = useState<'pending' | 'verified'>('pending');

  // For the celebration dynamic animation overlay
  const [celebrationIssue, setCelebrationIssue] = useState<Issue | null>(null);

  // Filter issues based on active view and status
  const pendingIssues = issues.filter(
    (issue) => issue.status === IssueStatus.PENDING_VERIFICATION
  );

  const verifiedIssues = issues.filter(
    (issue) => issue.status === IssueStatus.COMMUNITY_VERIFIED
  );

  const triggerToast = (message: string, type: 'success' | 'warning' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleVerify = (id: string) => {
    const target = issues.find((i) => i.id === id);
    if (!target) return;

    // Check if voter already casted a vote
    const alreadyVoted = target.votes?.some(v => v.userId === currentTester.id);
    if (alreadyVoted) {
      triggerToast(`You have already contributed your consensus vote on this issue! Double-voting is restricted.`, 'info');
      return;
    }

    // Call the centralized vote engine
    castVote(id, true, currentTester);

    const voteWeight = currentTester.voteWeight;
    const previousScore = target.consensusScore || 0;
    const newScore = previousScore + voteWeight;
    const targetThreshold = target.requiredConsensus || 15;

    if (newScore >= targetThreshold) {
      // Automatic verified transition -> Trigger Success Celebration Animation!
      setCelebrationIssue({
        ...target,
        consensusScore: newScore,
        votes: [...(target.votes || []), {
          userId: currentTester.id,
          username: currentTester.username,
          karmaPoints: currentTester.karmaPoints,
          voteWeight: currentTester.voteWeight,
          isApproved: true,
          timestamp: new Date().toISOString()
        }]
      });
    } else {
      triggerToast(
        `Vote registered! Contributed +${voteWeight} consensus points. Current score is ${newScore} PTS.`,
        'success'
      );
    }
  };

  const handleReportFake = (id: string) => {
    const target = issues.find((i) => i.id === id);
    if (!target) return;

    // Check if voter already casted a vote
    const alreadyVoted = target.votes?.some(v => v.userId === currentTester.id);
    if (alreadyVoted) {
      triggerToast(`You have already contributed your consensus vote on this issue! Double-voting is restricted.`, 'info');
      return;
    }

    // Call the centralized vote engine
    castVote(id, false, currentTester);

    const voteWeight = currentTester.voteWeight;
    const previousScore = target.consensusScore || 0;
    const newScore = previousScore - voteWeight;

    if (newScore <= -30) {
      triggerToast(`🚨 REJECTED! "${target.aiAnalysis.summary}" dropped to ${newScore} PTS and was rejected by community consensus.`, 'warning');
    } else {
      triggerToast(
        `Spam report registered! Contributed -${voteWeight} consensus points. Current score is ${newScore} PTS.`,
        'warning'
      );
    }
  };

  const handleSkip = (id: string) => {
    const target = issues.find((i) => i.id === id);
    if (!target) return;

    triggerToast(`⏭ Deferred: "${target.aiAnalysis.summary || 'Issue'}" skipped. Postponed in your validation feed.`, 'info');
  };

  const handleResetQueue = () => {
    localStorage.removeItem('community_issues');
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100" id="verification-queue-container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/15">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 animate-fade-in">
              Community Verification Queue
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Audit pending citizen reports using our decentralized consensus engine. Cast weighted votes to verify issues or flag them as spam.
          </p>
        </div>

        {/* Workload Widget */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800/80 p-3.5 rounded-2xl shrink-0 shadow-lg">
          <div className="text-right">
            <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Awaiting Consensus</p>
            <p className="text-lg font-bold font-mono text-emerald-400">{pendingIssues.length} reports</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Profile Tester Switcher HUD */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Award className="w-4.5 h-4.5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200">Interactive Voter Persona Selector</h2>
          </div>
          <span className="text-3xs font-mono text-slate-500 uppercase tracking-widest">
            Simulating: <span className="text-emerald-400 font-bold">{currentTester.username}</span> ({currentTester.roleLabel})
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Select a citizen persona below to simulate casting verification or rejection votes with different karma influence weights:
        </p>

        {/* Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {TESTER_PERSONAS.map((p, idx) => {
            const isActive = activeTesterIdx === idx;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTesterIdx(idx)}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 border-emerald-500 text-slate-200 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-900 border-slate-800/60 hover:bg-slate-850 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-3xs font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {p.roleLabel}
                  </span>
                  <span className={`text-3xs font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-500'}`}>
                    WT: +{p.voteWeight}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-2 truncate">{p.username}</p>
                <p className="text-3xs text-slate-500 font-mono mt-0.5">Karma: {p.karmaPoints} pts</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification List Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setQueueView('pending')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all ${
            queueView === 'pending'
              ? 'border-emerald-500 text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Active Queue ({pendingIssues.length})
        </button>
        <button
          onClick={() => setQueueView('verified')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all ${
            queueView === 'verified'
              ? 'border-emerald-500 text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Community Verified Issues ({verifiedIssues.length})
        </button>
      </div>

      {/* Floating Alerts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 p-4.5 rounded-2xl shadow-2xl border text-xs max-w-md flex items-start space-x-3.5 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/30 shadow-emerald-950/20'
                : toast.type === 'warning'
                ? 'bg-red-950/95 text-red-200 border-red-500/30 shadow-red-950/20'
                : 'bg-slate-900/95 text-slate-200 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            
            <div className="flex-1 space-y-1">
              <p className="font-bold text-slate-100 tracking-wide text-xs">
                {toast.type === 'success' ? 'Consensus Advanced' : toast.type === 'warning' ? 'Discrepancy Reported' : 'Queue Bulletin'}
              </p>
              <p className="text-slate-300 leading-relaxed text-3xs sm:text-2xs font-mono">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation Dialog */}
      <AnimatePresence>
        {celebrationIssue && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-slate-900 border border-emerald-500/30 max-w-lg w-full rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Confetti simulation rays in background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 shadow-inner animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">🎉 Community Verified!</h2>
                  <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold">
                    Consensus Threshold Reached
                  </p>
                </div>

                <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 text-left space-y-2.5">
                  <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Verified Asset</p>
                  <p className="text-sm font-bold text-slate-200 line-clamp-2">
                    {celebrationIssue.aiAnalysis.summary}
                  </p>
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-2xs text-slate-400 font-mono">
                    <span>Consensus Score:</span>
                    <span className="text-emerald-400 font-bold">+{celebrationIssue.consensusScore} PTS</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-slate-400 font-mono">
                    <span>Total Contributors:</span>
                    <span className="text-slate-300 font-bold">{celebrationIssue.votes?.length || 1} peers</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  This issue has successfully reached community consensus. It has been moved to the <span className="text-slate-200 font-semibold">Community Verified Issues</span> board and greenlit for department dispatch.
                </p>

                <div className="pt-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCelebrationIssue(null);
                      setQueueView('verified');
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Excellent
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Queue stream panel */}
      <div className="space-y-5">
        {queueView === 'pending' ? (
          pendingIssues.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {pendingIssues.map((issue) => (
                  <QueueCard
                    key={issue.id}
                    issue={issue}
                    onVerify={handleVerify}
                    onReportFake={handleReportFake}
                    onSkip={handleSkip}
                    activeVoter={currentTester}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State Pending */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-14 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4"
              id="verification-empty-state"
            >
              <div className="p-4 bg-emerald-500/5 text-emerald-500/70 rounded-full border border-emerald-500/10 relative">
                <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping opacity-30"></div>
                <Inbox className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-200">Verification Queue Empty</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All citizen reports have been verified! There are no outstanding anomalies awaiting consensus audits. Create new issues using the "Report Issue" panel to see them here.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleResetQueue}
                  className="flex items-center space-x-1.5 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800 text-xs py-1.5 px-3.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-seed Queue Data</span>
                </Button>
              </div>
            </motion.div>
          )
        ) : (
          /* Verified Tab */
          verifiedIssues.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {verifiedIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="bg-slate-900/90 border border-emerald-500/15 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <span className="text-2xl shrink-0 p-2.5 bg-emerald-500/10 rounded-xl leading-none">
                      {issue.category === 'TRANSPORTATION' ? '🚧' : issue.category === 'WATER_SUPPLY' ? '💧' : '📍'}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md text-3xs font-mono font-bold uppercase tracking-wider">
                          Verified
                        </span>
                        <span className="text-3xs font-mono text-slate-500">ID: {issue.id.slice(0, 8)}</span>
                      </div>
                      <h4 className="font-bold text-slate-200 truncate pr-4 text-sm">
                        {issue.aiAnalysis.summary}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        &ldquo;{issue.description}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 shrink-0 md:text-right self-end md:self-auto">
                    <div>
                      <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Final Consensus</p>
                      <p className="text-emerald-400 font-mono text-xs font-bold mt-0.5 flex items-center md:justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>+{issue.consensusScore} PTS</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State Verified */
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-14 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-3">
              <BookmarkCheck className="w-10 h-10 text-slate-600" />
              <h3 className="text-base font-bold text-slate-200">No Verified Issues Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Peer reviews have not approved any reports to full consensus status yet. Go back to the Active Queue and contribute votes!
              </p>
            </div>
          )
        )}
      </div>

      {/* Explanatory Footer Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/60 p-5 rounded-xl flex items-start space-x-3.5">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
          <Zap className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-semibold text-slate-200">System Mechanics Checklist</h4>
          <p className="text-slate-400 leading-relaxed">
            Consensus scoring relies on peer verification. Each successful verification or rejection aligns user action against Gemini's initial confidence indicators, increasing or decreasing overall system integrity scores dynamically.
          </p>
        </div>
      </div>
    </div>
  );
}
