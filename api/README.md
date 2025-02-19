# Semantle Clone API Specification

Base URL: `http://localhost:3000`

## Endpoints

### Get Random Target Word
GET `/target`
- Returns a random word from the target word list
- Response: `{ "targetWord": string }`

### Get All Target Words
GET `/target-words`
- Returns all possible target words
- Response: `{ "targetWords": string[] }`

### Get Word Embedding
POST `/embed`
- Get embedding vector for a single word
- Request body: `{ "word": string }`
- Response: `{ "word": string, "embedding": number[], "source": "cache" | "api" }`

### Get Batch Embeddings
POST `/embedBatch`
- Get embedding vectors for multiple words
- Request body: `{ "words": string[] }`
- Response: `{ "embeddings": number[][], "newWords": string[] }`

### Calculate Similarity
POST `/similarity`
- Calculate cosine similarity between two embedding vectors
- Request body: `{ "a": number[], "b": number[] }`
- Response: `{ "similarity": number }`

### Seed Embeddings
POST `/seed`
- Administrative endpoint to rebuild embedding cache
- Response: `{ "success": true }`