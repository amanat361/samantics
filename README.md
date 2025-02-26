# Samantics - Test Your Vocabulary

A word-guessing game based on semantic similarity where players try to find a secret word by guessing words that are semantically related.

## Overview

Samantics challenges players to find a secret target word by making guesses and receiving feedback based on semantic similarity. Unlike traditional word games that rely on spelling or letter positions, Samantics uses word embeddings to measure how conceptually close your guesses are to the target word.

## Features

- Semantic similarity scoring using word embeddings
- Color-coded feedback on how close your guesses are
- Daily puzzles with consistent target words
- Random game mode for unlimited play
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

### Embedding Model

**Important:** This project requires a text embedding model to generate word vectors. You'll need to configure your own embedding model by updating the `OLLAMA_URL` in `api/embeddings.ts`. 

By default, the code is configured to use a Cloudflare tunnel to access an embedding model, but you can replace this with any embedding API. You don't need to use the Cloudflare tunnel system - it's a "bring your own model" setup.

To use your own model:
1. Edit `api/embeddings.ts`
2. Update the `OLLAMA_URL` to point to your embedding service
3. Adjust the request format in the `getFromAPI` method if needed
4. Remove the Cloudflare credentials if they're not needed for your setup

## License

[GNU AFFERO GENERAL PUBLIC LICENSE v3.0](https://github.com/amanat361/samantics/blob/main/LICENSE)

This project is licensed under the terms of the GNU Affero General Public License v3.0. This means you can use, modify, and distribute this project, as long as you follow the terms of the license. Keep software open and free!

## Acknowledgments

- Inspired by the original [Semantle](https://semantle.com/) game
- Word embeddings based on [Nomic Embed Text](https://ollama.com/library/nomic-embed-text) from [Ollama](https://ollama.ai/)
