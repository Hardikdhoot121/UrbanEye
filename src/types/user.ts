export interface UserBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  unlockedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  karmaPoints: number;
  level: number;
  badges: UserBadge[];
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  karmaPoints: number;
  level: number;
  rank: number;
}
