import AsyncStorage from '@react-native-async-storage/async-storage';

import { DIFFICULTY_LEVELS, STORAGE_KEY_PREFIX } from '@/constants/Game';
import type { BestScore, Difficulty } from '@/types/Game';

const DEFAULT_BEST_SCORE: BestScore = {
  score: 0,
  moves: Infinity,
  time: Infinity,
};

/**
 * Loads persisted best scores for all difficulty levels.
 * Returns default values for levels without saved data.
 */
export async function loadAllBestScores(): Promise<
  Record<Difficulty, BestScore>
> {
  const scores = {} as Record<Difficulty, BestScore>;

  const levels = Object.keys(DIFFICULTY_LEVELS) as Difficulty[];

  await Promise.all(
    levels.map(async (level) => {
      try {
        const stored = await AsyncStorage.getItem(
          `${STORAGE_KEY_PREFIX}${level}`
        );
        scores[level] = stored ? JSON.parse(stored) : { ...DEFAULT_BEST_SCORE };
      } catch {
        scores[level] = { ...DEFAULT_BEST_SCORE };
      }
    })
  );

  return scores;
}

/**
 * Persists a new best score for a specific difficulty level.
 */
export async function saveBestScore(
  level: Difficulty,
  score: BestScore
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEY_PREFIX}${level}`,
      JSON.stringify(score)
    );
  } catch (error) {
    console.warn(`[Storage] Failed to save best score for ${level}:`, error);
  }
}
