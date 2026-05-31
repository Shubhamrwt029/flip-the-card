import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

/**
 * The hidden face of a card (shown before flipping).
 * Displays a "?" placeholder.
 */
export const CardBack: React.FC = () => (
  <View style={styles.back}>
    <Text style={styles.backText}>?</Text>
  </View>
);

interface CardFrontProps {
  imageUrl: string;
}

/**
 * The revealed face of a card (shown after flipping).
 * Displays the Pokémon sprite image.
 */
export const CardFront: React.FC<CardFrontProps> = ({ imageUrl }) => (
  <View style={styles.front}>
    <Image
      style={styles.image}
      source={{ uri: imageUrl }}
      accessibilityLabel="Pokémon card"
    />
  </View>
);

const styles = StyleSheet.create({
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
  image: {
    width: 80,
    height: 80,
  },
});
