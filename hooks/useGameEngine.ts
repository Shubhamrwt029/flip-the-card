import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import {
    DIFFICULTY_LEVELS,
    MISMATCH_DELAY,
    MISMATCH_PENALTY,
} from '@/constants/Game';
import type { BestScore, Card, Difficulty } from '@/types/Game';
import { generateDeck, preloadCardImages } from '@/utils/cardGenerator';
import { formatTime } from '@/utils/formatTime';
import { calculateMatchPoints, getStarRating } from '@/utils/scoring';
import { loadAllBestScores, saveBestScore } from '@/utils/storage';

// ─── Public Interface ────────────────────────────────────────────────────────

/** Return type for the useGameEngine hook */
export interface GameEngine {
  // State
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

  // Actions
  startGame: () => void;
  resetGame: (newDifficulty?: Difficulty) => void;
  selectDifficulty: (level: Difficulty) => void;
  handleCardPress: (card: Card) => void;
}

// ─── Hook Implementation ─────────────────────────────────────────────────────

/**
 * Custom hook that encapsulates all game logic:
 * - Card generation and shuffling
 * - Flip matching with combo tracking
 * - Timer management with time-limit enforcement
 * - Score persistence via AsyncStorage
 * - Haptic feedback on interactions
 */
export function useGameEngine(): GameEngine {
  const maxCards = DIFFICULTY_LEVELS.hard.pairs * 2;

  // Pre-allocate shared values for card flip animations.
  // These persist across games to avoid recreating animated values.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const flipAnims = useRef<SharedValue<boolean>[]>(
    Array.from({ length: maxCards }, () => useSharedValue(false))
  ).current;

  // ─── State ─────────────────────────────────────────────────────────────────

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastStars, setLastStars] = useState(0);
  const [bestScores, setBestScores] = useState<Record<Difficulty, BestScore>>({
    easy: { score: 0, moves: Infinity, time: Infinity },
    medium: { score: 0, moves: Infinity, time: Infinity },
    hard: { score: 0, moves: Infinity, time: Infinity },
  });

  // Refs for values accessed in callbacks without triggering re-renders
  const trackRef = useRef<Card[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const movesRef = useRef(0);
  const timerValueRef = useRef(0);

  // Keep refs in sync with state for use in async callbacks
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { movesRef.current = moves; }, [moves]);
  useEffect(() => { timerValueRef.current = timer; }, [timer]);

  // ─── Persistence ───────────────────────────────────────────────────────────

  useEffect(() => {
    loadAllBestScores().then(setBestScores);
  }, []);

  // ─── Card Initialization ───────────────────────────────────────────────────

  const initializeCards = useCallback(
    (diff: Difficulty): Card[] => {
      flipAnims.forEach((anim) => { anim.value = false; });
      const deck = generateDeck(DIFFICULTY_LEVELS[diff].pairs, flipAnims);
      preloadCardImages(deck);
      return deck;
    },
    [flipAnims]
  );

  // Re-initialize when difficulty changes
  useEffect(() => {
    setCards(initializeCards(difficulty));
    setTimer(0);
    setGameStarted(false);
  }, [difficulty, initializeCards]);

  // ─── Timer ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!gameStarted || gameOver || cards.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const next = prev + 1;
        const timeLimit = DIFFICULTY_LEVELS[difficulty].timeLimit;

        if (next >= timeLimit) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          setGameStarted(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            "⏰ Time's Up!",
            `You ran out of time!\nScore: ${scoreRef.current}`,
            [{ text: 'Try Again', onPress: () => resetGame(difficulty) }]
          );
          return timeLimit;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, cards.length, difficulty]);

  // ─── Win Handler ───────────────────────────────────────────────────────────

  const handleWin = useCallback(
    (matchPoints: number) => {
      setGameOver(true);
      setGameStarted(false);
      if (timerRef.current) clearInterval(timerRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const finalScore = scoreRef.current + matchPoints;
      const finalMoves = movesRef.current + 1;
      const finalTime = timerValueRef.current;
      const stars = getStarRating(finalMoves, DIFFICULTY_LEVELS[difficulty].pairs);
      setLastStars(stars);

      // Update best score if this is a new record
      const currentBest = bestScores[difficulty];
      const isNewBest =
        finalScore > currentBest.score ||
        (finalScore === currentBest.score && finalMoves < currentBest.moves);

      if (isNewBest) {
        const newBest: BestScore = {
          score: finalScore,
          moves: finalMoves,
          time: finalTime,
        };
        setBestScores((prev) => ({ ...prev, [difficulty]: newBest }));
        saveBestScore(difficulty, newBest);
      }

      const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
      Alert.alert(
        '🎉 Congratulations!',
        `${starsDisplay}\n\nScore: ${finalScore}\nMoves: ${finalMoves}\nTime: ${formatTime(finalTime)}\nMax Combo: ${comboRef.current}x`,
        [{ text: 'Play Again', onPress: () => resetGame(difficulty) }]
      );
    },
    [difficulty, bestScores]
  );

  // ─── Game Actions ──────────────────────────────────────────────────────────

  const startGame = useCallback((): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGameStarted(true);
    setScore(0);
    setMoves(0);
    setCombo(0);
    comboRef.current = 0;
    setTimer(0);
    setGameOver(false);
    setLastStars(0);
    trackRef.current = [];
    setCards(initializeCards(difficulty));
  }, [difficulty, initializeCards]);

  const handleCardPress = useCallback(
    (card: Card): void => {
      if (
        trackRef.current.length >= 2 ||
        card.isMatched ||
        gameOver ||
        !gameStarted
      ) {
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      card.flipAnim.value = !card.flipAnim.value;
      trackRef.current = [...trackRef.current, card];
      setMoves((m) => m + 1);

      if (trackRef.current.length === 2) {
        const [first, second] = trackRef.current;

        if (first.type === second.type) {
          // ✅ Match found
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          const newCombo = comboRef.current + 1;
          comboRef.current = newCombo;
          setCombo(newCombo);

          const matchPoints = calculateMatchPoints(newCombo);

          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, isMatched: true }
                : c
            )
          );
          setScore((s) => s + matchPoints);
          trackRef.current = [];

          // Check if all cards are matched (game won)
          const allMatched = cards.every(
            (c) => c.id === first.id || c.id === second.id || c.isMatched
          );
          if (allMatched) {
            handleWin(matchPoints);
          }
        } else {
          // ❌ No match — flip cards back after delay
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          comboRef.current = 0;
          setCombo(0);

          setTimeout(() => {
            first.flipAnim.value = false;
            second.flipAnim.value = false;
            trackRef.current = [];
            setScore((s) => Math.max(0, s - MISMATCH_PENALTY));
          }, MISMATCH_DELAY);
        }
      }
    },
    [gameOver, gameStarted, cards, handleWin]
  );

  const resetGame = useCallback(
    (newDifficulty?: Difficulty): void => {
      const target = newDifficulty || difficulty;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setCards(initializeCards(target));
      setScore(0);
      setMoves(0);
      setCombo(0);
      comboRef.current = 0;
      setTimer(0);
      setGameOver(false);
      setGameStarted(false);
      setLastStars(0);
      trackRef.current = [];

      if (timerRef.current) clearInterval(timerRef.current);
      if (newDifficulty && newDifficulty !== difficulty) {
        setDifficulty(target);
      }
    },
    [difficulty, initializeCards]
  );

  const selectDifficulty = useCallback(
    (level: Difficulty): void => {
      if (gameStarted) return;
      Haptics.selectionAsync();
      setDifficulty(level);
    },
    [gameStarted]
  );

  // ─── Public API ────────────────────────────────────────────────────────────

  return {
    difficulty,
    cards,
    score,
    moves,
    combo,
    timer,
    gameStarted,
    gameOver,
    lastStars,
    bestScores,
    startGame,
    resetGame,
    selectDifficulty,
    handleCardPress,
  };
}
