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
   * Consume a hint with configurable pool size and random selection size
   * @param totalHintPool The total number of similar words to consider (e.g. 60)
   * @param randomSelectionSize How many words to randomly choose from in each tier (e.g. 3)
   */
  async function consumeHint(
    totalHintPool: number = 60,
    randomSelectionSize: number = 3
  ) {
    setError("");
    if (!targetWord) {
      setError("No game in progress.");
      return;
    }
    if (remainingHints <= 0) {
      setError("No hints remaining.");
      return;
    }

    // Filter out invalid words first
    const availableWords = similarWords.filter((item) => {
      const word = item.word;
      return (
        word !== targetWord &&
        !guesses.some((g) => g.word === word) &&
        word !== targetWord + "s" &&
        word !== targetWord + "es"
      );
    });

    // Take only the specified pool size
    const hintPool = availableWords.slice(0, totalHintPool);

    // Calculate tier size based on total pool and number of hints
    const TOTAL_HINTS = 5;
    const tierSize = Math.floor(totalHintPool / TOTAL_HINTS);
    const usedHints = 5 - remainingHints;

    // Get the current tier's words
    const tierEnd = totalHintPool - usedHints * tierSize;
    const tierStart = tierEnd - tierSize;
    const currentTier = hintPool.slice(tierStart, tierEnd);

    // Take top N words from this tier to select from
    const selectionPool = currentTier.slice(0, randomSelectionSize);

    if (selectionPool.length === 0) {
      setError("No hints available in this tier!");
      return;
    }

    // Select random word from the pool
    const candidate =
      selectionPool[Math.floor(Math.random() * selectionPool.length)].word;

    setRemainingHints((prev) => prev - 1);
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
