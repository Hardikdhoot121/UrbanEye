export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum IssueSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum IssueStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  COMMUNITY_VERIFIED = "COMMUNITY_VERIFIED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED"
}

export enum IssueCategory {
  INFRASTRUCTURE = "INFRASTRUCTURE",
  UTILITIES = "UTILITIES",
  WASTE_MANAGEMENT = "WASTE_MANAGEMENT",
  PUBLIC_SAFETY = "PUBLIC_SAFETY",
  TRANSPORTATION = "TRANSPORTATION",
  ENVIRONMENT = "ENVIRONMENT",
  STREETLIGHTS = "STREETLIGHTS",
  WATER_SUPPLY = "WATER_SUPPLY",
  SEWAGE_DRAINAGE = "SEWAGE_DRAINAGE",
  OTHER = "OTHER"
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface VerificationVote {
  userId: string;
  username: string;
  karmaPoints: number;
  voteWeight: number;
  isApproved: boolean; // true for verify, false for fake
  timestamp: string;
}

export interface TimelineEvent {
  status: IssueStatus;
  timestamp: string;
  actor: 'CITIZEN' | 'COMMUNITY' | 'ADMIN' | 'SYSTEM';
  note?: string;
}

export interface Issue {
  id: string;
  description: string;
  category: IssueCategory;
  severity: Severity;
  status: IssueStatus;
  coordinates: Coordinates;
  imageUrl?: string;
  imagePath?: string;
  trustScore: number;
  aiAnalysis: {
    category: string;
    severity: string;
    summary: string;
    confidence: number;
    isValidIssue: boolean;
    reason: string;
    suggestedAction: string;
  };
  reporter: {
    id: string;
    username: string;
    karmaPoints: number;
    avatarUrl?: string;
    level: number;
  };
  votes: VerificationVote[];
  consensusScore: number;
  requiredConsensus: number;
  supporterCount?: number;
  isPotentialDuplicate?: boolean;
  timeline: TimelineEvent[];
  mergedIntoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueReport extends Issue {
  title: string;
  reporterId: string;
  upvotesCount: number;
  downvotesCount: number;
}

