import { COMMUNITY_LEVELS, LevelConfig, MAX_LEVEL_KARMA } from '../config/karma';

export interface KarmaProgress {
  currentKarma: number;
  currentLevel: number;
  currentTitle: string;
  nextLevel: number | null;
  karmaRequiredForNext: number | null;
  progressPercentage: number;
  isMaxLevel: boolean;
  color: string;
  voteWeight: number;
}

export interface BadgeConfig {
  id: string;
  name: string;
  icon: string;
  isEarned: boolean;
}

/**
 * Derives the user's current level configuration based on their total karma.
 */
export function getLevelConfig(karma: number): LevelConfig {
  // Ensure we don't go below 0 karma
  const safeKarma = Math.max(0, karma);
  
  // Find the highest level where minKarma is <= user's karma
  let currentConfig = COMMUNITY_LEVELS[0];
  
  for (const config of COMMUNITY_LEVELS) {
    if (safeKarma >= config.minKarma) {
      currentConfig = config;
    } else {
      break; // Since the array is ordered, we can stop once we exceed the karma
    }
  }
  
  return currentConfig;
}

/**
 * Calculates progress towards the next level.
 */
export function getKarmaProgress(karma: number): KarmaProgress {
  const safeKarma = Math.max(0, karma);
  const currentConfig = getLevelConfig(safeKarma);
  
  const isMaxLevel = currentConfig.level === COMMUNITY_LEVELS.length;
  
  let nextConfig = null;
  let karmaRequiredForNext = null;
  let progressPercentage = 100;

  if (!isMaxLevel) {
    nextConfig = COMMUNITY_LEVELS.find(c => c.level === currentConfig.level + 1) || null;
    if (nextConfig) {
      const karmaInCurrentLevel = safeKarma - currentConfig.minKarma;
      const karmaNeededForNextLevel = nextConfig.minKarma - currentConfig.minKarma;
      karmaRequiredForNext = nextConfig.minKarma - safeKarma;
      progressPercentage = Math.min((karmaInCurrentLevel / karmaNeededForNextLevel) * 100, 100);
    }
  }

  return {
    currentKarma: safeKarma,
    currentLevel: currentConfig.level,
    currentTitle: currentConfig.title,
    nextLevel: nextConfig?.level || null,
    karmaRequiredForNext,
    progressPercentage,
    isMaxLevel,
    color: currentConfig.color,
    voteWeight: currentConfig.voteWeight,
  };
}

/**
 * Derives the unlocked badges based on karma and other stats.
 */
export function getUnlockedBadges(karma: number, reportsCreated: number = 0): BadgeConfig[] {
  const currentConfig = getLevelConfig(karma);
  
  const badges: BadgeConfig[] = [
    { id: 'first_report', name: 'First Report', icon: '🚩', isEarned: reportsCreated > 0 },
    { id: 'helpful_citizen', name: 'Helpful Citizen', icon: '🤝', isEarned: karma >= 150 },
  ];

  // Auto-unlock badges for each level reached
  COMMUNITY_LEVELS.forEach(level => {
    // We map emojis based on the level for the badge system
    let icon = '🎖️';
    if (level.level === 2) icon = '🛡️';
    if (level.level === 3) icon = '🦸';
    if (level.level === 4) icon = '⚔️';
    if (level.level === 5) icon = '🏅';
    if (level.level === 6) icon = '🏛️';
    if (level.level === 7) icon = '🏆';

    badges.push({
      id: `level_${level.level}`,
      name: level.title,
      icon,
      isEarned: currentConfig.level >= level.level
    });
  });

  return badges;
}
