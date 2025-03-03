// src/hooks/useSamanticsGame.ts
import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useLocalStorage } from "./useLocalStorage";
import { GameStats, DEFAULT_STATS, GameRecord } from "../types/stats";
import {
  TOTAL_HINTS,
  getHintAvailability,
  consumeHint as processHint,
} from "./useHintSystem";

// Game configuration
export { TOTAL_HINTS } from "./useHintSystem";

interface Guess {
  word: string;
  similarity: number;
  isHint?: boolean;
}

export default function useSamanticsGame() {
  const [dayNumber, setDayNumber] = useState(-1);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [targetWord, setTargetWord] = useState("");
  const [similarWords, setSimilarWords] = useState<Guess[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [error, setError] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useLocalStorage<GameStats>(
    "samantics-stats",
    DEFAULT_STATS
  );

  // Custom setter function to auto-guess the word when revealed
  const handleReveal = (value: boolean) => {
    setRevealed(value);
    if (value && targetWord && !gameOver) {
      const newGuess = { word: targetWord, similarity: 1.0 };
      setGuesses((prev) => [...prev, newGuess]);
      setGameOver(true);
    }
  };
  const [remainingHints, setRemainingHints] = useState(TOTAL_HINTS);

  // Update stats when game is won
  useEffect(() => {
    if (
      gameOver &&
      guesses.length > 0 &&
      guesses[guesses.length - 1].similarity > 0.99
    ) {
      const isWin = !revealed; // Only count as win if answer wasn't revealed
      const isDaily = dayNumber > 0;
      const hintsUsed = TOTAL_HINTS - remainingHints;

      updateGameStats(isWin, isDaily, guesses.length, hintsUsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, guesses, dayNumber, remainingHints, revealed]);

  // Function to update game statistics
  const updateGameStats = (
    won: boolean,
    isDaily: boolean,
    guessCount: number,
    hintsUsed: number
  ) => {
    setStats((prevStats) => {
      const now = Date.now();
      const today = Math.floor(now / (1000 * 60 * 60 * 24)); // Days since epoch

      // Create a new game record
      const newRecord: GameRecord = {
        dayNumber: dayNumber,
        timestamp: now,
        guesses: guessCount,
        hintsUsed: hintsUsed,
        revealed: revealed,
        won: won,
        isDaily: isDaily,
      };

      // Calculate new streak (only for daily games)
      let newStreak = prevStats.currentStreak;
      let newMaxStreak = prevStats.maxStreak;

      if (isDaily) {
        if (
          won &&
          (prevStats.lastCompletedDay === today - 1 ||
            prevStats.lastCompletedDay === 0)
        ) {
          newStreak = prevStats.currentStreak + 1;
          if (newStreak > newMaxStreak) {
            newMaxStreak = newStreak;
          }
        } else if (!won) {
          newStreak = 0;
        }
      }

      // Calculate new average guesses (only for wins)
      let totalGuesses = prevStats.averageGuesses * prevStats.gamesWon;
      let newWins = prevStats.gamesWon;

      if (won) {
        totalGuesses += guessCount;
        newWins += 1;
      }

      const newAvgGuesses = newWins > 0 ? totalGuesses / newWins : 0;

      // Calculate new best score
      const newBestScore = won
        ? Math.min(prevStats.bestScore, guessCount)
        : prevStats.bestScore;

      return {
        gamesPlayed: prevStats.gamesPlayed + 1,
        gamesWon: won ? prevStats.gamesWon + 1 : prevStats.gamesWon,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        bestScore: newBestScore,
        averageGuesses: newAvgGuesses,
        lastCompletedDay: isDaily && won ? today : prevStats.lastCompletedDay,
        lastCompletedTime: now,
        history: [...prevStats.history, newRecord].slice(-100), // Keep last 100 games only
      };
    });
  };

  /**
   * Load daily game data (target word, target words, similar words, and day number)
   */
  async function loadDailyGame() {
    setError("");
    setGuesses([]);
    setGameOver(false);
    handleReveal(false);
    
    // Start a loading timeout - only show loading state if request takes longer than 500ms
    const loadingTimer = setTimeout(() => {
      setIsLoading(true);
    }, 500);

    try {
      const res = await fetch(`${API_URL}/daily-game`);
      if (!res.ok) throw new Error("Failed to load daily game");
      const data = await res.json();
      setTargetWord(data.targetWord);
      setTargetWords(data.targetWords || []);
      setSimilarWords(data.similarWords || []);
      setDayNumber(data.dayNumber);
      setRemainingHints(TOTAL_HINTS);
      
      // No longer auto-consuming hint since first hint is now unlocked by default
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      clearTimeout(loadingTimer);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDailyGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Start a practice game by fetching a random game
   */
  async function startPracticeGame() {
    setError("");
    setGuesses([]);
    setGameOver(false);
    handleReveal(false);
    
    // Start a loading timeout - only show loading state if request takes longer than 500ms
    const loadingTimer = setTimeout(() => {
      setIsLoading(true);
    }, 500);

    try {
      const res = await fetch(`${API_URL}/random-game`);
      if (!res.ok) throw new Error("Failed to load random game");
      const data = await res.json();
      setTargetWord(data.targetWord);
      setTargetWords(data.targetWords || []);
      setSimilarWords(data.similarWords || []);
      setDayNumber(0);
      setRemainingHints(TOTAL_HINTS);
      
      // No longer auto-consuming hint since first hint is now unlocked by default
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      clearTimeout(loadingTimer);
      setIsLoading(false);
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

    // Start a loading timeout - only show loading state if request takes longer than 500ms
    const loadingTimer = setTimeout(() => {
      setIsLoading(true);
    }, 500);
    
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

      const newGuess = { word, similarity: data.similarity, isHint: false };
      setGuesses((prev) => [...prev, newGuess]);

      if (data.similarity > 0.99) {
        setGameOver(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      clearTimeout(loadingTimer);
      setIsLoading(false);
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
   * Consume a hint using the hint system
   */
  async function consumeHint() {
    setError("");
    if (!targetWord) {
      setError("No game in progress.");
      return;
    }

    if (gameOver) {
      setError("Game is already over. Start a new game!");
      return;
    }

    // Start a loading timeout - only show loading state if request takes longer than 500ms
    const loadingTimer = setTimeout(() => {
      setIsLoading(true);
    }, 500);
    
    try {
      await processHint(
        targetWord,
        similarWords,
        guesses,
        remainingHints,
        setError,
        setRemainingHints,
        setGuesses,
        setGameOver
      );
    } finally {
      clearTimeout(loadingTimer);
      setIsLoading(false);
    }
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
    stats,
    isLoading,
    startPracticeGame,
    loadDailyGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    getHintAvailability: () => getHintAvailability(guesses, remainingHints),
    setRevealed: handleReveal,
    setError,
  };
}
