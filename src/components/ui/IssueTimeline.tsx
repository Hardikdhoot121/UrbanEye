import React from 'react';
import { TimelineEvent, IssueStatus } from '../../types';
import { CheckCircle2, Clock, ShieldCheck, XCircle, Wrench, Ban } from 'lucide-react';

interface IssueTimelineProps {
  timeline: TimelineEvent[];
}

export const IssueTimeline: React.FC<IssueTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  const getStatusConfig = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.PENDING_VERIFICATION:
        return { icon: <Clock className="w-4 h-4" />, color: 'bg-slate-500', text: 'Reported by Citizen' };
      case IssueStatus.COMMUNITY_VERIFIED:
        return { icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-amber-500', text: 'Verified by Community' };
      case IssueStatus.APPROVED:
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-500', text: 'Approved by Admin' };
      case IssueStatus.REJECTED:
        return { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500', text: 'Rejected by Admin' };
      case IssueStatus.RESOLVED:
        return { icon: <Wrench className="w-4 h-4" />, color: 'bg-blue-500', text: 'Resolved' };
      case IssueStatus.CLOSED:
        return { icon: <Ban className="w-4 h-4" />, color: 'bg-slate-700', text: 'Closed / Merged' };
      default:
        return { icon: <Clock className="w-4 h-4" />, color: 'bg-slate-500', text: status };
    }
  };

  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Issue Timeline</h3>
      <div className="space-y-4">
        {sortedTimeline.map((event, index) => {
          const config = getStatusConfig(event.status);
          const isLast = index === sortedTimeline.length - 1;

          return (
            <div key={index} className="relative flex gap-4">
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-700" />
              )}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${config.color} text-white shadow ring-2 ring-slate-800`}
              >
                {config.icon}
              </div>
              <div className="flex flex-col pt-1.5">
                <span className="text-sm font-medium text-slate-200">
                  {config.text}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
                {event.note && (
                  <span className="text-xs text-slate-300 mt-1 italic bg-slate-700/50 p-1.5 rounded">
                    {event.note}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
