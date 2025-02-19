/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSemantleGame.ts
import { useState, useEffect } from "react";

/**
 * Helper: Compute cosine similarity between two numeric vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  const dot = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const normB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

interface Guess {
  word: string;
  similarity: number;
}

export default function useSemantleGame() {
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [targetWord, setTargetWord] = useState("");
  const [targetEmbedding, setTargetEmbedding] = useState<number[] | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [error, setError] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);

  /**
   * 1) Load dictionary from /cached on mount.
   */
  useEffect(() => {
    async function loadDictionary() {
      try {
        const res = await fetch("http://localhost:3000/cached");
        if (!res.ok) throw new Error("Failed to load dictionary");
        const data = await res.json();
        setDictionary(data.words || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadDictionary();
  }, []);

  /**
   * 2) Start a new game:
   *    - Pick a random word from the dictionary
   *    - Fetch/Store its embedding
   */
  async function startNewGame() {
    if (dictionary.length === 0) {
      setError("Dictionary not loaded yet.");
      return;
    }
    setError("");
    setGuesses([]);
    setGameOver(false);
    setRevealed(false);

    try {
      // Random word from dictionary
      const randIndex = Math.floor(Math.random() * dictionary.length);
      const chosenWord = dictionary[randIndex];
      setTargetWord(chosenWord);

      // Fetch embedding for the chosen word
      const res = await fetch("http://localhost:3000/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: chosenWord }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to embed target word");
      }
      setTargetEmbedding(data.embedding || null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  /**
   * 3) Guess a word:
   *    - Embed the guess
   *    - Compute similarity locally
   *    - Check if it's correct (similarity ~1.0)
   */
  async function guessWord(word: string) {
    if (!targetEmbedding) {
      setError("No target word embedding. Start a new game first!");
      return;
    }
    if (gameOver) {
      setError("Game is already over. Start a new game!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to embed guess");
      }

      const guessEmbedding = data.embedding as number[];
      const similarity = cosineSimilarity(guessEmbedding, targetEmbedding);

      // Add to guess list
      const newGuess = { word, similarity };
      setGuesses((prev) => [...prev, newGuess]);

      // If similarity is super high, consider it a correct guess
      if (similarity > 0.99) {
        setGameOver(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return {
    dictionary,
    targetWord,
    guesses,
    error,
    gameOver,
    revealed,
    startNewGame,
    guessWord,
    setRevealed, // let components toggle "revealed"
  };
}
