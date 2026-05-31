import { Difficulty, DifficultySettings } from "@/types/Game";

export const DIFFICULTY_LEVELS: Record<Difficulty, DifficultySettings> = {
  easy: { pairs: 2, timeLimit: 60 },
  medium: { pairs: 4, timeLimit: 45 },
  hard: { pairs: 6, timeLimit: 30 },
};
