import { Issue, UserProfile, LeaderboardEntry } from '../types';

/**
 * Service orchestrating API and database requests.
 * Uses mock / localStorage state today; to be connected with actual backend services tomorrow.
 */
export class MockDatabaseService {
  async getIssues(): Promise<Issue[]> {
    try {
      const stored = localStorage.getItem('community_issues');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return {
      id: userId,
      email: "hardikdhoot121@gmail.com",
      username: "Hardik Dhoot",
      karmaPoints: 350,
      level: 8,
      badges: [],
      createdAt: new Date().toISOString()
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return [
      { userId: 'user-alice', username: 'Alice Smith', level: 12, karmaPoints: 1240, rank: 1 },
      { userId: 'user-bob', username: 'Bob Johnson', level: 9, karmaPoints: 950, rank: 2 },
      { userId: 'user-charlie', username: 'Charlie Brown', level: 8, karmaPoints: 810, rank: 3 },
    ];
  }

  async reportIssue(issue: Omit<Issue, 'id' | 'votes' | 'createdAt' | 'updatedAt'>): Promise<Issue> {
    const newIssue: Issue = {
      ...issue,
      id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      votes: [],
      timeline: [
        {
          status: issue.status || 'PENDING_VERIFICATION',
          timestamp: new Date().toISOString(),
          actor: 'CITIZEN'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const stored = localStorage.getItem('community_issues');
      const current = stored ? JSON.parse(stored) : [];
      localStorage.setItem('community_issues', JSON.stringify([newIssue, ...current]));
    } catch (err) {
      console.error("Failed to persist issue to localStorage", err);
    }

    return newIssue;
  }

  async verifyIssue(issueId: string, userId: string, isApproved: boolean): Promise<Issue> {
    throw new Error('Method not implemented.');
  }
}

export const dbService = new MockDatabaseService();

