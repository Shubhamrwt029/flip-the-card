import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DIFFICULTY_LEVELS } from '@/constants/Game';
import type { Difficulty } from '@/types/Game';

interface DifficultySelectorProps {
  current: Difficulty;
  disabled: boolean;
  onSelect: (level: Difficulty) => void;
}

/**
 * Row of difficulty level buttons.
 * Highlights the currently selected level and disables interaction during gameplay.
 */
export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  current,
  disabled,
  onSelect,
}) => (
  <View style={styles.container}>
    {(Object.keys(DIFFICULTY_LEVELS) as Difficulty[]).map((level) => {
      const config = DIFFICULTY_LEVELS[level];
      const isSelected = current === level;

      return (
        <Pressable
          key={level}
          style={[
            styles.button,
            { backgroundColor: config.color },
            isSelected && styles.selected,
            disabled && styles.disabled,
          ]}
          onPress={() => onSelect(level)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled }}
          accessibilityLabel={`${config.label} difficulty: ${config.pairs * 2} cards, ${config.timeLimit} seconds`}
        >
          <Text style={styles.buttonText}>{config.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    opacity: 0.7,
  },
  selected: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  disabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
