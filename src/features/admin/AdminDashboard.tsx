import React from 'react';
import { DashboardStats } from './components/DashboardStats';
import { ReviewQueue } from './components/ReviewQueue';
import { Shield } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 w-full min-h-screen bg-slate-900">
      <div className="mb-8 flex items-center gap-3 border-b border-slate-800 pb-6">
        <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/30">
          <Shield className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Moderation</h1>
          <p className="text-slate-400 mt-1">Review community verified reports and manage civic actions.</p>
        </div>
      </div>

      <DashboardStats />
      <ReviewQueue />
    </div>
  );
};
