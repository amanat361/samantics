// api.ts
import { serve } from "bun";
import {
  embed,
  embedBatch,
  seedEmbeddings,
  getWords,
  getRandomTargetWord,
  getTargetWords,
  getTopSimilarWords,
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
    throw new Error("Vectors must be of the same length to compute cosine similarity.");
  }
  const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
  const normB = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
  if (normA === 0 || normB === 0) {
    throw new Error("Cannot compute similarity for zero-vector(s).");
  }
  let similarity = dotProduct / (normA * normB);
  
  // Round the similarity to mitigate floating-point precision issues.
  similarity = Number(similarity.toFixed(15));
  
  // Clamp the similarity to ensure it remains within [-1, 1].
  if (similarity > 1) similarity = 1;
  if (similarity < -1) similarity = -1;
  
  return similarity;
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

/**
 * Gets a deterministic word based on the current date in Pacific time.
 */
function getDailyWord(): string {
  // Get current date in Pacific time
  const date = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles'
  });
  
  // Create a simple hash of the date string
  const hash = date.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);

  // Get all possible target words
  const targetWords = getTargetWords();
  
  // Use the hash to select a word (using absolute value in case of negative hash)
  const index = Math.abs(hash) % targetWords.length;
  return targetWords[index];
}

// --- Bun API Server ---

const server = serve({
  port: 3000,
  development: true,
  async fetch(request: Request) {
    try {
      const { pathname } = new URL(request.url);

      // 1) Handle preflight (OPTIONS) requests
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 200,
          headers: withCors(),
        });
      }

      // Endpoint: POST /guess
      if (pathname === "/guess" && request.method === "POST") {
        const { word, target } = await request.json();
        const validWord = validateWord(word);
        const validTarget = validateWord(target);

        // Get both embeddings and compare
        const wordEmbed = await embed(validWord);
        const targetEmbed = await embed(validTarget);

        const similarity = cosineSimilarity(
          wordEmbed.embedding,
          targetEmbed.embedding
        );

        return new Response(JSON.stringify({ similarity }), {
          headers: withCors({ "Content-Type": "application/json" }),
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

      // Endpoint: GET /daily
      if (pathname === "/daily" && request.method === "GET") {
        const dailyWord = getDailyWord();

        // Calculate days since 2/20/2025
        const startDate = new Date("2025-02-20T00:00:00-08:00"); // Pacific time
        const today = new Date().toLocaleDateString("en-US", {
          timeZone: "America/Los_Angeles",
        });
        const todayDate = new Date(today);
        const dayNumber =
          Math.floor(
            (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

        return new Response(
          JSON.stringify({
            targetWord: dailyWord,
            dayNumber,
          }),
          {
            headers: withCors({ "Content-Type": "application/json" }),
          }
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

      // Endpoint: POST /similar
      if (pathname === "/similar" && request.method === "POST") {
        const { word, limit = 10 } = await request.json();
        const validWord = validateWord(word);
        const similarWords = await getTopSimilarWords(validWord, limit);

        return new Response(JSON.stringify({ similarWords }), {
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

      // Endpoint: GET /daily-game
      if (pathname === "/daily-game" && request.method === "GET") {
        const dailyWord = getDailyWord();
        const targetWords = getTargetWords();
        const similarWords = await getTopSimilarWords(dailyWord, 100);

        // Calculate days since 2/20/2025
        const startDate = new Date("2025-02-20T00:00:00-08:00");
        const today = new Date().toLocaleDateString("en-US", {
          timeZone: "America/Los_Angeles",
        });
        const todayDate = new Date(today);
        const dayNumber =
          Math.floor(
            (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

        return new Response(
          JSON.stringify({
            targetWord: dailyWord,
            targetWords,
            similarWords,
            dayNumber,
          }),
          {
            headers: withCors({ "Content-Type": "application/json" }),
          }
        );
      }

      // Endpoint: GET /random-game
      if (pathname === "/random-game" && request.method === "GET") {
        const targetWord = getRandomTargetWord();
        const targetWords = getTargetWords();
        const similarWords = await getTopSimilarWords(targetWord, 100);

        return new Response(
          JSON.stringify({
            targetWord,
            targetWords,
            similarWords,
          }),
          {
            headers: withCors({ "Content-Type": "application/json" }),
          }
        );
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
