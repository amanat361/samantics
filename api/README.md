# Samantics API

Backend service for the Samantics word game that handles word embeddings and semantic similarity calculations.

## Overview

The Samantics API powers the word-guessing game by providing word embeddings and calculating semantic similarity between words. It manages a database of word vectors and exposes endpoints for the frontend to interact with.

## Features

- Word embedding storage and retrieval
- Semantic similarity calculation
- Target word management
- Efficient batch operations for embedding retrieval
- Performance-optimized using Bun runtime

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime (v1.2.3+)

### Installation

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/amanat361/samantics.git
cd samantics/api

# Install dependencies
bun install
```

### Running the API

```bash
# Start the API server
bun run api.ts
```

The API will be available at `http://localhost:3000` by default.

### Benchmarking

```bash
# Run performance benchmarks
bun run benchmark.ts
```

## API Endpoints

Base URL: `http://localhost:3000`

### Get Daily Game
GET `/daily-game`
- Returns the daily target word and related words
- Response: `{ targetWord: string, targetWords: string[], similarWords: {word: string, similarity: number}[], dayNumber: number }`

### Get Random Game
GET `/random-game`
- Returns a random target word and related words
- Response: `{ targetWord: string, targetWords: string[], similarWords: {word: string, similarity: number}[] }`

### Get Daily Word
GET `/daily`
- Returns the daily target word
- Response: `{ targetWord: string, dayNumber: number }`

### Get Random Target Word
GET `/target`
- Returns a random word from the target word list
- Response: `{ targetWord: string }`

### Get All Target Words
GET `/target-words`
- Returns all possible target words
- Response: `{ targetWords: string[] }`

### Get Word Embedding
POST `/embed`
- Get embedding vector for a single word
- Request body: `{ word: string }`
- Response: `{ word: string, embedding: number[], source: "cache" | "api" }`

### Get Batch Embeddings
POST `/embedBatch`
- Get embedding vectors for multiple words
- Request body: `{ words: string[] }`
- Response: `{ embeddings: number[][], newWords: string[] }`

### Calculate Similarity Between a Word and Target
POST `/guess`
- Calculate similarity between a guess word and a target word
- Request body: `{ word: string, target: string }`
- Response: `{ similarity: number }`

### Get Similar Words
POST `/similar`
- Get words similar to a specific word
- Request body: `{ word: string, limit?: number }`
- Response: `{ similarWords: {word: string, similarity: number}[] }`

### Calculate Similarity
POST `/similarity`
- Calculate cosine similarity between two embedding vectors
- Request body: `{ a: number[], b: number[] }`
- Response: `{ similarity: number }`

### Seed Embeddings
POST `/seed`
- Administrative endpoint to rebuild embedding cache
- Response: `{ success: true }`

## Data Management

The API uses several data files:
- `data/embeddings.json`: Cache of word embeddings
- `data/target-words.txt`: List of potential target words
- `data/words.txt`: Dictionary of valid words
- `data/similarityGraph.json`: Pre-calculated similarity scores
- `data/hints.txt`: Words used for hint generation
- `data/animals.txt`: Animal words (optional alternative target words)

## Embedding Model Configuration

**Important:** The project is designed to work with any text embedding model. By default, it's configured to use a Cloudflare tunneled endpoint to access a Nomic Embed Text model, but you can replace this with your own model:

1. In `embeddings.ts`, update the following lines:
```typescript
constructor() {
  this.OLLAMA_URL = `${process.env.CLOUDFLARE_URL}/api/embed`;
  this.headers = {
    Accept: "application/json",
    "Cf-Access-Client-Id": process.env.CLOUDFLARE_ID || "",
    "Cf-Access-Client-Secret": process.env.CLOUDFLARE_SECRET || "",
  };
  // ...
}
```

2. Replace with your own model API:
```typescript
constructor() {
  this.OLLAMA_URL = "https://your-embedding-api-url";
  this.headers = {
    Accept: "application/json",
    // Add any API keys or other headers your service requires
  };
  // ...
}
```

3. You may also need to update the `getFromAPI` method to match your API's request/response format.

## Docker Deployment

This API can be deployed using Docker. A Dockerfile is provided in the repository.

```bash
# Build and run with docker-compose from the project root
cd ..
./deploy.sh
```