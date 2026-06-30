import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue, UserProfile, IssueStatus, IssueCategory, Severity } from '../types';
import { applyKarmaEvent } from '../services/karmaEngine';

interface AppContextType {
  issues: Issue[];
  userProfile: UserProfile | null;
  loading: boolean;
  addIssue: (issue: Issue) => void;
  updateIssue: (issue: Issue) => void;
  castVote: (
    issueId: string,
    voter: { id: string; username: string; karmaPoints: number; voteWeight: number }
  ) => void;
  adminAction: (issueId: string, action: 'APPROVE' | 'REJECT', note?: string) => void;
  mergeIssue: (sourceId: string, targetId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// High-fidelity initial seed issues in San Francisco
const initialSeedIssues: Issue[] = [
  {
    id: "seed-1",
    description: "Major water leak from a broken fire hydrant on Pine St. Water is pooling heavily and causing minor flooding on the sidewalk.",
    category: IssueCategory.WATER_SUPPLY,
    severity: Severity.HIGH,
    status: IssueStatus.PENDING_VERIFICATION,
    coordinates: { latitude: 37.7901, longitude: -122.4112 },
    trustScore: 85,
    aiAnalysis: {
      category: "WATER_SUPPLY",
      severity: "HIGH",
      summary: "Broken water hydrant leaking significant volume on Pine St.",
      confidence: 85,
      isValidIssue: true,
      reason: "Visual water volume and location match public infrastructure failure.",
      suggestedAction: "Dispatch emergency water utility crew to isolate water valve."
    },
    reporter: {
      id: "user-alice",
      username: "Alice Smith",
      karmaPoints: 1240,
      level: 12
    },
    votes: [
      {
        userId: "user-bob",
        username: "Bob Johnson",
        karmaPoints: 950,
        voteWeight: 5,
        isApproved: true,
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        userId: "user-charlie",
        username: "Charlie Brown",
        karmaPoints: 810,
        voteWeight: 5,
        isApproved: true,
        timestamp: new Date(Date.now() - 3600000 * 1.1).toISOString()
      }
    ],
    consensusScore: 10,
    requiredConsensus: 15,
    timeline: [
      {
        status: IssueStatus.PENDING_VERIFICATION,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actor: 'CITIZEN'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 1.1).toISOString()
  },
  {
    id: "seed-2",
    description: "Large deep pothole in the middle of the rightmost lane on Guerrero St. Extremely dangerous for motorcyclists and cyclists.",
    category: IssueCategory.TRANSPORTATION,
    severity: Severity.CRITICAL,
    status: IssueStatus.COMMUNITY_VERIFIED,
    coordinates: { latitude: 37.7592, longitude: -122.4258 },
    trustScore: 94,
    aiAnalysis: {
      category: "TRANSPORTATION",
      severity: "CRITICAL",
      summary: "Severe deep pothole in primary vehicle lane on Guerrero St.",
      confidence: 94,
      isValidIssue: true,
      reason: "Visual structural damage creates an immediate high-risk road hazard.",
      suggestedAction: "Prioritize quick-set asphalt repair crew dispatch."
    },
    reporter: {
      id: "user-bob",
      username: "Bob Johnson",
      karmaPoints: 950,
      level: 9
    },
    votes: [],
    consensusScore: 70,
    requiredConsensus: 15,
    timeline: [
      {
        status: IssueStatus.PENDING_VERIFICATION,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        actor: 'CITIZEN'
      },
      {
        status: IssueStatus.COMMUNITY_VERIFIED,
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        actor: 'COMMUNITY'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "seed-3",
    description: "Streetlight completely blacked out near the bus stop. Makes the area feel unsafe at night.",
    category: IssueCategory.STREETLIGHTS,
    severity: Severity.MEDIUM,
    status: IssueStatus.RESOLVED,
    coordinates: { latitude: 37.7784, longitude: -122.4119 },
    trustScore: 90,
    aiAnalysis: {
      category: "STREETLIGHTS",
      severity: "MEDIUM",
      summary: "Inoperative street illumination luminaire near public transit shelter.",
      confidence: 90,
      isValidIssue: true,
      reason: "Physical darkness and reported location match public asset database.",
      suggestedAction: "Schedule bulb replacement order with municipal lighting team."
    },
    reporter: {
      id: "user-charlie",
      username: "Charlie Brown",
      karmaPoints: 810,
      level: 8
    },
    votes: [],
    consensusScore: 75,
    requiredConsensus: 15,
    timeline: [
      {
        status: IssueStatus.PENDING_VERIFICATION,
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        actor: 'CITIZEN'
      },
      {
        status: IssueStatus.COMMUNITY_VERIFIED,
        timestamp: new Date(Date.now() - 3600000 * 70).toISOString(),
        actor: 'COMMUNITY'
      },
      {
        status: IssueStatus.APPROVED,
        timestamp: new Date(Date.now() - 3600000 * 68).toISOString(),
        actor: 'ADMIN'
      },
      {
        status: IssueStatus.RESOLVED,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        actor: 'SYSTEM',
        note: 'Municipal work crew confirmed repair.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const mockCurrentUser: UserProfile = {
  id: "user-hardik",
  email: "hardikdhoot121@gmail.com",
  username: "Hardik Dhoot",
  karmaPoints: 350,
  level: 8,
  badges: [],
  createdAt: new Date().toISOString()
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [userProfile] = useState<UserProfile | null>(mockCurrentUser);
  const [loading, setLoading] = useState<boolean>(true);

  // Load issues from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('community_issues');
      if (stored) {
        setIssues(JSON.parse(stored));
      } else {
        setIssues(initialSeedIssues);
        localStorage.setItem('community_issues', JSON.stringify(initialSeedIssues));
      }
    } catch (err) {
      console.error("Failed to load issues from localStorage", err);
      setIssues(initialSeedIssues);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever issues change
  const addIssue = (newIssue: Issue) => {
    setIssues((prev) => {
      const updated = [newIssue, ...prev];
      localStorage.setItem('community_issues', JSON.stringify(updated));
      return updated;
    });
    
    // Apply karma reward for submitting an issue
    applyKarmaEvent(newIssue.reporter.id, 'ISSUE_SUBMITTED');
  };

  const updateIssue = (updatedIssue: Issue) => {
    setIssues((prev) => {
      const updated = prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue));
      localStorage.setItem('community_issues', JSON.stringify(updated));
      return updated;
    });
  };

  const castVote = (
    issueId: string,
    isApproved: boolean,
    voter: { id: string; username: string; karmaPoints: number; voteWeight: number }
  ) => {
    setIssues((prev) => {
      const updated = prev.map((issue) => {
        if (issue.id !== issueId) return issue;

        // Prevent duplicate voting by same user
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

        // Recalculate consensusScore
        const totalPositiveWeight = updatedVotes.filter((v) => v.isApproved).reduce((sum, v) => sum + v.voteWeight, 0);
        const totalNegativeWeight = updatedVotes.filter((v) => !v.isApproved).reduce((sum, v) => sum + v.voteWeight, 0);
        const newConsensusScore = totalPositiveWeight - totalNegativeWeight;

        // Recalculate trustScore
        const totalWeightCast = totalPositiveWeight + totalNegativeWeight;
        const newTrustScore = totalWeightCast === 0
          ? issue.aiAnalysis.confidence
          : Math.round((totalPositiveWeight / totalWeightCast) * 100);

        // Determine next status
        let nextStatus = issue.status;
        const requiredThreshold = issue.requiredConsensus || 15;

        if (newConsensusScore >= requiredThreshold) {
          nextStatus = IssueStatus.COMMUNITY_VERIFIED;
          if (issue.status !== IssueStatus.COMMUNITY_VERIFIED) {
            applyKarmaEvent(issue.reporter.id, 'ISSUE_COMMUNITY_VERIFIED');
          }
        } else if (newConsensusScore <= -30) {
          nextStatus = IssueStatus.REJECTED;
          if (issue.status !== IssueStatus.REJECTED) {
            applyKarmaEvent(issue.reporter.id, 'ISSUE_REJECTED_BY_COMMUNITY');
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

        return {
          ...issue,
          votes: updatedVotes,
          consensusScore: newConsensusScore,
          trustScore: newTrustScore,
          status: nextStatus,
          timeline: nextTimeline,
          updatedAt: new Date().toISOString()
        };
      });

      localStorage.setItem('community_issues', JSON.stringify(updated));
      return updated;
    });

    // Apply karma for voting
    applyKarmaEvent(voter.id, 'VOTE_ON_OTHER_ISSUE');
  };

  const adminAction = (issueId: string, action: 'APPROVE' | 'REJECT', note?: string) => {
    setIssues((prev) => {
      const updated = prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        const nextStatus = action === 'APPROVE' ? IssueStatus.APPROVED : IssueStatus.REJECTED;
        return {
          ...issue,
          status: nextStatus,
          timeline: [
            ...(issue.timeline || []),
            {
              status: nextStatus,
              timestamp: new Date().toISOString(),
              actor: 'ADMIN',
              note
            }
          ],
          updatedAt: new Date().toISOString()
        };
      });
      localStorage.setItem('community_issues', JSON.stringify(updated));
      return updated;
    });

    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue) {
      if (action === 'APPROVE') {
        applyKarmaEvent(targetIssue.reporter.id, 'ISSUE_APPROVED_BY_ADMIN');
      } else {
        applyKarmaEvent(targetIssue.reporter.id, 'ISSUE_REJECTED_BY_COMMUNITY');
      }
    }
  };

  const mergeIssue = (sourceId: string, targetId: string) => {
    setIssues((prev) => {
      const targetIssue = prev.find(i => i.id === targetId);
      if (!targetIssue) return prev;
      
      const updated = prev.map((issue) => {
        if (issue.id === sourceId) {
          return {
            ...issue,
            status: IssueStatus.CLOSED,
            mergedIntoId: targetId,
            timeline: [
              ...(issue.timeline || []),
              {
                status: IssueStatus.CLOSED,
                timestamp: new Date().toISOString(),
                actor: 'ADMIN',
                note: `Merged into issue ${targetId}`
              }
            ],
            updatedAt: new Date().toISOString()
          };
        }
        if (issue.id === targetId) {
          const sourceIssue = prev.find(i => i.id === sourceId);
          return {
            ...issue,
            consensusScore: issue.consensusScore + (sourceIssue?.consensusScore || 0),
            supporterCount: (issue.supporterCount || 0) + (sourceIssue?.supporterCount || 0) + 1,
            updatedAt: new Date().toISOString()
          };
        }
        return issue;
      });
      localStorage.setItem('community_issues', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ issues, userProfile, loading, addIssue, updateIssue, castVote, adminAction, mergeIssue }}>
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

