import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  MapPin, 
  User, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Users,
  Vote,
  Target
} from 'lucide-react';
import { Issue, IssueCategory, Severity } from '../../../types';
import { Button } from '../../../components/ui/Button';

interface TesterVoter {
  id: string;
  username: string;
  karmaPoints: number;
  level: number;
  roleLabel: string;
  voteWeight: number;
}

interface QueueCardProps {
  issue: Issue;
  onVerify: (id: string, voter: TesterVoter) => void;
  onReportFake: (id: string, voter: TesterVoter) => void;
  onSkip: (id: string) => void;
  activeVoter: TesterVoter;
  key?: string | number;
}

export function QueueCard({ issue, onVerify, onReportFake, onSkip, activeVoter }: QueueCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case IssueCategory.TRANSPORTATION: return '🚧';
      case IssueCategory.WATER_SUPPLY: return '💧';
      case IssueCategory.STREETLIGHTS: return '💡';
      case IssueCategory.WASTE_MANAGEMENT: return '♻️';
      case IssueCategory.PUBLIC_SAFETY: return '🚨';
      case IssueCategory.UTILITIES: return '⚡';
      case IssueCategory.INFRASTRUCTURE: return '🏗️';
      case IssueCategory.ENVIRONMENT: return '🌿';
      case IssueCategory.SEWAGE_DRAINAGE: return '🌀';
      case IssueCategory.OTHER:
      default:
        return '📍';
    }
  };

  const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case Severity.HIGH:
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case Severity.MEDIUM:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case Severity.LOW:
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getVoterBadgeColor = (weight: number) => {
    if (weight >= 8) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (weight >= 5) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    if (weight >= 3) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (weight >= 2) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  // Consensus analytics
  const score = issue.consensusScore || 0;
  const target = issue.requiredConsensus || 15;
  const progressPercent = Math.max(0, Math.min(100, (score / target) * 100));
  const remainingPoints = Math.max(0, target - score);
  const numContributors = issue.votes ? issue.votes.length : 0;

  // Check if current active selector already voted on this card
  const hasVoted = issue.votes?.some(v => v.userId === activeVoter.id);
  const userVote = issue.votes?.find(v => v.userId === activeVoter.id);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl hover:border-slate-700/50 transition-all flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80"
        id={`queue-card-${issue.id}`}
      >
        {/* Visual / Image Section */}
        <div className="w-full lg:w-72 h-56 lg:h-auto relative shrink-0 bg-slate-950 flex flex-col justify-between overflow-hidden group">
          {issue.imageUrl ? (
            <img 
              src={issue.imageUrl} 
              alt={issue.aiAnalysis.summary}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                <span className="text-3xl">{getCategoryIcon(issue.category)}</span>
              </div>
              <div>
                <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest">Awaiting Capture</p>
                <p className="text-3xs text-slate-600 mt-1">Satellite location grid active</p>
              </div>
            </div>
          )}

          {/* Background tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none"></div>

          {/* Severity Overlay Badge */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-3xs font-bold tracking-widest uppercase border backdrop-blur-sm ${getSeverityStyles(issue.severity)}`}>
              {issue.severity} Severity
            </span>
          </div>

          {/* AI Confidence HUD overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 px-3 py-2 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">AI Match Confidence</span>
            </div>
            <span className="text-xs font-bold font-mono text-emerald-400">{issue.aiAnalysis.confidence}%</span>
          </div>
        </div>

        {/* Content & Control Panel */}
        <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
          {/* Top segment: Categories & Stats */}
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl bg-slate-950 p-1.5 rounded-lg border border-slate-800/60 leading-none">
                  {getCategoryIcon(issue.category)}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-200 font-mono tracking-wider uppercase">
                    {issue.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-3xs font-mono text-slate-500 uppercase">
                    <span>ID: {issue.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span className="text-amber-400">Consensus Pending</span>
                  </div>
                </div>
              </div>

              {/* Status & Trust metrics */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-3xs font-mono font-bold uppercase tracking-wider ${getTrustColor(issue.trustScore)}`}>
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Trust Score: {issue.trustScore}%</span>
                </div>
              </div>
            </div>

            {/* AI Summary and Citizen description */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100 tracking-tight leading-snug">
                {issue.aiAnalysis.summary || "Pending neighborhood dispatch description"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 italic">
                &ldquo;{issue.description}&rdquo;
              </p>
            </div>
          </div>

          {/* Middle Segment: Community Consensus System HUD */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4.5 space-y-3">
            {/* Header statistics */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Community Consensus</span>
                <span className="text-slate-500 font-mono text-3xs">({numContributors} contributors)</span>
              </div>
              <div className="font-mono text-right">
                <span className={`font-bold ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{score}</span>
                <span className="text-slate-500"> / {target} PTS</span>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/50 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`h-full rounded-full ${score < 0 ? 'bg-red-500' : progressPercent >= 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-emerald-500'}`}
                ></motion.div>
              </div>
              
              <div className="flex items-center justify-between text-3xs font-mono text-slate-400">
                <span className="text-slate-500 uppercase tracking-wider">Consensus Target</span>
                {remainingPoints > 0 ? (
                  <span className="text-amber-400 animate-pulse font-bold">{remainingPoints} PTS REMAINING</span>
                ) : (
                  <span className="text-emerald-400 font-bold uppercase">THRESHOLD ACHIEVED</span>
                )}
              </div>
            </div>

            {/* Voter contributions feed */}
            {issue.votes && issue.votes.length > 0 ? (
              <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <Vote className="w-3 h-3 text-slate-500" />
                  <span className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Voter Timeline:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-w-[75%] justify-end">
                  {issue.votes.map((v, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2 py-0.5 rounded text-3xs font-mono border ${getVoterBadgeColor(v.voteWeight)}`}
                      title={`Voted ${v.isApproved ? 'Approved' : 'Fake'} with weight ${v.voteWeight} points`}
                    >
                      {v.username} ({v.isApproved ? '+' : '-'}{v.voteWeight})
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-3xs font-mono text-slate-600">
                <span>Waiting for initial consensus contribution...</span>
                <span>Minimum weight required: +1</span>
              </div>
            )}
          </div>

          {/* Bottom Segment: Metadata details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40 text-xs">
            {/* Reporter */}
            <div className="space-y-0.5">
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Original Reporter</span>
              </p>
              <p className="font-semibold text-slate-300 truncate">{issue.reporter.username}</p>
              <p className="text-3xs text-emerald-400 font-semibold font-mono">
                Level {issue.reporter.level || 1} • {issue.reporter.karmaPoints || 0} pts
              </p>
            </div>

            {/* Location */}
            <div className="space-y-0.5">
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Approx. Location</span>
              </p>
              <p className="font-semibold text-slate-300 truncate">San Francisco, CA</p>
              <p className="text-3xs text-slate-500 font-mono">
                {issue.coordinates.latitude.toFixed(4)}, {issue.coordinates.longitude.toFixed(4)}
              </p>
            </div>

            {/* Time */}
            <div className="space-y-0.5">
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Age / Timestamp</span>
              </p>
              <p className="font-semibold text-slate-300 truncate">{formatDate(issue.createdAt)}</p>
              <p className="text-3xs text-slate-500 font-mono">Consensus pending</p>
            </div>
          </div>

          {/* Action Footer: Voting buttons with feedback based on voter profile weight */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {hasVoted ? (
                <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono flex items-center space-x-2 text-slate-400">
                  <CheckCircle className={`w-4 h-4 ${userVote?.isApproved ? 'text-emerald-400' : 'text-red-400'}`} />
                  <span>
                    You contributed {userVote?.isApproved ? '+' : '-'}{userVote?.voteWeight} consensus points
                  </span>
                </div>
              ) : (
                <>
                  <Button 
                    variant="primary" 
                    onClick={() => onVerify(issue.id, activeVoter)}
                    className="flex items-center justify-center space-x-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-600 hover:text-white px-4 py-2 text-xs font-semibold"
                    id={`btn-contribute-verify-${issue.id}`}
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Verify (Contribute +{activeVoter.voteWeight})</span>
                  </Button>

                  <Button 
                    variant="danger" 
                    onClick={() => onReportFake(issue.id, activeVoter)}
                    className="flex items-center justify-center space-x-2 bg-red-600/10 text-red-400 border border-red-500/25 hover:bg-red-600 hover:text-white px-4 py-2 text-xs font-semibold"
                    id={`btn-report-fake-${issue.id}`}
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Report Fake (-{activeVoter.voteWeight})</span>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowDetails(true)}
                className="flex items-center space-x-1.5 text-slate-300 hover:text-white hover:bg-slate-800 px-3.5 py-2 text-xs"
                id={`btn-details-${issue.id}`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>View Details</span>
              </Button>

              <Button 
                variant="secondary" 
                onClick={() => onSkip(issue.id)}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-3.5 py-2 text-xs"
                id={`btn-skip-${issue.id}`}
              >
                <span>Skip</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details interactive overlay modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Consensus & Diagnostic Detail</h3>
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Autonomous verify engine</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors font-mono text-xs"
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Main Content Info */}
              <div className="space-y-5">
                {issue.imageUrl && (
                  <div className="relative h-52 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={issue.imageUrl} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                {/* Consensus metrics panel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Consensus Threshold Diagnostics</span>
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                    <div>
                      <p className="text-3xs font-mono text-slate-500">Current Score</p>
                      <p className="text-lg font-bold font-mono text-slate-200">{score} PTS</p>
                    </div>
                    <div>
                      <p className="text-3xs font-mono text-slate-500">Target Score</p>
                      <p className="text-lg font-bold font-mono text-slate-200">{target} PTS</p>
                    </div>
                    <div>
                      <p className="text-3xs font-mono text-slate-500">Required Remaining</p>
                      <p className="text-lg font-bold font-mono text-amber-400">{remainingPoints} PTS</p>
                    </div>
                    <div>
                      <p className="text-3xs font-mono text-slate-500">Contributors</p>
                      <p className="text-lg font-bold font-mono text-emerald-400">{numContributors}</p>
                    </div>
                  </div>
                </div>

                {/* Grid descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Reporter Description</p>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 min-h-[90px] leading-relaxed">
                      {issue.description}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">AI Verification reasoning</p>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 min-h-[90px] leading-relaxed">
                      {issue.aiAnalysis.reason || "Autonomous visual classification matches high density failure profiles."}
                    </div>
                  </div>
                </div>

                {/* Suggested actions list */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 space-y-1.5">
                  <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Autonomous Dispatch Advice</p>
                  <p className="text-xs text-slate-200 flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{issue.aiAnalysis.suggestedAction || "Broadcast verified incident markers on district routing databases."}</span>
                  </p>
                </div>

                {/* Timeline and Votes details */}
                <div className="space-y-2">
                  <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Vote Audit Log</p>
                  {issue.votes && issue.votes.length > 0 ? (
                    <div className="bg-slate-950 rounded-xl border border-slate-850 divide-y divide-slate-900 overflow-hidden">
                      {issue.votes.map((v, i) => (
                        <div key={i} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-slate-300 font-medium">{v.username}</span>
                            <span className="text-3xs text-slate-500 font-mono">Karma {v.karmaPoints}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-3xs font-mono border ${getVoterBadgeColor(v.voteWeight)}`}>
                              Weight: {v.isApproved ? '+' : '-'}{v.voteWeight} PTS
                            </span>
                            <span className="text-3xs text-slate-500 font-mono">{formatDate(v.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950 rounded-xl border border-slate-850">
                      No verification votes have been cast yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                {!hasVoted && (
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setShowDetails(false);
                      onVerify(issue.id, activeVoter);
                    }}
                  >
                    Approve (+{activeVoter.voteWeight} Points)
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
