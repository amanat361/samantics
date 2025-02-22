// src/hooks/useSemantleGame.ts
import { useState, useEffect } from "react";
import { API_URL } from "../config";

interface Guess {
  word: string;
  similarity: number;
}

export default function useSemantleGame() {
  const [dayNumber, setDayNumber] = useState(-1);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [targetWord, setTargetWord] = useState("");
  const [similarWords, setSimilarWords] = useState<Guess[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [error, setError] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [remainingHints, setRemainingHints] = useState(5);

  /**
   * Load daily game data (target word, target words, similar words, and day number)
   */
  useEffect(() => {
    async function loadDailyGame() {
      try {
        const res = await fetch(`${API_URL}/daily-game`);
        if (!res.ok) throw new Error("Failed to load daily game");
        const data = await res.json();
        setTargetWord(data.targetWord);
        setTargetWords(data.targetWords || []);
        setSimilarWords(data.similarWords || []);
        setDayNumber(data.dayNumber);
        setRemainingHints(5);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      }
    }
    loadDailyGame();
  }, []);

  /**
   * Start a new game by fetching a random game
   */
  async function startNewGame() {
    setError("");
    setGuesses([]);
    setGameOver(false);
    setRevealed(false);

    try {
      const res = await fetch(`${API_URL}/random-game`);
      if (!res.ok) throw new Error("Failed to load random game");
      const data = await res.json();
      setTargetWord(data.targetWord);
      setTargetWords(data.targetWords || []);
      setSimilarWords(data.similarWords || []);
      setDayNumber(0);
      setRemainingHints(5);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    }
  }

  /**
   * Guess a specific word
   */
  async function guessWord(word: string) {
    setError("");

    if (!targetWord) {
      setError("No target word. Start a new game first!");
      return;
    }
    if (gameOver) {
      setError("Game is already over. Start a new game!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, target: targetWord }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to make guess");
      }

      const newGuess = { word, similarity: data.similarity };
      setGuesses((prev) => [...prev, newGuess]);

      if (data.similarity > 0.99) {
        setGameOver(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    }
  }

  /**
   * Guess a random word from the target words list,
   * excluding the answer and previously guessed words
   */
  async function guessRandomWord() {
    if (!targetWord || gameOver) return;

    const guessedWords = new Set(guesses.map((g) => g.word));
    const availableWords = targetWords.filter(
      (word) => word !== targetWord && !guessedWords.has(word)
    );

    if (availableWords.length === 0) {
      setError("No more available words to guess!");
      return;
    }

    const randomWord =
      availableWords[Math.floor(Math.random() * availableWords.length)];
    await guessWord(randomWord);
  }

  /**
   * Consume a hint:
   * - Use one of 5 hints.
   * - For the first hint, pick a random word from the bottom 20 (indices 80-99) of the similarWords list.
   * - For subsequent hints, use the next 20-word tier (e.g., indices 60-79, 40-59, etc.).
   * - Hints do not include the target word or already guessed words.
   * - If a tier has no available words, move to the next higher tier.
   * - If no hint is available across all tiers, set an error.
   */
  async function consumeHint() {
    setError("");
    if (!targetWord) {
      setError("No game in progress.");
      return;
    }
    if (remainingHints <= 0) {
      setError("No hints remaining.");
      return;
    }

    // Determine which tier to use based on hints already consumed.
    // If 5 hints are available, then usedHints = 0 and tier = 0.
    // Tier 0 corresponds to indices 80-99 (bottom 20), tier 1: 60-79, etc.
    const usedHints = 5 - remainingHints;
    let tier = usedHints;
    let candidate: string | null = null;

    // Loop through tiers from the desired one up to tier 4
    while (tier < 5) {
      const start = 100 - 20 * (tier + 1); // e.g. tier 0: start = 80
      const end = 100 - 20 * tier - 1; // e.g. tier 0: end = 99
      // Get candidates in this tier that are not the answer and haven't been guessed
      const candidates = similarWords
        .slice(start, end + 1)
        .filter(
          (item) =>
            item.word !== targetWord &&
            !guesses.some((g) => g.word === item.word)
        );
      if (candidates.length > 0) {
        candidate =
          candidates[Math.floor(Math.random() * candidates.length)].word;
        break;
      }
      tier++;
    }

    if (!candidate) {
      setError("All possible hints have been given!");
      return;
    }

    setRemainingHints((prev) => prev - 1);
    // Use the hint by making a guess with the selected candidate
    await guessWord(candidate);
  }

  return {
    dayNumber,
    targetWord,
    targetWords,
    guesses,
    error,
    gameOver,
    revealed,
    remainingHints,
    startNewGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    setRevealed,
  };
}
