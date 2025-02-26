# Samantics Frontend

React-based frontend for the Samantics word-guessing game, providing an intuitive user interface for players to guess words based on semantic similarity.

## Overview

The Samantics frontend is a modern web application built with React, TypeScript, and Vite that allows players to guess words and receive feedback on how semantically similar their guesses are to a secret target word. The game features a clean, responsive design with color-coded feedback.

## Features

- Interactive word-guessing interface
- Real-time semantic similarity feedback
- Color-coded guess visualization
- Local storage for game progress
- Responsive design with Tailwind CSS
- Multiple game modes (Daily Challenge and Random Game)
- Game statistics tracking

## Technology Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (including custom hooks)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime (recommended)
- Node.js and npm (alternative)

### Installation

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/amanat361/samantics.git
cd samantics/frontend

# Install dependencies
bun install
```

### Development Server

```bash
# Start the development server
bun run dev
```

The development server will be available at `http://localhost:5173` by default.

### Building for Production

```bash
# Create a production build
bun run build
```

The build artifacts will be stored in the `dist/` directory.

### Linting

```bash
# Run ESLint
bun run lint
```

## Project Structure

- `src/`: Source code directory
  - `components/`: React components
  - `hooks/`: Custom React hooks including `useSemantleGame`
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions for game logic
  - `assets/`: Static assets

## Key Components

- `GameControls`: Manages game state and controls
- `GuessForm`: Handles user input for word guessing
- `GuessDisplay`: Visualizes guesses with color-coded feedback
- `GameHeader`: Displays game information and statistics
- `GameModeBanner`: Shows the current game mode
- `GameResult`: Displays end-game results and statistics
- `Instructions`: Shows game rules and instructions

## Game Modes

- **Daily Challenge**: A new word each day, same for all players
- **Random Game**: Play unlimited games with randomly selected target words

## API Integration

The frontend connects to the Samantics API which provides:
- Daily and random target words
- Semantic similarity calculations
- Top similar words for hints

Configure the API URL in `src/config.ts` if you're running the API on a different host or port.

## Docker Deployment

This frontend can be deployed using Docker. A Dockerfile is provided in the repository.

```bash
# Build and run with docker-compose from the project root
cd ..
./deploy.sh
```
