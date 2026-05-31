#!/bin/bash

# Clean Gradle caches
echo "Cleaning Gradle caches..."
rm -rf ~/.gradle/caches

# Clean Android build directories
echo "Cleaning Android build directories..."
cd "/Users/shubhamrawat/Documents/expo projects/flip-the-cards"
rm -rf android/.gradle
rm -rf android/build
rm -rf android/app/build

# Clean node_modules .gradle directories
echo "Cleaning node_modules .gradle directories..."
find node_modules -name ".gradle" -type d -exec rm -rf {} + 2>/dev/null || true

echo "Cleanup complete!"

