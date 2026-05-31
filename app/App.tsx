import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  BestScoreBar,
  DifficultySelector,
  GameBoard,
  ScoreHeader,
  StartScreen,
} from '@/components/game';
import { useGameEngine } from '@/hooks/useGameEngine';

/**
 * Main game screen component.
 * Composes UI components and connects them to the game engine hook.
 */
const App: React.FC = () => {
  const game = useGameEngine();

  // ─── Animated Background ─────────────────────────────────────────────────
  const bgAnim = useSharedValue(0);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgAnim.value,
      [0, 0.5, 1],
      ['#1a1a2e', '#16213e', '#0f3460']
    ),
  }));

  useEffect(() => {
    bgAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(0, { duration: 4000 })
      ),
      -1,
      true
    );
  }, [bgAnim]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>🃏 Flip the Cards</Text>

        <ScoreHeader
          score={game.score}
          moves={game.moves}
          timer={game.timer}
          combo={game.combo}
          difficulty={game.difficulty}
        />

        <DifficultySelector
          current={game.difficulty}
          disabled={game.gameStarted}
          onSelect={game.selectDifficulty}
        />

        <BestScoreBar
          bestScore={game.bestScores[game.difficulty]}
          onReset={() => game.resetGame(game.difficulty)}
        />

        {game.gameStarted && game.cards.length > 0 ? (
          <GameBoard
            cards={game.cards}
            difficulty={game.difficulty}
            gameOver={game.gameOver}
            gameStarted={game.gameStarted}
            onCardPress={game.handleCardPress}
          />
        ) : (
          <StartScreen
            lastStars={game.lastStars}
            onStart={game.startGame}
          />
        )}
      </SafeAreaView>
    </Animated.View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
});
