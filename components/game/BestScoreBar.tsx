import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BestScore } from '@/types/Game';
import { formatTime } from '@/utils/formatTime';

interface BestScoreBarProps {
  bestScore: BestScore;
  onReset: () => void;
}

/**
 * Displays the best score for the current difficulty with a reset button.
 */
export const BestScoreBar: React.FC<BestScoreBarProps> = ({
  bestScore,
  onReset,
}) => {
  const hasRecord = bestScore.moves !== Infinity;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {hasRecord
          ? `🏆 ${bestScore.score} pts · ${bestScore.moves} moves · ${formatTime(bestScore.time)}`
          : '🏆 No record yet'}
      </Text>
      <Pressable
        style={styles.resetButton}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Reset game"
      >
        <Text style={styles.resetText}>↺</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  text: {
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
  resetText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
