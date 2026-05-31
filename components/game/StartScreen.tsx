import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StarRating } from './StarRating';

interface StartScreenProps {
  lastStars: number;
  onStart: () => void;
}

/**
 * Shown when the game is not active.
 * Displays instructions, previous star rating, and a start button.
 */
export const StartScreen: React.FC<StartScreenProps> = ({
  lastStars,
  onStart,
}) => (
  <View style={styles.container}>
    {lastStars > 0 && <StarRating stars={lastStars} />}
    <Text style={styles.emoji}>🎴</Text>
    <Text style={styles.description}>
      Match all the Pokémon pairs{'\n'}before time runs out!
    </Text>
    <Pressable
      style={styles.button}
      onPress={onStart}
      accessibilityRole="button"
      accessibilityLabel={lastStars > 0 ? 'Play again' : 'Start game'}
    >
      <Text style={styles.buttonText}>
        {lastStars > 0 ? 'Play Again' : 'Start Game'}
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
