import { CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, BarChart2, Tag, Info, AlertOctagon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface AIAnalysis {
  category: string;
  severity: string;
  summary: string;
  confidence: number;
  isValidIssue: boolean;
  reason: string;
  suggestedAction: string;
}

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  onReset: () => void;
  onSubmitReport: () => void;
}

export function AIAnalysisCard({ analysis, onReset, onSubmitReport }: AIAnalysisCardProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-950/50';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-950/50';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-950/50';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80" id="ai-analysis-card-component">
      {/* Header with active AI state */}
      <div className="p-5 bg-gradient-to-r from-emerald-950/10 to-slate-900 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Gemini Dispatch Diagnosis</h4>
            <p className="text-2xs font-mono text-emerald-400/80 uppercase">Autonomous indexing output</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-1 rounded-full text-2xs text-emerald-400 font-semibold font-mono">
          <span>●</span>
          <span>READY</span>
        </div>
      </div>

      {/* Validity Banner */}
      {!analysis.isValidIssue && (
        <div className="p-4 bg-red-950/20 border-b border-red-900/50 text-red-400 flex items-start space-x-3 text-xs">
          <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-bold">Spam / Non-Civic Issue Flagged</p>
            <p className="mt-0.5 text-slate-300">Gemini suggests this report may not represent a valid local infrastructure, utility, or public anomaly.</p>
          </div>
        </div>
      )}

      {/* Main Analysis Body */}
      <div className="p-5 space-y-4">
        {/* Core dynamic summary */}
        <div className="space-y-1.5">
          <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest">AI Generated Summary</p>
          <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-950 p-3 rounded-lg border border-slate-800">
            {analysis.summary}
          </p>
        </div>

        {/* Categories, Severity and Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <div className="p-2 bg-slate-900 text-slate-400 rounded-md shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Category</p>
              <p className="text-sm font-bold text-slate-100">{analysis.category}</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border flex items-center space-x-3 ${getSeverityStyles(analysis.severity)}`}>
            <div className="p-2 bg-slate-900/40 rounded-md shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Severity Level</p>
              <p className="text-sm font-bold">{analysis.severity}</p>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <div className="p-2 bg-slate-900 text-slate-400 rounded-md shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Confidence Score</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-sm font-bold text-slate-100">{analysis.confidence}%</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.confidence}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 flex items-center space-x-3">
            <div className="p-2 bg-slate-900 text-slate-400 rounded-md shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Diagnostic Validity</p>
              <p className="text-sm font-bold text-slate-100">{analysis.isValidIssue ? 'Verified Civic Issue' : 'Unconfirmed/Spam'}</p>
            </div>
          </div>
        </div>

        {/* Diagnosis & Analysis Reason */}
        <div className="space-y-1.5">
          <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest">Diagnostic Reasoning</p>
          <p className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
            {analysis.reason}
          </p>
        </div>

        {/* Suggestion & recommended municipal flow */}
        <div className="space-y-1.5">
          <p className="text-2xs font-mono text-slate-500 uppercase tracking-widest">Suggested Routing Protocol</p>
          <p className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800 leading-relaxed font-mono">
            {analysis.suggestedAction}
          </p>
        </div>
      </div>

      {/* Control Actions footer */}
      <div className="p-5 bg-slate-950 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 flex items-center justify-center space-x-1.5 border-slate-800 hover:bg-slate-900"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refile Report</span>
        </Button>
        <Button
          onClick={onSubmitReport}
          variant="primary"
          className="flex-1 flex items-center justify-center space-x-1.5"
          disabled={!analysis.isValidIssue}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Confirm & Publish</span>
        </Button>
      </div>
    </div>
  );
}
