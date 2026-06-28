import React from 'react';
import { useApp } from '../../../context/AppContext';
import { IssueStatus } from '../../../types';
import { Clock, CheckCircle, XCircle, FileWarning, Inbox, Ban } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const { issues } = useApp();

  const stats = {
    pendingReviews: issues.filter((i) => i.status === IssueStatus.COMMUNITY_VERIFIED).length,
    approved: issues.filter((i) => i.status === IssueStatus.APPROVED).length,
    rejected: issues.filter((i) => i.status === IssueStatus.REJECTED).length,
    resolved: issues.filter((i) => i.status === IssueStatus.RESOLVED).length,
    closed: issues.filter((i) => i.status === IssueStatus.CLOSED).length,
    total: issues.length,
  };

  const statCards = [
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: <Inbox className="w-5 h-5 text-amber-500" /> },
    { label: 'Approved Issues', value: stats.approved, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
    { label: 'Rejected Issues', value: stats.rejected, icon: <XCircle className="w-5 h-5 text-red-500" /> },
    { label: 'Resolved Issues', value: stats.resolved, icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { label: 'Closed/Merged', value: stats.closed, icon: <Ban className="w-5 h-5 text-slate-500" /> },
    { label: 'Total Reports', value: stats.total, icon: <FileWarning className="w-5 h-5 text-indigo-500" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, idx) => (
        <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-700 p-2 rounded-full mb-3 shadow-inner">
            {stat.icon}
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
          <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
