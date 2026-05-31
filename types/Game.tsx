import { SharedValue } from 'react-native-reanimated';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultySettings {
  pairs: number;
  timeLimit: number;
  label: string;
  color: string;
}

export interface Card {
  id: string;
  type: string;
  image: string;
  flipAnim: SharedValue<boolean>;
  isMatched: boolean;
}

export interface BestScore {
  score: number;
  moves: number;
  time: number;
}
