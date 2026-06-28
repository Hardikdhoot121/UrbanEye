import { AlertTriangle, ShieldCheck, Heart, ArrowRight, ArrowLeft, RefreshCw, Layers, CheckCircle2, Navigation, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Issue, IssueStatus } from '../../../types';

interface DuplicateDetectionCardProps {
  existingIssue: Issue;
  distanceMeters: number;
  similarityScore: number;
  onSupportExisting: () => void;
  onCreateAnyway: () => void;
  onBack: () => void;
}

export function DuplicateDetectionCard({
  existingIssue,
  distanceMeters,
  similarityScore,
  onSupportExisting,
  onCreateAnyway,
  onBack
}: DuplicateDetectionCardProps) {
  
  const statusColors = {
    [IssueStatus.VERIFIED]: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    [IssueStatus.PENDING_VERIFICATION]: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    [IssueStatus.RESOLVED]: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    [IssueStatus.REJECTED]: 'text-red-400 bg-red-500/10 border-red-500/20',
  }[existingIssue.status] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  const statusLabel = {
    [IssueStatus.VERIFIED]: 'Verified',
    [IssueStatus.PENDING_VERIFICATION]: 'Pending Audit',
    [IssueStatus.RESOLVED]: 'Resolved',
    [IssueStatus.REJECTED]: 'Rejected',
  }[existingIssue.status] || existingIssue.status;

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl space-y-5 p-6 animate-fade-in" id="duplicate-detection-card">
      
      {/* Alert Warning Header */}
      <div className="flex items-start space-x-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
        <AlertTriangle className="w-5.5 h-5.5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">Potential Duplicate Detected</h3>
          <p className="text-xs text-slate-300 leading-normal">
            Our neighborhood mapping engine has matched your report with an existing incident in this immediate vicinity (under 50 meters) with high visual or description overlap.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Metrics HUD */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
          <span className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Conflicting Municipal Record</span>
          <span className={`px-2 py-0.5 rounded text-3xs font-mono font-bold uppercase tracking-widest border ${statusColors}`}>
            {statusLabel}
          </span>
        </div>

        {/* Existing Title / Summary */}
        <div className="space-y-1.5">
          <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Existing Issue Title</p>
          <h4 className="text-sm font-bold text-slate-200 leading-snug">
            {existingIssue.aiAnalysis.summary}
          </h4>
        </div>

        {/* Duplicate Scoring Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Similarity Score */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-center">
            <p className="text-3xs text-slate-500 font-mono uppercase">AI Similarity</p>
            <p className="text-lg font-black font-mono text-emerald-400 mt-1">{similarityScore}%</p>
          </div>

          {/* Distance Away */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-center">
            <p className="text-3xs text-slate-500 font-mono uppercase">Distance</p>
            <p className="text-lg font-black font-mono text-slate-200 mt-1">{distanceMeters}m Away</p>
          </div>

          {/* Existing Consensus */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-center">
            <p className="text-3xs text-slate-500 font-mono uppercase">Consensus</p>
            <p className={`text-lg font-black font-mono mt-1 ${existingIssue.consensusScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {existingIssue.consensusScore >= 0 ? '+' : ''}{existingIssue.consensusScore} PTS
            </p>
          </div>

          {/* Issue ID */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-center">
            <p className="text-3xs text-slate-500 font-mono uppercase">Issue ID</p>
            <p className="text-xs font-bold font-mono text-slate-400 truncate mt-2">#{existingIssue.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Original Description snippet */}
        <div className="bg-slate-900/40 p-3.5 rounded-lg border border-slate-900/80 text-xs">
          <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Original Citizen Description</p>
          <p className="text-slate-300 italic leading-relaxed font-sans">&ldquo;{existingIssue.description}&rdquo;</p>
          <div className="flex items-center space-x-1.5 mt-2.5 text-3xs font-mono text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Filed by {existingIssue.reporter.username} ({existingIssue.supporterCount || 0} supporters)</span>
          </div>
        </div>
      </div>

      {/* Instructional details */}
      <p className="text-xs text-slate-400 leading-relaxed px-1">
        To prevent community clutter, we encourage citizens to <strong className="text-emerald-400">Support the Existing Issue</strong>. This increases its consensus queue ranking and alerts dispatchers faster than filing a duplicate.
      </p>

      {/* Control Buttons Footer */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={onSupportExisting}
          variant="primary"
          className="flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-emerald-950/20 cursor-pointer"
        >
          <Heart className="w-4.5 h-4.5 animate-pulse text-rose-300 fill-rose-300" />
          <span>Support Existing Issue</span>
        </Button>

        <Button
          onClick={onCreateAnyway}
          variant="outline"
          className="flex-1 py-3 text-xs font-bold border-slate-800 hover:bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center space-x-2"
        >
          <Layers className="w-4 h-4" />
          <span>Create New Issue Anyway</span>
        </Button>
      </div>

      {/* Back to adjustments option */}
      <div className="flex justify-center pt-1">
        <button
          onClick={onBack}
          className="text-3xs font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Analysis Grid</span>
        </button>
      </div>

    </div>
  );
}
