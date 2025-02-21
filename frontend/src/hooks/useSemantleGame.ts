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
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [error, setError] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);

  /**
   * Load target words on mount
   */
  useEffect(() => {
    async function loadDailyWord() {
      try {
        const res = await fetch(`${API_URL}/daily`);
        if (!res.ok) throw new Error("Failed to load daily word");
        const data = await res.json();
        setTargetWord(data.targetWord);
        setDayNumber(data.dayNumber);
      } catch (err: any) {
        setError(err.message);
      }
    }
    async function loadTargetWords() {
      try {
        const res = await fetch(`${API_URL}/target-words`);
        if (!res.ok) throw new Error("Failed to load target words");
        const data = await res.json();
        setTargetWords(data.targetWords || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadDailyWord();
    loadTargetWords();
  }, []);

  /**
   * Start a new game by fetching a random target word
   */
  async function startNewGame() {
    setError("");
    setGuesses([]);
    setGameOver(false);
    setRevealed(false);

    try {
      const res = await fetch(`${API_URL}/target`);
      if (!res.ok) throw new Error("Failed to load target word");
      const data = await res.json();
      setTargetWord(data.targetWord);
      setDayNumber(0);
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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

  return {
    dayNumber,
    targetWord,
    guesses,
    error,
    gameOver,
    revealed,
    startNewGame,
    guessWord,
    guessRandomWord,
    setRevealed,
  };
}
