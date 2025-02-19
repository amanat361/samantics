// api.ts
import { serve } from "bun";
import {
  embed,
  embedBatch,
  seedEmbeddings,
  getWords,
  getRandomTargetWord,
  getTargetWords,
} from "./embeddings";

// --- Helper Functions for Input Validation ---

/**
 * Ensure the provided value is a non-empty string.
 */
function validateWord(word: unknown): string {
  if (typeof word !== "string") {
    throw new Error("Invalid input: word must be a string.");
  }
  const trimmed = word.trim();
  if (trimmed.length === 0) {
    throw new Error("Invalid input: word cannot be empty.");
  }
  if (!trimmed.match(/^[a-zA-Z ]+$/)) {
    throw new Error("Invalid input: word can only contain letters and spaces.");
  }
  return trimmed;
}

/**
 * Ensure the provided value is an array of non-empty strings.
 */
function validateWords(words: unknown): string[] {
  if (!Array.isArray(words)) {
    throw new Error("Invalid input: expected an array of words.");
  }
  return words.map((w) => validateWord(w));
}

/**
 * Compute cosine similarity between two numeric vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      "Vectors must be of the same length to compute cosine similarity."
    );
  }
  const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
  const normB = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
  if (normA === 0 || normB === 0) {
    throw new Error("Cannot compute similarity for zero-vector(s).");
  }
  return dotProduct / (normA * normB);
}

// --- CORS Helpers ---

/**
 * Returns common CORS headers.
 * Change the "Access-Control-Allow-Origin" value to your domain if desired.
 */
function withCors(baseHeaders: HeadersInit = {}): HeadersInit {
  return {
    ...baseHeaders,
    "Access-Control-Allow-Origin": "*", // Or specify "http://localhost:5173" or your domain
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

// --- Bun API Server ---

const server = serve({
  port: 3000,
  development: true,
  async fetch(request) {
    try {
      const { pathname } = new URL(request.url);

      // 1) Handle preflight (OPTIONS) requests
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 200,
          headers: withCors(),
        });
      }

      // Endpoint: POST /embed
      if (pathname === "/embed" && request.method === "POST") {
        const { word } = await request.json();
        const validWord = validateWord(word);
        const result = await embed(validWord);
        return new Response(
          JSON.stringify({
            word: validWord,
            embedding: result.embedding,
            source: result.source,
          }),
          { headers: withCors({ "Content-Type": "application/json" }) }
        );
      }

      // Endpoint: POST /embedBatch
      if (pathname === "/embedBatch" && request.method === "POST") {
        const { words } = await request.json();
        const validWords = validateWords(words);
        const result = await embedBatch(validWords);
        return new Response(
          JSON.stringify({
            embeddings: result.embeddings,
            newWords: result.newWords,
          }),
          { headers: withCors({ "Content-Type": "application/json" }) }
        );
      }

      // Endpoint: GET /target
      if (pathname === "/target" && request.method === "GET") {
        const targetWord = getRandomTargetWord();
        return new Response(JSON.stringify({ targetWord }), {
          headers: withCors({ "Content-Type": "application/json" }),
        });
      }

      // Endpoint: GET /target-words
      if (pathname === "/target-words" && request.method === "GET") {
        const targetWords = getTargetWords();
        return new Response(JSON.stringify({ targetWords }), {
          headers: withCors({ "Content-Type": "application/json" }),
        });
      }

      // Endpoint: GET /cached
      if (pathname === "/cached" && request.method === "GET") {
        const words = getWords();
        return new Response(JSON.stringify({ words }), {
          headers: withCors({ "Content-Type": "application/json" }),
        });
      }

      // Endpoint: POST /seed
      if (pathname === "/seed" && request.method === "POST") {
        await seedEmbeddings();
        return new Response(JSON.stringify({ success: true }), {
          headers: withCors({ "Content-Type": "application/json" }),
        });
      }

      // Optional: POST /similarity
      if (pathname === "/similarity" && request.method === "POST") {
        const { a, b } = await request.json();
        if (!Array.isArray(a) || !Array.isArray(b)) {
          throw new Error("Both a and b must be arrays of numbers.");
        }
        // Validate numeric array elements
        if (
          !a.every((n: unknown) => typeof n === "number") ||
          !b.every((n: unknown) => typeof n === "number")
        ) {
          throw new Error("Both arrays must contain only numbers.");
        }
        const similarity = cosineSimilarity(a, b);
        return new Response(JSON.stringify({ similarity }), {
          headers: withCors({ "Content-Type": "application/json" }),
        });
      }

      // Fallback for unknown routes
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: withCors({ "Content-Type": "application/json" }),
      });
    } catch (error: any) {
      console.error("Error processing request:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        {
          status: 500,
          headers: withCors({ "Content-Type": "application/json" }),
        }
      );
    }
  },
});

console.log(`Bun API server running at http://localhost:${server.port}`);
