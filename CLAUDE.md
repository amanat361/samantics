# Samantics Project Guide

## Commands
- Frontend dev: `cd frontend && bun run dev`
- Frontend build: `cd frontend && bun run build`
- Frontend lint: `cd frontend && bun run lint`
- API start: `cd api && bun run api.ts`
- Benchmarking: `cd api && bun run benchmark.ts`
- Deploy: `./deploy.sh` (builds and runs Docker containers)

## Code Style
- **Types**: Use explicit types for function parameters/returns
- **Components**: Use functional React components with hooks
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces
- **Imports**: Group imports by category (React, internal, external)
- **Error Handling**: Use try/catch for async operations with specific error messages
- **State Management**: Prefer React hooks for state (useState, useEffect, custom hooks)
- **Immutability**: Use spread operators for state updates, avoid direct mutations
- **Comments**: Add JSDoc for complex functions

## UI Design
- **Neobrutalist Style**: Bold colors, distinctive borders, shadows, and slightly "imperfect" design
- **Typography**: DM Sans as primary font
- **Components**:
  - Buttons have shadows that disappear on hover (transform effect)
  - GuessDisplay uses a three-section layout with distinctive left/middle/right areas
  - Error displays use rotation effects and bold badges
  - Loading states should be clearly visible with spinner animations

## Architecture
- Frontend: React/TypeScript/Vite with Tailwind CSS
- Backend: Bun with TypeScript for API and embedding management
- Docker: Used for deployment with docker-compose

## Game Mechanics
- First hint is available immediately, no guesses required
- Remaining hints are progressively unlocked (one every 5 guesses)
- 10 total hints available per game
- Hints are marked with a lightbulb icon in the guess display