import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Check, X, GitMerge } from 'lucide-react';
import { IssueStatus } from '../../../types';

interface AdminActionsProps {
  issueId: string;
}

export const AdminActions: React.FC<AdminActionsProps> = ({ issueId }) => {
  const { adminAction, mergeIssue, issues } = useApp();
  const [showMergePrompt, setShowMergePrompt] = useState(false);
  const [targetId, setTargetId] = useState('');

  const handleApprove = () => adminAction(issueId, 'APPROVE');
  const handleReject = () => adminAction(issueId, 'REJECT');

  const handleMerge = () => {
    if (!targetId.trim()) return;
    mergeIssue(issueId, targetId.trim());
    setShowMergePrompt(false);
  };

  const otherIssues = issues.filter(
    i => i.id !== issueId && i.status !== IssueStatus.CLOSED && i.status !== IssueStatus.REJECTED
  );

  return (
    <div className="flex flex-col gap-3 mt-6 border-t border-slate-700 pt-4">
      <h4 className="text-sm font-medium text-slate-300">Admin Actions</h4>
      
      {showMergePrompt ? (
        <div className="flex gap-2 items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="flex-1 bg-slate-800 text-white text-sm rounded px-3 py-2 border border-slate-600 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select target issue...</option>
            {otherIssues.map(i => (
              <option key={i.id} value={i.id}>
                {i.id} - {i.category}
              </option>
            ))}
          </select>
          <button
            onClick={handleMerge}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowMergePrompt(false)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          
          <button
            onClick={handleReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            <X className="w-4 h-4" /> Reject
          </button>
          
          <button
            onClick={() => setShowMergePrompt(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
          >
            <GitMerge className="w-4 h-4" /> Merge Duplicate
          </button>
        </div>
      )}
    </div>
  );
};
