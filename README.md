# Samantics - Test Your Vocabulary

A word-guessing game based on semantic similarity where players try to find a secret word by guessing words that are semantically related.

## Overview

Samantics challenges players to find a secret target word by making guesses and receiving feedback based on semantic similarity. Unlike traditional word games that rely on spelling or letter positions, Samantics uses word embeddings to measure how conceptually close your guesses are to the target word.

## Features

- Semantic similarity scoring using word embeddings
- Color-coded feedback on how close your guesses are
- Daily puzzles with consistent target words
- User progress saved locally in your browser
- Clean, responsive UI design

## Project Structure

- `frontend/`: React/TypeScript/Vite application with Tailwind CSS
- `api/`: Bun with TypeScript backend for API and embedding management
- `docker-compose.yml`: Configuration for deployment

## Development

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Node.js and npm (optional, if not using Bun)

### Frontend Development

```bash
cd frontend
bun install
bun run dev
```

### API Development

```bash
cd api
bun install
bun run api.ts
```

### Benchmarking

```bash
cd api
bun run benchmark.ts
```

## Deployment

The project can be deployed using Docker:

```bash
./deploy.sh
```

This will build and run the containers defined in the docker-compose.yml file.

## Technical Details

Samantics uses word embeddings to calculate semantic similarity between words. The backend manages a database of word embeddings and provides similarity scores for the frontend game interface.

## License

[License information here]

## Acknowledgments

- Inspired by the original [Samantics](https://Samantics.com/) game
- Word embeddings based on [model/data source]