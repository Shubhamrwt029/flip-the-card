# 🃏 Flip the Cards

A Pokémon memory card matching game built with React Native and Expo. Flip cards to find matching Pokémon pairs before time runs out!

## Screenshots

| Start Screen | Gameplay | Win Screen |
|:---:|:---:|:---:|
| 🎴 Select difficulty | 🔥 Match pairs with combos | ⭐ Star rating system |

## Features

- **3 Difficulty Levels** — Easy (4 cards), Medium (8 cards), Hard (12 cards) with different time limits
- **Combo System** — Earn bonus points for consecutive matches (100 + 50 per streak)
- **Star Rating** — Get 1-3 stars based on your efficiency after each win
- **Persistent Best Scores** — High scores saved per difficulty level (survives app restarts)
- **Haptic Feedback** — Tactile vibrations on card flip, match, and mismatch
- **Smooth Animations** — Card flip animations powered by React Native Reanimated
- **Animated Background** — Subtle dark gradient animation
- **Pokémon Sprites** — Random Pokémon from all generations fetched from PokeAPI
- **Image Preloading** — Sprites are prefetched before gameplay starts
- **Responsive Layout** — Cards adapt to screen size

## Tech Stack

- **Framework:** React Native with Expo SDK 53
- **Routing:** Expo Router (file-based)
- **Animations:** React Native Reanimated
- **Haptics:** expo-haptics
- **Storage:** @react-native-async-storage/async-storage
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
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
# Android
npx expo run:android

# iOS
npx expo run:ios
```

## How to Play

1. Select a difficulty level (Easy / Medium / Hard)
2. Tap **Start Game**
3. Tap cards to flip them and reveal the Pokémon
4. Match two identical Pokémon to score points
5. Match consecutively for combo bonuses 🔥
6. Complete all pairs before the timer runs out!

## Project Structure

```
app/
├── _layout.tsx          # Root layout (Stack navigator)
├── App.tsx              # Main game component
├── (tabs)/
│   ├── _layout.tsx      # Tab layout
│   └── index.tsx        # Entry point (renders App)
types/
│   └── Game.tsx         # TypeScript interfaces
assets/
│   ├── fonts/
│   └── images/
```

## License

MIT
