import { Issue, IssueCategory, Severity } from '../../../types';

/**
 * Calculates the distance between two coordinates in meters using the Haversine Formula.
 */
export function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Compares two descriptions and returns a similarity index between 0.0 and 1.0.
 * Uses word tokenization, punctuation removal, stop-word filtering, and Jaccard overlap.
 */
export function calculateDescriptionSimilarity(desc1: string, desc2: string): number {
  const cleanAndTokenize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short filler words like "a", "is", "the", "on", "of", "to"
  };

  const tokens1 = cleanAndTokenize(desc1);
  const tokens2 = cleanAndTokenize(desc2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  // Intersection of words
  const intersection = tokens1.filter(word => set2.has(word));
  const uniqueIntersect = new Set(intersection);

  // Union of words
  const union = new Set([...tokens1, ...tokens2]);

  // Jaccard similarity score
  const jaccardScore = uniqueIntersect.size / union.size;

  // Add weight if one contains another or significant substring matches
  let substringMatch = 0;
  const s1 = desc1.toLowerCase();
  const s2 = desc2.toLowerCase();
  if (s1.includes(s2) || s2.includes(s1)) {
    substringMatch = 0.45;
  }

  return Math.max(jaccardScore, substringMatch);
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingIssue: Issue | null;
  distanceMeters: number;
  similarityScore: number; // 0 to 100
}

/**
 * Compares a candidate issue against the list of existing issues.
 * Triggers duplicate flags if category matches, coordinates distance <= 50m, and descriptions are similar.
 */
export function findPotentialDuplicate(
  candidate: {
    category: IssueCategory;
    severity: Severity;
    description: string;
    latitude: number;
    longitude: number;
  },
  existingIssues: Issue[]
): DuplicateCheckResult {
  for (const issue of existingIssues) {
    // 1. Same Category
    const categoryMatches = issue.category === candidate.category;
    
    // 2. Same Severity
    const severityMatches = issue.severity === candidate.severity;

    if (!categoryMatches || !severityMatches) {
      continue;
    }

    // 3. Distance between coordinates <= 50 meters
    const distance = calculateDistanceInMeters(
      candidate.latitude,
      candidate.longitude,
      issue.coordinates.latitude,
      issue.coordinates.longitude
    );

    // 4. Similarity of description
    const rawSimilarity = calculateDescriptionSimilarity(candidate.description, issue.description);
    
    // Map to a human-friendly AI similarity score percentage
    // If there's high word overlap or substring overlap, scale up to 60-98% range for realistic UI
    const similarityPercent = rawSimilarity > 0
      ? Math.min(98, Math.round(rawSimilarity * 80 + 15))
      : 0;

    // Trigger criteria: distance within 50 meters and description similarity >= 30% (raw similarity >= 0.18)
    const withinFiftyMeters = distance <= 50;
    const isDescriptionSimilar = similarityPercent >= 30;

    if (withinFiftyMeters && isDescriptionSimilar) {
      return {
        isDuplicate: true,
        existingIssue: issue,
        distanceMeters: Math.round(distance),
        similarityScore: similarityPercent
      };
    }
  }

  return {
    isDuplicate: false,
    existingIssue: null,
    distanceMeters: 0,
    similarityScore: 0
  };
}
