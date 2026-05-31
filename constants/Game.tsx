import type { Difficulty, DifficultyConfig } from '@/types/Game';

/** Game difficulty configurations */
export const DIFFICULTY_LEVELS: Record<Difficulty, DifficultyConfig> = {
  easy: { pairs: 2, timeLimit: 60, label: 'Easy', color: '#2ecc71' },
  medium: { pairs: 4, timeLimit: 45, label: 'Medium', color: '#f39c12' },
  hard: { pairs: 6, timeLimit: 30, label: 'Hard', color: '#e74c3c' },
};

/** Points awarded per match */
export const BASE_MATCH_POINTS = 100;

/** Bonus points per consecutive combo match */
export const COMBO_BONUS = 50;

/** Points deducted on mismatch */
export const MISMATCH_PENALTY = 10;

/** AsyncStorage key prefix for persisted scores */
export const STORAGE_KEY_PREFIX = 'flip_cards_best_';

/** Maximum number of Pokémon IDs available (Gen 1-8) */
export const MAX_POKEMON_ID = 898;

/** Duration for card flip animation in ms */
export const FLIP_DURATION = 400;

/** Delay before flipping mismatched cards back in ms */
export const MISMATCH_DELAY = 600;

/** Number of columns in the card grid */
export const GRID_COLUMNS = 3;
