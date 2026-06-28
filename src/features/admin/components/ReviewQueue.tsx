import React from 'react';
import { useApp } from '../../../context/AppContext';
import { ReviewCard } from './ReviewCard';
import { IssueStatus } from '../../../types';
import { Inbox } from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const { issues } = useApp();

  const queue = issues.filter((issue) => issue.status === IssueStatus.COMMUNITY_VERIFIED);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
        <Inbox className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Queue is Empty</h3>
        <p className="text-slate-400 text-center max-w-sm">
          There are currently no community verified issues awaiting admin review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Pending Review ({queue.length})</h2>
      </div>
      
      {queue.map((issue) => (
        <ReviewCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
};
