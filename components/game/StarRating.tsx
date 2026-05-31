import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
}

/**
 * Displays a star rating (filled vs empty stars).
 * Used on the victory screen to show performance.
 */
export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  maxStars = 3,
}) => (
  <View style={styles.container} accessibilityLabel={`${stars} out of ${maxStars} stars`}>
    {Array.from({ length: maxStars }, (_, i) => (
      <Text key={i} style={styles.star}>
        {i < stars ? '⭐' : '☆'}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  star: {
    fontSize: 28,
    marginHorizontal: 2,
  },
});
