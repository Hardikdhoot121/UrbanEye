import { useApp } from '../../context/AppContext';
import { IssueStatus } from '../../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Layers 
} from 'lucide-react';

export function DashboardPanel() {
  const { issues } = useApp();

  // Compute dynamic stats
  const pendingCount = issues.filter((i) => i.status === IssueStatus.PENDING_VERIFICATION).length;
  const verifiedCount = issues.filter((i) => i.status === IssueStatus.VERIFIED).length;
  const resolvedCount = issues.filter((i) => i.status === IssueStatus.RESOLVED).length;
  const rejectedCount = issues.filter((i) => i.status === IssueStatus.REJECTED).length;

  // Simple calculated metrics
  const totalWaterSaved = resolvedCount * 4500 + verifiedCount * 1200;
  const totalCarbonReduced = resolvedCount * 140 + verifiedCount * 35;

  return (
    <div className="p-6 space-y-6 text-slate-100" id="dashboard-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span>Hyperlocal Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time neighborhood performance, peer audit trails, and environmental impact indicators.
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-3xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Consensus Nodes Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Pending */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all">
          <div className="space-y-1">
            <p className="text-slate-500 text-3xs font-mono uppercase tracking-widest">Pending Verification</p>
            <p className="text-3xl font-extrabold text-amber-400 font-mono">{pendingCount}</p>
            <p className="text-3xs text-slate-400">Awaiting consensus</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Verified */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all">
          <div className="space-y-1">
            <p className="text-slate-500 text-3xs font-mono uppercase tracking-widest">Community Verified</p>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono">{verifiedCount}</p>
            <p className="text-3xs text-slate-400">Validated by peers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Stat 3: Resolved */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all">
          <div className="space-y-1">
            <p className="text-slate-500 text-3xs font-mono uppercase tracking-widest">Resolved</p>
            <p className="text-3xl font-extrabold text-sky-400 font-mono">{resolvedCount}</p>
            <p className="text-3xs text-slate-400">Work completed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center text-sky-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Rejected */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all">
          <div className="space-y-1">
            <p className="text-slate-500 text-3xs font-mono uppercase tracking-widest">Rejected</p>
            <p className="text-3xl font-extrabold text-red-400 font-mono">{rejectedCount}</p>
            <p className="text-3xs text-slate-400">Flagged as anomaly/spam</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center text-red-400">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Environmental Impact section */}
      <div className="bg-slate-900/95 border border-slate-800/90 p-6 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase font-mono">Estimated Environmental Impact Savings</h3>
          <p className="text-slate-400 text-xs mt-1">Estimated conservation footprint achieved through verified community reports.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-900/85 p-5 rounded-xl flex items-start space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
              💧
            </div>
            <div>
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Gallons of Water Saved</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                {totalWaterSaved.toLocaleString()} <span className="text-xs font-semibold uppercase text-slate-500">gal</span>
              </p>
              <p className="text-3xs text-slate-400 mt-1">Based on leakage containment audits</p>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-900/85 p-5 rounded-xl flex items-start space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
              🌳
            </div>
            <div>
              <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Carbon Reduction</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                {totalCarbonReduced.toLocaleString()} <span className="text-xs font-semibold uppercase text-slate-500">kg CO₂</span>
              </p>
              <p className="text-3xs text-slate-400 mt-1">Offset calculated through optimized logistics dispatch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
