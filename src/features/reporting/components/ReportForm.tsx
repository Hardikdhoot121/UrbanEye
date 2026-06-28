import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ReportFormProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  canAnalyze: boolean;
}

export function ReportForm({
  description,
  onDescriptionChange,
  onSubmit,
  isLoading,
  canAnalyze,
}: ReportFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" id="report-form-component">
      <div className="space-y-2">
        <label htmlFor="issue-description" className="text-sm font-medium text-slate-300 block">
          Describe the Civic Issue
        </label>
        <textarea
          id="issue-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Please describe what the issue is, where it is located, and any context that could help neighborhood authorities resolve it."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
          rows={4}
          disabled={isLoading}
          required
        />
      </div>

      <div className="flex items-start space-x-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <p className="text-xs text-slate-400 leading-normal">
          <strong className="text-amber-500 font-semibold">Protip:</strong> Combining a high-quality photo with a descriptive summary allows the AI engine to classify, prioritize, and route the issue with higher precision.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full py-3 font-semibold text-base flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        disabled={isLoading || !canAnalyze}
      >
        <Sparkles className="w-5 h-5 text-emerald-300 group-hover:animate-pulse" />
        <span>Analyze with Gemini Agent</span>
      </Button>
    </form>
  );
}
