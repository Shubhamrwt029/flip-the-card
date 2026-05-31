import { Image } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { MAX_POKEMON_ID } from '@/constants/Game';
import type { Card } from '@/types/Game';
import { shuffle } from './shuffle';

const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

/** Generates a random Pokémon ID between 1 and MAX_POKEMON_ID */
function generateRandomPokemonId(): number {
  return Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
}

/**
 * Generates a shuffled deck of card pairs for the game.
 *
 * Each pair shares the same Pokémon image. Cards are assigned
 * flip animations from the pre-allocated shared values array.
 */
export function generateDeck(
  pairCount: number,
  flipAnims: SharedValue<boolean>[]
): Card[] {
  const cards: Card[] = [];

  for (let i = 0; i < pairCount; i++) {
    const pokemonId = generateRandomPokemonId();
    const imageUrl = `${SPRITE_BASE_URL}/${pokemonId}.png`;
    const baseId = `${pokemonId}-${i}`;

    cards.push(
      {
        id: `${baseId}-a`,
        type: `pokemon-${pokemonId}`,
        image: imageUrl,
        flipAnim: flipAnims[i * 2],
        isMatched: false,
      },
      {
        id: `${baseId}-b`,
        type: `pokemon-${pokemonId}`,
        image: imageUrl,
        flipAnim: flipAnims[i * 2 + 1],
        isMatched: false,
      }
    );
  }

  // Shuffle and reassign flip animations by position
  const shuffled = shuffle(cards).map((card, index) => ({
    ...card,
    flipAnim: flipAnims[index],
    isMatched: false,
  }));

  return shuffled;
}

/**
 * Prefetches all card images so they display instantly during gameplay.
 */
export function preloadCardImages(cards: Card[]): void {
  cards.forEach((card) => {
    Image.prefetch(card.image);
  });
}
