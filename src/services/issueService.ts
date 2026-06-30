import { supabase } from '../lib/supabase';
import { Issue, IssueStatus, IssueCategory, Severity } from '../types';

export const issueService = {
  // Fetch all issues
  async getIssues(): Promise<Issue[]> {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        reporter:profiles!reporter_id(id, username, karma_points, level, avatar_url),
        votes(*, voter:profiles(username, karma_points)),
        timeline:issue_timeline(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      description: row.description,
      category: row.category as IssueCategory,
      severity: row.severity as Severity,
      status: row.status as IssueStatus,
      coordinates: { latitude: row.latitude, longitude: row.longitude },
      imageUrl: row.image_url,
      imagePath: row.image_path,
      trustScore: row.trust_score,
      aiAnalysis: {
        category: row.ai_category,
        severity: row.ai_severity,
        summary: row.ai_summary,
        confidence: row.ai_confidence,
        isValidIssue: row.ai_is_valid,
        reason: row.ai_reason,
        suggestedAction: row.ai_suggested_action,
      },
      reporter: {
        id: row.reporter.id,
        username: row.reporter.username,
        karmaPoints: row.reporter.karma_points,
        level: row.reporter.level,
        avatarUrl: row.reporter.avatar_url,
      },
      votes: (row.votes || []).map((v: any) => ({
        userId: v.voter_id,
        username: v.voter.username,
        karmaPoints: v.voter.karma_points,
        voteWeight: v.vote_weight,
        isApproved: v.is_approved,
        timestamp: v.created_at,
      })),
      consensusScore: row.consensus_score,
      requiredConsensus: row.required_consensus,
      supporterCount: row.supporter_count,
      isPotentialDuplicate: row.is_potential_duplicate,
      mergedIntoId: row.merged_into_id,
      timeline: (row.timeline || []).map((t: any) => ({
        status: t.status as IssueStatus,
        timestamp: t.created_at,
        actor: t.actor,
        note: t.note,
      })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Create new issue
  async createIssue(issue: Issue): Promise<Issue> {
    const { data: issueData, error: issueError } = await supabase
      .from('issues')
      .insert({
        reporter_id: issue.reporter.id,
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
        status: issue.status,
        latitude: issue.coordinates.latitude,
        longitude: issue.coordinates.longitude,
        image_url: issue.imageUrl,
        image_path: issue.imagePath,
        trust_score: issue.trustScore,
        consensus_score: issue.consensusScore,
        required_consensus: issue.requiredConsensus,
        supporter_count: issue.supporterCount,
        is_potential_duplicate: issue.isPotentialDuplicate,
        ai_category: issue.aiAnalysis.category,
        ai_severity: issue.aiAnalysis.severity,
        ai_summary: issue.aiAnalysis.summary,
        ai_confidence: issue.aiAnalysis.confidence,
        ai_is_valid: issue.aiAnalysis.isValidIssue,
        ai_reason: issue.aiAnalysis.reason,
        ai_suggested_action: issue.aiAnalysis.suggestedAction,
      })
      .select()
      .single();

    if (issueError) throw issueError;

    // Insert initial timeline
    if (issue.timeline && issue.timeline.length > 0) {
      const { error: timelineError } = await supabase
        .from('issue_timeline')
        .insert({
          issue_id: issueData.id,
          status: issue.timeline[0].status,
          actor: issue.timeline[0].actor,
        });
        
      if (timelineError) throw timelineError;
    }
    
    // Return the newly created issue ID inside our model (to immediately map it back in UI)
    return { ...issue, id: issueData.id };
  },

  // Update existing issue
  async updateIssue(issue: Issue): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .update({
        status: issue.status,
        trust_score: issue.trustScore,
        consensus_score: issue.consensusScore,
        supporter_count: issue.supporterCount,
        merged_into_id: issue.mergedIntoId,
      })
      .eq('id', issue.id);

    if (error) throw error;
  },

  // Delete an issue entirely (e.g. fraud)
  async deleteIssue(issueId: string): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', issueId);

    if (error) throw error;
  },

  // Cast a vote
  async castVote(
    issueId: string, 
    voterId: string, 
    isApproved: boolean, 
    voteWeight: number
  ): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .insert({
        issue_id: issueId,
        voter_id: voterId,
        is_approved: isApproved,
        vote_weight: voteWeight
      });

    if (error) throw error;
  },
  
  // Insert timeline event
  async insertTimelineEvent(
    issueId: string,
    status: IssueStatus,
    actor: string,
    actorId?: string,
    note?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('issue_timeline')
      .insert({
        issue_id: issueId,
        status,
        actor,
        actor_id: actorId,
        note
      });
      
    if (error) throw error;
  },
  
  // Log Admin Action
  async logAdminAction(
    issueId: string,
    adminId: string,
    action: 'APPROVE' | 'REJECT' | 'MERGE',
    note?: string,
    targetIssueId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        issue_id: issueId,
        admin_id: adminId,
        action,
        note,
        target_issue_id: targetIssueId
      });
      
    if (error) throw error;
  }
};
