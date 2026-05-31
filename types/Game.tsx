import type { SharedValue } from 'react-native-reanimated';

/** Difficulty level identifiers */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Configuration for each difficulty level */
export interface DifficultyConfig {
  pairs: number;
  timeLimit: number;
  label: string;
  color: string;
}

/** Represents a single card in the game */
export interface Card {
  id: string;
  type: string;
  image: string;
  flipAnim: SharedValue<boolean>;
  isMatched: boolean;
}

/** Persisted best score for a difficulty level */
export interface BestScore {
  score: number;
  moves: number;
  time: number;
}

/** Game state snapshot used by the game hook */
export interface GameState {
  difficulty: Difficulty;
  cards: Card[];
  score: number;
  moves: number;
  combo: number;
  timer: number;
  gameStarted: boolean;
  gameOver: boolean;
  lastStars: number;
  bestScores: Record<Difficulty, BestScore>;
}
