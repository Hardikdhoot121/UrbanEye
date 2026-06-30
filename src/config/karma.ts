export interface LevelConfig {
  level: number;
  title: string;
  minKarma: number;
  voteWeight: number;
  color: string;
}

export const COMMUNITY_LEVELS: LevelConfig[] = [
  { level: 1, title: 'Citizen', minKarma: 0, voteWeight: 1, color: 'text-slate-400' },
  { level: 2, title: 'Volunteer', minKarma: 100, voteWeight: 2, color: 'text-blue-400' },
  { level: 3, title: 'Community Hero', minKarma: 200, voteWeight: 3, color: 'text-emerald-400' },
  { level: 4, title: 'Guardian', minKarma: 350, voteWeight: 5, color: 'text-teal-400' }, // Emerald variant
  { level: 5, title: 'Civic Champion', minKarma: 750, voteWeight: 8, color: 'text-purple-400' },
  { level: 6, title: 'City Ambassador', minKarma: 1200, voteWeight: 10, color: 'text-orange-400' },
  { level: 7, title: 'Legend of the City', minKarma: 2000, voteWeight: 12, color: 'text-amber-400' }, // Gold variant
];

export const MAX_LEVEL_KARMA = 2000;

export const KARMA_RULES = {
  ISSUE_SUBMITTED: 5,
  ISSUE_COMMUNITY_VERIFIED: 15,
  ISSUE_REJECTED_BY_COMMUNITY: -20,
  ISSUE_APPROVED_BY_ADMIN: 20,
  ISSUE_RESOLVED: 30,
  VOTE_ON_OTHER_ISSUE: 2,
  DAILY_LOGIN: 1,
  LOGIN_STREAK_7_DAYS: 10,
  LOGIN_STREAK_30_DAYS: 50,
} as const;

export type KarmaEvent = keyof typeof KARMA_RULES;
