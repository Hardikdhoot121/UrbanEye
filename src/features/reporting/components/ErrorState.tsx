import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({ message = 'An unexpected connection failure occurred during the analysis pipeline.', onRetry }: ErrorStateProps) {
  return (
    <div className="bg-slate-900 border border-red-950 bg-gradient-to-b from-slate-900 to-red-950/20 rounded-xl p-8 text-center space-y-6" id="error-state-component">
      <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h4 className="text-base font-semibold text-slate-200">Analysis Dispatch Failed</h4>
        <p className="text-xs text-red-400/80 mt-1">{message}</p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-900/50 text-red-400 hover:bg-red-950/30 flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset and Try Again</span>
        </Button>
      </div>
    </div>
  );
}
