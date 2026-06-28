import { Loader2, ShieldCheck, Eye, ListFilter } from 'lucide-react';
import { motion } from 'motion/react';

export function LoadingState() {
  const steps = [
    { icon: <Eye className="w-4 h-4 text-emerald-400" />, label: "Analyzing evidence photograph..." },
    { icon: <ListFilter className="w-4 h-4 text-emerald-400" />, label: "Categorizing reported anomaly..." },
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, label: "Determining critical priority index..." },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-6 animate-pulse" id="loading-state-component">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin flex items-center justify-center"></div>
        <Loader2 className="w-6 h-6 text-emerald-400 absolute animate-pulse" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-semibold text-slate-200">Consulting Gemini Autonomous Dispatcher</h4>
        <p className="text-xs text-slate-500">Parsing data structures to construct immediate routing metadata.</p>
      </div>

      <div className="w-full max-w-sm bg-slate-950 rounded-xl border border-slate-800/80 p-4 text-left divide-y divide-slate-900">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center space-x-3 py-2.5 first:pt-0 last:pb-0">
            {step.icon}
            <span className="text-xs text-slate-400 font-medium">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
