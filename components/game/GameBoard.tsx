import React from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet } from 'react-native';

import { GRID_COLUMNS } from '@/constants/Game';
import type { Card, Difficulty } from '@/types/Game';
import { CardBack, CardFront } from './CardFace';
import { FlipCard } from './FlipCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = Math.min((SCREEN_WIDTH - 48) / GRID_COLUMNS - 8, 110);
const CARD_HEIGHT = CARD_SIZE * 1.3;

interface GameBoardProps {
  cards: Card[];
  difficulty: Difficulty;
  gameOver: boolean;
  gameStarted: boolean;
  onCardPress: (card: Card) => void;
}

/**
 * Renders the grid of flip cards.
 * Each card is pressable and triggers the flip animation on tap.
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  difficulty,
  gameOver,
  gameStarted,
  onCardPress,
}) => {
  const renderCard = ({ item }: { item: Card }) => (
    <Pressable
      onPress={() => onCardPress(item)}
      style={[styles.cardContainer, item.isMatched && styles.matchedCard]}
      disabled={item.isMatched || gameOver || !gameStarted}
      accessibilityRole="button"
      accessibilityLabel={item.isMatched ? 'Matched card' : 'Hidden card'}
      accessibilityState={{ disabled: item.isMatched || gameOver || !gameStarted }}
    >
      <FlipCard
        isFlipped={item.flipAnim}
        cardStyle={styles.flipCard}
        frontContent={<CardBack />}
        backContent={<CardFront imageUrl={item.image} />}
        isMatched={item.isMatched}
      />
    </Pressable>
  );

  return (
    <FlatList
      data={cards}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      key={difficulty} // Force re-render on difficulty change
    />
  );
};

const styles = StyleSheet.create({
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
    width: CARD_SIZE,
    height: CARD_HEIGHT,
    backfaceVisibility: 'hidden',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});
