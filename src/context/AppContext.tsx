import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue, UserProfile, IssueStatus, IssueCategory, Severity } from '../types';
import { applyKarmaEvent } from '../services/karmaEngine';
import { storageService } from '../services/storageService';
import { issueService } from '../services/issueService';
import { useAuth } from './AuthContext';

interface AppContextType {
  issues: Issue[];
  loading: boolean;
  addIssue: (issue: Issue) => void;
  updateIssue: (issue: Issue) => void;
  castVote: (
    issueId: string,
    isApproved: boolean,
    voter: { id: string; username: string; karmaPoints: number; voteWeight: number }
  ) => void;
  adminAction: (issueId: string, action: 'APPROVE' | 'REJECT' | 'RESOLVE', note?: string) => void;
  mergeIssue: (sourceId: string, targetId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { session } = useAuth();

  // Load issues from Supabase DB on mount
  useEffect(() => {
    async function fetchIssues() {
      try {
        setLoading(true);
        const data = await issueService.getIssues();
        setIssues(data);
      } catch (err) {
        console.error("Failed to load issues from Supabase", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  const addIssue = async (newIssue: Issue) => {
    // optimistic
    setIssues((prev) => [newIssue, ...prev]);
    applyKarmaEvent(newIssue.reporter.id, 'ISSUE_SUBMITTED');
    
    try {
      const created = await issueService.createIssue(newIssue);
      setIssues((prev) => prev.map(i => i.id === newIssue.id ? created : i));
    } catch (err) {
      console.error("Failed to save issue to DB:", err);
    }
  };

  const updateIssue = async (updatedIssue: Issue) => {
    setIssues((prev) => prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)));
    try {
      await issueService.updateIssue(updatedIssue);
    } catch (err) {
      console.error("Failed to update issue in DB:", err);
    }
  };

  const castVote = async (
    issueId: string,
    isApproved: boolean,
    voter: { id: string; username: string; karmaPoints: number; voteWeight: number }
  ) => {
    // 1. Send vote to DB
    try {
      await issueService.castVote(issueId, voter.id, isApproved, voter.voteWeight);
    } catch (err) {
      console.error("Failed to cast vote in DB:", err);
      return; // Stop if vote fails (e.g. duplicate)
    }

    applyKarmaEvent(voter.id, 'VOTE_ON_OTHER_ISSUE');

    // 2. Optimistic Update
    setIssues((prev) => {
      let fraudIssueId: string | null = null;
      let targetIssueForDbUpdate: Issue | null = null;
      let newlyRejected = false;
      let newlyVerified = false;

      const updated = prev.map((issue) => {
        if (issue.id !== issueId) return issue;

        const alreadyVoted = issue.votes?.some((v) => v.userId === voter.id);
        if (alreadyVoted) return issue;

        const newVote = {
          userId: voter.id,
          username: voter.username,
          karmaPoints: voter.karmaPoints,
          voteWeight: voter.voteWeight,
          isApproved,
          timestamp: new Date().toISOString()
        };

        const updatedVotes = [...(issue.votes || []), newVote];

        const totalPositiveWeight = updatedVotes.filter((v) => v.isApproved).reduce((sum, v) => sum + v.voteWeight, 0);
        const totalNegativeWeight = updatedVotes.filter((v) => !v.isApproved).reduce((sum, v) => sum + v.voteWeight, 0);
        const newConsensusScore = totalPositiveWeight - totalNegativeWeight;
        const totalWeightCast = totalPositiveWeight + totalNegativeWeight;
        const newTrustScore = totalWeightCast === 0 ? issue.aiAnalysis.confidence : Math.round((totalPositiveWeight / totalWeightCast) * 100);

        let nextStatus = issue.status;
        const requiredThreshold = issue.requiredConsensus || 15;

        if (newConsensusScore >= requiredThreshold) {
          nextStatus = IssueStatus.COMMUNITY_VERIFIED;
          if (issue.status !== IssueStatus.COMMUNITY_VERIFIED) {
            newlyVerified = true;
            applyKarmaEvent(issue.reporter.id, 'ISSUE_COMMUNITY_VERIFIED');
          }
        } else if (newConsensusScore <= -30) {
          nextStatus = IssueStatus.REJECTED;
          if (issue.status !== IssueStatus.REJECTED) {
            newlyRejected = true;
            applyKarmaEvent(issue.reporter.id, 'ISSUE_REJECTED_BY_COMMUNITY');
            fraudIssueId = issue.id;
            if (issue.imagePath) {
              storageService.deleteIssueImage(issue.imagePath).catch(err => console.error("Failed to delete fraud image:", err));
            }
          }
        }

        const nextTimeline = [...(issue.timeline || [])];
        if (nextStatus !== issue.status) {
          nextTimeline.push({
            status: nextStatus,
            timestamp: new Date().toISOString(),
            actor: 'COMMUNITY'
          });
        }

        const updatedIssueObj = {
          ...issue,
          votes: updatedVotes,
          consensusScore: newConsensusScore,
          trustScore: newTrustScore,
          status: nextStatus,
          timeline: nextTimeline,
          updatedAt: new Date().toISOString()
        };
        
        targetIssueForDbUpdate = updatedIssueObj;
        return updatedIssueObj;
      });

      // 3. Trigger DB updates for status change
      if (fraudIssueId) {
        issueService.deleteIssue(fraudIssueId).catch(console.error);
      } else if (targetIssueForDbUpdate) {
        issueService.updateIssue(targetIssueForDbUpdate).catch(console.error);
        if (newlyVerified || newlyRejected) {
           issueService.insertTimelineEvent(issueId, targetIssueForDbUpdate!.status, 'COMMUNITY').catch(console.error);
        }
      }

      return fraudIssueId ? updated.filter(i => i.id !== fraudIssueId) : updated;
    });
  };

  const adminAction = async (issueId: string, action: 'APPROVE' | 'REJECT' | 'RESOLVE', note?: string) => {
    const adminId = session?.user.id || 'admin';
    let targetStatus = IssueStatus.APPROVED;
    if (action === 'REJECT') targetStatus = IssueStatus.REJECTED;
    if (action === 'RESOLVE') targetStatus = IssueStatus.RESOLVED;

    try {
      await issueService.logAdminAction(issueId, adminId, action === 'RESOLVE' ? 'APPROVE' : action, note);
      await issueService.insertTimelineEvent(issueId, targetStatus, 'ADMIN', adminId, note);
    } catch(e) { console.error(e); }

    setIssues((prev) => {
      let fraudIssueId: string | null = null;
      const updated = prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        
        const updatedIssueObj = {
          ...issue,
          status: targetStatus,
          timeline: [
            ...(issue.timeline || []),
            {
              status: targetStatus,
              timestamp: new Date().toISOString(),
              actor: 'ADMIN' as const,
              note
            }
          ],
          updatedAt: new Date().toISOString()
        };
        issueService.updateIssue(updatedIssueObj).catch(console.error);
        
        if (action === 'REJECT') {
          fraudIssueId = issueId;
          if (issue.imagePath) {
             storageService.deleteIssueImage(issue.imagePath).catch(console.error);
          }
        }
        
        return updatedIssueObj;
      });

      if (fraudIssueId) {
         issueService.deleteIssue(fraudIssueId).catch(console.error);
         return updated.filter(i => i.id !== fraudIssueId);
      }
      return updated;
    });
    
    // karma 
    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
       if (action === 'APPROVE' || action === 'RESOLVE') {
         applyKarmaEvent(targetIssue.reporter.id, 'ISSUE_APPROVED_BY_ADMIN');
       } else {
         applyKarmaEvent(targetIssue.reporter.id, 'ISSUE_REJECTED_BY_COMMUNITY');
       }
    }
  };

  const mergeIssue = async (sourceId: string, targetId: string) => {
    const adminId = session?.user.id || 'admin';
    try {
       await issueService.logAdminAction(sourceId, adminId, 'MERGE', `Merged into ${targetId}`, targetId);
       await issueService.insertTimelineEvent(sourceId, IssueStatus.CLOSED, 'ADMIN', adminId, `Merged into issue ${targetId}`);
    } catch(e) { console.error(e); }

    setIssues((prev) => {
      const targetIssue = prev.find(i => i.id === targetId);
      if (!targetIssue) return prev;
      
      const updated = prev.map((issue) => {
        if (issue.id === sourceId) {
          const closedIssue = {
            ...issue,
            status: IssueStatus.CLOSED,
            mergedIntoId: targetId,
            timeline: [
              ...(issue.timeline || []),
              {
                status: IssueStatus.CLOSED,
                timestamp: new Date().toISOString(),
                actor: 'ADMIN' as const,
                note: `Merged into issue ${targetId}`
              }
            ],
            updatedAt: new Date().toISOString()
          };
          issueService.updateIssue(closedIssue).catch(console.error);
          return closedIssue;
        }
        if (issue.id === targetId) {
          const sourceIssue = prev.find(i => i.id === sourceId);
          const boostedIssue = {
            ...issue,
            consensusScore: issue.consensusScore + (sourceIssue?.consensusScore || 0),
            supporterCount: (issue.supporterCount || 0) + (sourceIssue?.supporterCount || 0) + 1,
            updatedAt: new Date().toISOString()
          };
          issueService.updateIssue(boostedIssue).catch(console.error);
          return boostedIssue;
        }
        return issue;
      });
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ issues, loading, addIssue, updateIssue, castVote, adminAction, mergeIssue }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
