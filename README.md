# 🃏 Flip the Cards

A Pokémon memory card matching game built with React Native, Expo, and Reanimated. Flip cards to find matching Pokémon pairs before time runs out!

## Demo

<p align="center">
  <img src="./assets/demo/gameplay.gif" width="300" alt="Gameplay demo" />
</p>

## Features

- **3 Difficulty Levels** — Easy (4 cards / 60s), Medium (8 cards / 45s), Hard (12 cards / 30s)
- **Combo System** — Earn bonus points for consecutive matches (+50 per streak)
- **Star Rating** — 1-3 stars based on move efficiency after each win
- **Persistent Best Scores** — High scores saved per difficulty (AsyncStorage)
- **Haptic Feedback** — Tactile vibrations on flip, match, and mismatch
- **Smooth Flip Animations** — Card flip powered by React Native Reanimated
- **Animated Background** — Subtle dark gradient color animation
- **Pokémon Sprites** — Random Pokémon from Gen 1-8 via PokeAPI sprites
- **Image Preloading** — Sprites prefetched before gameplay starts
- **Responsive Layout** — Card grid adapts to screen width

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 53 |
| Routing | Expo Router (file-based) |
| Animations | React Native Reanimated |
| Haptics | expo-haptics |
| Persistence | @react-native-async-storage/async-storage |
| Language | TypeScript (strict) |

## Project Structure

```
├── app/
│   ├── _layout.tsx              # Root Stack navigator
│   ├── App.tsx                  # Main game screen (composition)
│   ├── +not-found.tsx           # 404 screen
│   └── (tabs)/
│       ├── _layout.tsx          # Tab group layout
│       └── index.tsx            # Entry point → renders App
│
├── components/
│   └── game/
│       ├── index.ts             # Barrel exports
│       ├── FlipCard.tsx         # Animated flip card component
│       ├── CardFace.tsx         # Card front/back face views
│       ├── GameBoard.tsx        # FlatList grid of cards
│       ├── ScoreHeader.tsx      # Score, moves, time, combo display
│       ├── DifficultySelector.tsx # Difficulty level buttons
│       ├── BestScoreBar.tsx     # Best score display + reset
│       ├── StartScreen.tsx      # Pre-game start screen
│       └── StarRating.tsx       # Star rating display
│
├── hooks/
│   └── useGameEngine.ts         # Core game logic hook
│
├── utils/
│   ├── cardGenerator.ts         # Card pair generation + image preload
│   ├── formatTime.ts            # Time formatting utility
│   ├── scoring.ts               # Score calculation + star rating
│   ├── shuffle.ts               # Fisher-Yates shuffle
│   └── storage.ts               # AsyncStorage persistence layer
│
├── constants/
│   └── Game.tsx                 # Game configuration constants
│
├── types/
│   └── Game.tsx                 # TypeScript interfaces & types
│
└── assets/
    ├── fonts/
    └── images/
```

## Architecture Decisions

- **Custom Hook Pattern** — All game logic lives in `useGameEngine`, keeping the UI layer thin and testable
- **Component Composition** — Small, focused components with clear props interfaces
- **No External Utility Libraries** — Custom Fisher-Yates shuffle instead of lodash (saves ~70KB)
- **Shared Values for Animations** — Pre-allocated Reanimated shared values reused across games
- **Barrel Exports** — Clean imports via `@/components/game`

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- Android Studio / Xcode (for native builds)

### Installation

```bash
# Clone the repo
git clone https://github.com/Shubhamrwt029/flip-the-card.git
cd flip-the-card

# Install dependencies
yarn install

# Start the dev server
npx expo start
```

### Running on Device

```bash
# Android (requires Android Studio)
npx expo run:android

# iOS (requires Xcode)
npx expo run:ios
```

## How to Play

1. Select a difficulty level (Easy / Medium / Hard)
2. Tap **Start Game**
3. Tap cards to flip and reveal the Pokémon
4. Match two identical Pokémon to score points
5. Match consecutively for combo bonuses 🔥
6. Complete all pairs before the timer runs out!
7. Get ⭐⭐⭐ for near-perfect play

## License

MIT
