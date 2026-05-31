import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DifficultyConfig {
  pairs: number;
  timeLimit: number;
  label: string;
  color: string;
}

interface Card {
  id: string;
  type: string;
  image: string;
  flipAnim: SharedValue<boolean>;
  isMatched: boolean;
}

interface BestScore {
  score: number;
  moves: number;
  time: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Constants ───────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DIFFICULTY_LEVELS: Record<Difficulty, DifficultyConfig> = {
  easy: { pairs: 2, timeLimit: 60, label: 'Easy', color: '#2ecc71' },
  medium: { pairs: 4, timeLimit: 45, label: 'Medium', color: '#f39c12' },
  hard: { pairs: 6, timeLimit: 30, label: 'Hard', color: '#e74c3c' },
};

const COMBO_BONUS = 50;
const STORAGE_KEY_PREFIX = 'flip_cards_best_';

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const generateRandomPokemonId = (): number =>
  Math.floor(Math.random() * 898) + 1;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const getStarRating = (moves: number, pairs: number): number => {
  const perfectMoves = pairs;
  if (moves <= perfectMoves + 2) return 3;
  if (moves <= perfectMoves * 2) return 2;
  return 1;
};

const generateCardPairs = (
  pairCount: number,
  flipAnims: SharedValue<boolean>[]
): Card[] => {
  const pairs: Card[] = [];
  for (let i = 0; i < pairCount; i++) {
    const pokemonId = generateRandomPokemonId();
    const baseId = `${pokemonId}-${i}`;
    pairs.push(
      {
        id: `${baseId}-1`,
        type: `type-${pokemonId}`,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
        flipAnim: flipAnims[i * 2],
        isMatched: false,
      },
      {
        id: `${baseId}-2`,
        type: `type-${pokemonId}`,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
        flipAnim: flipAnims[i * 2 + 1],
        isMatched: false,
      }
    );
  }
  return pairs;
};

const preloadImages = (cards: Card[]) => {
  cards.forEach((card) => Image.prefetch(card.image));
};

// ─── Card Face Components ────────────────────────────────────────────────────

const RegularContent: React.FC = () => (
  <View style={cardFaceStyles.back}>
    <Text style={cardFaceStyles.backText}>?</Text>
  </View>
);

const FlippedContent: React.FC<{ type: string }> = ({ type }) => (
  <View style={cardFaceStyles.front}>
    <Image style={{ width: 80, height: 80 }} source={{ uri: type }} />
  </View>
);

// ─── FlipCard Component ──────────────────────────────────────────────────────

interface FlipCardProps {
  isFlipped: SharedValue<boolean>;
  cardStyle: StyleProp<ViewStyle>;
  direction?: 'x' | 'y';
  duration?: number;
  RegularContent: React.ReactNode;
  FlippedContent: React.ReactNode;
  isMatched: boolean;
}

const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  cardStyle,
  direction = 'y',
  duration = 400,
  RegularContent,
  FlippedContent,
  isMatched,
}) => {
  const isDirectionX = direction === 'x';

  const frontStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(isFlipped.value),
      [0, 1],
      [0, 180]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    return {
      transform: [
        isDirectionX
          ? { rotateX: rotateValue }
          : { rotateY: rotateValue },
      ],
      opacity: isMatched ? withTiming(0.5, { duration: 300 }) : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(isFlipped.value),
      [0, 1],
      [180, 360]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    return {
      transform: [
        isDirectionX
          ? { rotateX: rotateValue }
          : { rotateY: rotateValue },
      ],
      opacity: isMatched ? withTiming(0.5, { duration: 300 }) : 1,
    };
  });

  return (
    <View>
      <Animated.View
        style={[flipCardStyles.regularCard, cardStyle, frontStyle]}
      >
        {RegularContent}
      </Animated.View>
      <Animated.View
        style={[flipCardStyles.flippedCard, cardStyle, backStyle]}
      >
        {FlippedContent}
      </Animated.View>
    </View>
  );
};

// ─── Star Rating Component ───────────────────────────────────────────────────

const StarRating: React.FC<{ stars: number }> = ({ stars }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
    {[1, 2, 3].map((i) => (
      <Text key={i} style={{ fontSize: 28, marginHorizontal: 2 }}>
        {i <= stars ? '⭐' : '☆'}
      </Text>
    ))}
  </View>
);

// ─── Main App Component ──────────────────────────────────────────────────────

