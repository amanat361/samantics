// src/hooks/useSamanticsGame.ts
import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useLocalStorage } from "./useLocalStorage";
import { GameStats, DEFAULT_STATS, GameRecord } from "../types/stats";

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
  const [stats, setStats] = useLocalStorage<GameStats>("samantics-stats", DEFAULT_STATS);
  
  // Custom setter function to auto-guess the word when revealed
  const handleReveal = (value: boolean) => {
    setRevealed(value);
    if (value && targetWord && !gameOver) {
      const newGuess = { word: targetWord, similarity: 1.0 };
      setGuesses((prev) => [...prev, newGuess]);
      setGameOver(true);
    }
  };
  const [remainingHints, setRemainingHints] = useState(5);
  // Number of guesses required to unlock each hint
  const HINT_UNLOCK_THRESHOLDS = [5, 10, 15, 20, 25];

  // Update stats when game is won
  useEffect(() => {
    if (gameOver && guesses.length > 0 && guesses[guesses.length - 1].similarity > 0.99) {
      const isWin = !revealed; // Only count as win if answer wasn't revealed
      const isDaily = dayNumber > 0;
      const hintsUsed = 5 - remainingHints;
      
      updateGameStats(isWin, isDaily, guesses.length, hintsUsed);
    }
  }, [gameOver, guesses, dayNumber, remainingHints, revealed]);

  // Function to update game statistics
  const updateGameStats = (
    won: boolean, 
    isDaily: boolean, 
    guessCount: number, 
    hintsUsed: number
  ) => {
    setStats(prevStats => {
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
        isDaily: isDaily
      };
      
      // Calculate new streak (only for daily games)
      let newStreak = prevStats.currentStreak;
      let newMaxStreak = prevStats.maxStreak;
      
      if (isDaily) {
        if (won && (prevStats.lastCompletedDay === today - 1 || prevStats.lastCompletedDay === 0)) {
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
      const newBestScore = won ? 
        Math.min(prevStats.bestScore, guessCount) : 
        prevStats.bestScore;
      
      return {
        gamesPlayed: prevStats.gamesPlayed + 1,
        gamesWon: won ? prevStats.gamesWon + 1 : prevStats.gamesWon,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        bestScore: newBestScore,
        averageGuesses: newAvgGuesses,
        lastCompletedDay: isDaily && won ? today : prevStats.lastCompletedDay,
        lastCompletedTime: now,
        history: [...prevStats.history, newRecord].slice(-100) // Keep last 100 games only
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

      const newGuess = { word, similarity: data.similarity, isHint: false };
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
    
    // Check if hint is available based on guess count
    const hintAvailability = getHintAvailability();
    if (!hintAvailability.available) {
      setError(hintAvailability.message);
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
    
    // Mark this guess as a hint
    try {
      const res = await fetch(`${API_URL}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: candidate, target: targetWord }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to make guess");
      }

      const newGuess = { word: candidate, similarity: data.similarity, isHint: true };
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
   * Check if a hint is available based on guess count
   * Returns an object with availability status and message if not available
   */
  function getHintAvailability() {
    // Calculate how many hints should be unlocked based on user guess count (excluding hints)
    const userGuessCount = guesses.filter(guess => !guess.isHint).length;
    const unlockedHintCount = HINT_UNLOCK_THRESHOLDS.filter(
      threshold => userGuessCount >= threshold
    ).length;
    
    // Calculate how many hints have been used
    const usedHintCount = 5 - remainingHints;
    
    // Check if all available hints are used
    if (usedHintCount >= unlockedHintCount) {
      const nextThreshold = HINT_UNLOCK_THRESHOLDS[unlockedHintCount];
      const userGuessCount = guesses.filter(guess => !guess.isHint).length;
      const guessesNeeded = nextThreshold - userGuessCount;
      return {
        available: false,
        message: `Unlock hint in ${guessesNeeded} guesses.`,
        nextThreshold,
        guessesUntilNextHint: guessesNeeded
      };
    }
    
    return { available: remainingHints > 0, message: "", nextThreshold: null, guessesUntilNextHint: 0 };
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
    startPracticeGame,
    loadDailyGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    getHintAvailability,
    setRevealed: handleReveal,
  };
}
