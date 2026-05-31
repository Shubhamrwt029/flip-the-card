import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DIFFICULTY_LEVELS } from '@/constants/Game';
import type { Difficulty } from '@/types/Game';
import { formatTime } from '@/utils/formatTime';

interface ScoreHeaderProps {
  score: number;
  moves: number;
  timer: number;
  combo: number;
  difficulty: Difficulty;
}

/**
 * Displays the current game stats: score, moves, time, and combo streak.
 */
export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  score,
  moves,
  timer,
  combo,
  difficulty,
}) => (
  <View style={styles.container}>
    <View style={styles.statItem}>
      <Text style={styles.label}>Score</Text>
      <Text style={styles.value}>{score}</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.label}>Moves</Text>
      <Text style={styles.value}>{moves}</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.label}>Time</Text>
      <Text style={styles.value}>
        {formatTime(timer)}/{DIFFICULTY_LEVELS[difficulty].timeLimit}s
      </Text>
    </View>
    {combo > 1 && (
      <View style={styles.comboContainer}>
        <Text style={styles.comboText}>🔥 {combo}x</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
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
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
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
});