const App: React.FC = () => {
  const maxCards = DIFFICULTY_LEVELS.hard.pairs * 2;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const flipAnims = useRef<SharedValue<boolean>[]>(
    Array.from({ length: maxCards }, () => useSharedValue(false))
  ).current;

  // ─── State ───────────────────────────────────────────────────────────────
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScores, setBestScores] = useState<Record<Difficulty, BestScore>>({
    easy: { score: 0, moves: Infinity, time: Infinity },
    medium: { score: 0, moves: Infinity, time: Infinity },
    hard: { score: 0, moves: Infinity, time: Infinity },
  });
  const [lastStars, setLastStars] = useState(0);

  const track = useRef<Card[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef(0);

  // ─── Persistence ─────────────────────────────────────────────────────────
  const loadBestScores = useCallback(async () => {
    try {
      const scores: Record<string, BestScore> = {};
      for (const level of Object.keys(DIFFICULTY_LEVELS) as Difficulty[]) {
        const stored = await AsyncStorage.getItem(
          `${STORAGE_KEY_PREFIX}${level}`
        );
        if (stored) {
          scores[level] = JSON.parse(stored);
        } else {
          scores[level] = { score: 0, moves: Infinity, time: Infinity };
        }
      }
      setBestScores(scores as Record<Difficulty, BestScore>);
    } catch (e) {
      console.warn('Failed to load best scores', e);
    }
  }, []);

  const saveBestScore = async (level: Difficulty, newBest: BestScore) => {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${level}`,
        JSON.stringify(newBest)
      );
    } catch (e) {
      console.warn('Failed to save best score', e);
    }
  };

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  // ─── Card Initialization ─────────────────────────────────────────────────
  const initializeCards = useCallback(
    (diff: Difficulty): Card[] => {
      const pairCount = DIFFICULTY_LEVELS[diff].pairs;
      const selectedCards = generateCardPairs(pairCount, flipAnims);
      const shuffledCards = shuffle(selectedCards).map((card, index) => ({
        ...card,
        flipAnim: flipAnims[index],
        isMatched: false,
      }));
      flipAnims.forEach((anim) => {
        anim.value = false;
      });
      preloadImages(shuffledCards);
      return shuffledCards;
    },
    [flipAnims]
  );

  useEffect(() => {
    setCards(initializeCards(difficulty));
    setTimer(0);
    setGameStarted(false);
  }, [difficulty, initializeCards]);

  // ─── Animated Background ─────────────────────────────────────────────────
  const backgroundAnim = useSharedValue(0);
  const backgroundStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      backgroundAnim.value,
      [0, 0.5, 1],
      ['#1a1a2e', '#16213e', '#0f3460']
    );
    return { backgroundColor: bg };
  });

  useEffect(() => {
    backgroundAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(0, { duration: 4000 })
      ),
      -1,
      true
    );
  }, [backgroundAnim]);

  // ─── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameStarted && !gameOver && cards.length > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev + 1;
          const timeLimit = DIFFICULTY_LEVELS[difficulty].timeLimit;
          if (newTimer >= timeLimit) {
            clearInterval(timerRef.current!);
            setGameOver(true);
            setGameStarted(false);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            );
            Alert.alert(
              "⏰ Time's Up!",
              `You ran out of time!\nScore: ${score}`,
              [{ text: 'Try Again', onPress: () => resetGame(difficulty) }]
            );
            return timeLimit;
          }
          return newTimer;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, cards, difficulty]);

  // ─── Game Actions ────────────────────────────────────────────────────────
  const startGame = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGameStarted(true);
    setScore(0);
    setMoves(0);
    setCombo(0);
    comboRef.current = 0;
    setTimer(0);
    setGameOver(false);
    setLastStars(0);
    track.current = [];
    setCards(initializeCards(difficulty));
  };

  const handleCardPress = (card: Card): void => {
    if (
      track.current.length >= 2 ||
      card.isMatched ||
      gameOver ||
      !gameStarted
    )
      return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    card.flipAnim.value = !card.flipAnim.value;
    track.current = [...track.current, card];
    setMoves((m) => m + 1);

    if (track.current.length === 2) {
      const [first, second] = track.current;
      if (first.type === second.type) {
        // Match!
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        const comboBonus = (newCombo - 1) * COMBO_BONUS;
        const matchPoints = 100 + comboBonus;

        setCards((prevCards) =>
          prevCards.map((item) =>
            item.id === first.id || item.id === second.id
              ? { ...item, isMatched: true }
              : item
          )
        );
        setScore((s) => s + matchPoints);
        track.current = [];

        // Check win
        const allMatched = cards.every(
          (c) =>
            c.id === first.id || c.id === second.id || c.isMatched
        );
        if (allMatched) {
          handleWin(matchPoints);
        }
      } else {
        // No match
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        comboRef.current = 0;
        setCombo(0);
        setTimeout(() => {
          first.flipAnim.value = false;
          second.flipAnim.value = false;
          track.current = [];
          setScore((s) => Math.max(0, s - 10));
        }, 600);
      }
    }
  };

  const handleWin = (lastMatchPoints: number): void => {
    setGameOver(true);
    setGameStarted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const finalScore = score + lastMatchPoints;
    const finalMoves = moves + 1;
    const finalTime = timer;
    const stars = getStarRating(finalMoves, DIFFICULTY_LEVELS[difficulty].pairs);
    setLastStars(stars);

    // Update best score
    const currentBest = bestScores[difficulty];
    if (
      finalScore > currentBest.score ||
      (finalScore === currentBest.score && finalMoves < currentBest.moves)
    ) {
      const newBest = {
        score: finalScore,
        moves: finalMoves,
        time: finalTime,
      };
      setBestScores((prev) => ({ ...prev, [difficulty]: newBest }));
      saveBestScore(difficulty, newBest);
    }

    const starsText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    Alert.alert(
      '🎉 Congratulations!',
      `${starsText}\n\nScore: ${finalScore}\nMoves: ${finalMoves}\nTime: ${formatTime(finalTime)}\nMax Combo: ${comboRef.current}x`,
      [{ text: 'Play Again', onPress: () => resetGame(difficulty) }]
    );
  };

  const resetGame = (newDifficulty?: Difficulty): void => {
    const targetDifficulty = newDifficulty || difficulty;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCards(initializeCards(targetDifficulty));
    setScore(0);
    setMoves(0);
    setCombo(0);
    comboRef.current = 0;
    setTimer(0);
    setGameOver(false);
    setGameStarted(false);
    setLastStars(0);
    track.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    if (newDifficulty && newDifficulty !== difficulty) {
      setDifficulty(targetDifficulty);
    }
  };

  const selectDifficulty = (newDifficulty: Difficulty): void => {
    if (gameStarted) return;
    Haptics.selectionAsync();
    setDifficulty(newDifficulty);
  };

  // ─── Render Helpers ──────────────────────────────────────────────────────
  const cardSize = Math.min((SCREEN_WIDTH - 48) / 3 - 8, 110);

  const renderItem = ({ item }: { item: Card }) => (
    <Pressable
      onPress={() => handleCardPress(item)}
      style={[styles.cardContainer, item.isMatched && styles.matchedCard]}
      disabled={item.isMatched || gameOver || !gameStarted}
    >
      <FlipCard
        isFlipped={item.flipAnim}
        cardStyle={[styles.flipCard, { width: cardSize, height: cardSize * 1.3 }]}
        RegularContent={<RegularContent />}
        FlippedContent={<FlippedContent type={item.image} />}
        isMatched={item.isMatched}
      />
    </Pressable>
  );

  const currentBest = bestScores[difficulty];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <SafeAreaView style={styles.innerContainer}>
        {/* Title */}
        <Text style={styles.title}>🃏 Flip the Cards</Text>

        {/* Score Header */}
        <View style={styles.header}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moves}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>
              {formatTime(timer)}/{DIFFICULTY_LEVELS[difficulty].timeLimit}s
            </Text>
          </View>
          {combo > 1 && (
            <View style={styles.comboContainer}>
              <Text style={styles.comboText}>🔥 {combo}x</Text>
            </View>
          )}
        </View>

        {/* Difficulty Selector */}
        <View style={styles.difficultyContainer}>
          {(Object.keys(DIFFICULTY_LEVELS) as Difficulty[]).map((level) => (
            <Pressable
              key={level}
              style={[
                styles.difficultyButton,
                { backgroundColor: DIFFICULTY_LEVELS[level].color },
                difficulty === level && styles.selectedDifficulty,
                gameStarted && styles.disabledButton,
              ]}
              onPress={() => selectDifficulty(level)}
              disabled={gameStarted}
            >
              <Text style={styles.difficultyButtonText}>
                {DIFFICULTY_LEVELS[level].label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Best Score */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {currentBest.moves === Infinity
              ? '🏆 No record yet'
              : `🏆 ${currentBest.score} pts · ${currentBest.moves} moves · ${formatTime(currentBest.time)}`}
          </Text>
          <Pressable
            style={styles.resetButton}
            onPress={() => resetGame(difficulty)}
          >
            <Text style={styles.resetButtonText}>↺</Text>
          </Pressable>
        </View>

        {/* Game Area */}
        {gameStarted && cards.length > 0 ? (
          <FlatList
            data={cards}
            renderItem={renderItem}
            keyExtractor={(item: Card) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            key={difficulty}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.startContainer}>
            {lastStars > 0 && <StarRating stars={lastStars} />}
            <Text style={styles.startEmoji}>🎴</Text>
            <Text style={styles.startText}>
              Match all the Pokémon pairs{'\n'}before time runs out!
            </Text>
            <Pressable style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>
                {lastStars > 0 ? 'Play Again' : 'Start Game'}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
};

export default App;

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardFaceStyles = StyleSheet.create({
  back: {
    flex: 1,
    backgroundColor: '#2d3436',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  backText: {
    color: '#6c5ce7',
    fontSize: 28,
    fontWeight: 'bold',
  },
  front: {
    flex: 1,
    backgroundColor: '#dfe6e9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00b894',
  },
});

const flipCardStyles = StyleSheet.create({
  regularCard: {
    position: 'absolute',
    zIndex: 1,
  },
  flippedCard: {
    zIndex: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  comboContainer: {
    backgroundColor: '#e17055',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comboText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    opacity: 0.7,
  },
  selectedDifficulty: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  disabledButton: {
    opacity: 0.4,
  },
  difficultyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  resetButton: {
    backgroundColor: '#d63031',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  startEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  startText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#00b894',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  cardContainer: {
    margin: 4,
    borderRadius: 12,
  },
  matchedCard: {
    opacity: 0.4,
  },
  flipCard: {
    backfaceVisibility: 'hidden',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});
