import React from 'react';
import { Issue } from '../../../types';
import { AdminActions } from './AdminActions';
import { IssueTimeline } from '../../../components/ui/IssueTimeline';
import { MapPin, Brain, ShieldAlert, Navigation } from 'lucide-react';

interface ReviewCardProps {
  issue: Issue;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ issue }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6 flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="md:w-1/3 bg-slate-900 min-h-[250px] relative">
        {issue.imageUrl ? (
          <img src={issue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <span className="text-sm">No image provided</span>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-6 md:w-2/3 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Issue #{issue.id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> 
              {issue.coordinates.latitude.toFixed(4)}, {issue.coordinates.longitude.toFixed(4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-300">Reporter: {issue.reporter.username}</div>
            <div className="text-xs text-slate-500">{new Date(issue.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <p className="text-slate-300 mb-6 flex-grow">{issue.description}</p>

        {/* AI & Consensus Tags */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="flex items-center gap-1 text-indigo-400 mb-1">
              <Brain className="w-4 h-4" /> <span className="text-xs font-semibold">AI CATEGORY</span>
            </div>
            <div className="text-sm font-medium text-white">{issue.aiAnalysis?.category || issue.category}</div>
          </div>
          
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="flex items-center gap-1 text-orange-400 mb-1">
              <ShieldAlert className="w-4 h-4" /> <span className="text-xs font-semibold">AI SEVERITY</span>
            </div>
            <div className="text-sm font-medium text-white">{issue.aiAnalysis?.severity || issue.severity}</div>
          </div>

          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="flex items-center gap-1 text-emerald-400 mb-1">
              <Navigation className="w-4 h-4" /> <span className="text-xs font-semibold">CONSENSUS</span>
            </div>
            <div className="text-sm font-medium text-white">Score: {issue.consensusScore}</div>
          </div>
          
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="flex items-center gap-1 text-blue-400 mb-1">
              <Brain className="w-4 h-4" /> <span className="text-xs font-semibold">CONFIDENCE</span>
            </div>
            <div className="text-sm font-medium text-white">{issue.aiAnalysis?.confidence || 0}%</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-4">
           <IssueTimeline timeline={issue.timeline || []} />
        </div>

        {/* Admin Actions */}
        <AdminActions issueId={issue.id} />
      </div>
    </div>
  );
};
