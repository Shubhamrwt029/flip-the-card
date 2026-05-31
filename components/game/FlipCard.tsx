import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    SharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

import { FLIP_DURATION } from '@/constants/Game';

interface FlipCardProps {
  isFlipped: SharedValue<boolean>;
  cardStyle: StyleProp<ViewStyle>;
  direction?: 'x' | 'y';
  duration?: number;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isMatched: boolean;
}

/**
 * Animated flip card component using Reanimated shared values.
 * Renders both faces and rotates between them based on `isFlipped`.
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  cardStyle,
  direction = 'y',
  duration = FLIP_DURATION,
  frontContent,
  backContent,
  isMatched,
}) => {
  const isDirectionX = direction === 'x';

  const frontStyle = useAnimatedStyle(() => {
    const spin = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotation = withTiming(`${spin}deg`, { duration });

    return {
      transform: [isDirectionX ? { rotateX: rotation } : { rotateY: rotation }],
      opacity: isMatched ? withTiming(0.5, { duration: 300 }) : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const spin = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotation = withTiming(`${spin}deg`, { duration });

    return {
      transform: [isDirectionX ? { rotateX: rotation } : { rotateY: rotation }],
      opacity: isMatched ? withTiming(0.5, { duration: 300 }) : 1,
    };
  });

  return (
    <View>
      <Animated.View style={[styles.front, cardStyle, frontStyle]}>
        {frontContent}
      </Animated.View>
      <Animated.View style={[styles.back, cardStyle, backStyle]}>
        {backContent}
      </Animated.View>
    </View>
  );
};

const styles = {
  front: {
    position: 'absolute' as const,
    zIndex: 1,
  },
  back: {
    zIndex: 2,
  },
};
