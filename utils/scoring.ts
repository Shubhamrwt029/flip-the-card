import { BASE_MATCH_POINTS, COMBO_BONUS } from '@/constants/Game';

/**
 * Calculates points earned for a match including combo bonus.
 *
 * @param comboStreak - Number of consecutive matches (1-based)
 * @returns Total points for this match
 */
export function calculateMatchPoints(comboStreak: number): number {
  const comboBonus = (comboStreak - 1) * COMBO_BONUS;
  return BASE_MATCH_POINTS + comboBonus;
}

/**
 * Calculates star rating based on move efficiency.
 *
 * - 3 stars: Near-perfect play (within 2 moves of minimum)
 * - 2 stars: Good play (within 2x minimum moves)
 * - 1 star: Completed the game
 *
 * @param moves - Total moves taken
 * @param pairs - Number of pairs in the game
 */
export function getStarRating(moves: number, pairs: number): number {
  const minimumMoves = pairs; // Best case: find each pair on first try

  if (moves <= minimumMoves + 2) return 3;
  if (moves <= minimumMoves * 2) return 2;
  return 1;
}
