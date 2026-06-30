/**
 * TypeScript types auto-generated from the Supabase database schema.
 * These match exactly the tables defined in supabase/migrations/001_initial_schema.sql
 *
 * After running `npx supabase gen types typescript`, replace this file with the output.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          karma_points: number;
          level: number;
          role: 'citizen' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          karma_points?: number;
          level?: number;
          role?: 'citizen' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          karma_points?: number;
          level?: number;
          role?: 'citizen' | 'admin';
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          image_url?: string;
        };
      };
      profile_badges: {
        Row: {
          id: string;
          profile_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: {
          unlocked_at?: string;
        };
      };
      issues: {
        Row: {
          id: string;
          reporter_id: string;
          description: string;
          category: string;
          severity: string;
          status: string;
          latitude: number;
          longitude: number;
          image_url: string | null;
          trust_score: number;
          consensus_score: number;
          required_consensus: number;
          supporter_count: number;
          is_potential_duplicate: boolean;
          merged_into_id: string | null;
          ai_category: string | null;
          ai_severity: string | null;
          ai_summary: string | null;
          ai_confidence: number | null;
          ai_is_valid: boolean | null;
          ai_reason: string | null;
          ai_suggested_action: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          description: string;
          category: string;
          severity: string;
          status?: string;
          latitude: number;
          longitude: number;
          image_url?: string | null;
          trust_score?: number;
          consensus_score?: number;
          required_consensus?: number;
          supporter_count?: number;
          is_potential_duplicate?: boolean;
          merged_into_id?: string | null;
          ai_category?: string | null;
          ai_severity?: string | null;
          ai_summary?: string | null;
          ai_confidence?: number | null;
          ai_is_valid?: boolean | null;
          ai_reason?: string | null;
          ai_suggested_action?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          description?: string;
          category?: string;
          severity?: string;
          status?: string;
          image_url?: string | null;
          trust_score?: number;
          consensus_score?: number;
          required_consensus?: number;
          supporter_count?: number;
          is_potential_duplicate?: boolean;
          merged_into_id?: string | null;
          ai_category?: string | null;
          ai_severity?: string | null;
          ai_summary?: string | null;
          ai_confidence?: number | null;
          ai_is_valid?: boolean | null;
          ai_reason?: string | null;
          ai_suggested_action?: string | null;
          updated_at?: string;
        };
      };
      issue_timeline: {
        Row: {
          id: string;
          issue_id: string;
          status: string;
          actor: 'CITIZEN' | 'COMMUNITY' | 'ADMIN' | 'SYSTEM';
          actor_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          status: string;
          actor: 'CITIZEN' | 'COMMUNITY' | 'ADMIN' | 'SYSTEM';
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          note?: string | null;
        };
      };
      votes: {
        Row: {
          id: string;
          issue_id: string;
          voter_id: string;
          vote_weight: number;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          voter_id: string;
          vote_weight?: number;
          is_approved: boolean;
          created_at?: string;
        };
        Update: Record<string, never>; // votes are immutable
      };
      admin_actions: {
        Row: {
          id: string;
          issue_id: string;
          admin_id: string;
          action: 'APPROVE' | 'REJECT' | 'MERGE';
          note: string | null;
          target_issue_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          admin_id: string;
          action: 'APPROVE' | 'REJECT' | 'MERGE';
          note?: string | null;
          target_issue_id?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>; // admin_actions are immutable
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          issue_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          issue_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types for use in service files
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type IssueRow = Database['public']['Tables']['issues']['Row'];
export type IssueTimelineRow = Database['public']['Tables']['issue_timeline']['Row'];
export type VoteRow = Database['public']['Tables']['votes']['Row'];
export type AdminActionRow = Database['public']['Tables']['admin_actions']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type BadgeRow = Database['public']['Tables']['badges']['Row'];
