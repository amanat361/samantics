// src/hooks/useHintSystem.ts
import { API_URL } from "../config";

// Re-export the configuration from the main game file
export const TOTAL_HINTS = 10;

interface Guess {
  word: string;
  similarity: number;
  isHint?: boolean;
}

interface HintAvailability {
  available: boolean;
  message: string;
  nextThreshold: number | null;
  guessesUntilNextHint: number;
}

// Number of guesses required to unlock each hint
// First hint (index 0) is available immediately (threshold 0)
// Remaining hints unlock every 5 guesses
const HINT_UNLOCK_THRESHOLDS = [
  0, // First hint available immediately
  ...Array.from(
    { length: TOTAL_HINTS - 1 },
    (_, i) => (i + 1) * 5
  )
];

/**
 * Check if a hint is available based on guess count
 * Returns an object with availability status and message if not available
 */
export function getHintAvailability(
  guesses: Guess[],
  remainingHints: number
): HintAvailability {
  // Calculate how many hints should be unlocked based on user guess count (excluding hints)
  const userGuessCount = guesses.filter((guess) => !guess.isHint).length;
  const unlockedHintCount = HINT_UNLOCK_THRESHOLDS.filter(
    (threshold) => userGuessCount >= threshold
  ).length;

  // Calculate how many hints have been used
  const usedHintCount = TOTAL_HINTS - remainingHints;

  // Check if all available hints are used
  if (usedHintCount >= unlockedHintCount) {
    const nextThreshold = HINT_UNLOCK_THRESHOLDS[unlockedHintCount];
    const guessesNeeded = nextThreshold - userGuessCount;
    return {
      available: false,
      message: `Unlock hint in ${guessesNeeded} guesses.`,
      nextThreshold,
      guessesUntilNextHint: guessesNeeded,
    };
  }

  return {
    available: remainingHints > 0,
    message: remainingHints <= 0 ? "No hints remaining." : "",
    nextThreshold: null,
    guessesUntilNextHint: 0,
  };
}

/**
 * Filter invalid words for hints
 */
function filterHintCandidates(
  word: string,
  targetWord: string,
  guessedWords: Set<string>
): boolean {
  // Don't use target word or already guessed words
  if (word === targetWord || guessedWords.has(word)) {
    return false;
  }

  // Filter out simple word variations
  if (
    // Plurals
    word === targetWord + "s" ||
    word === targetWord + "es" ||
    // Past tense
    word === targetWord + "ed" ||
    word === targetWord + "d" ||
    // Progressive
    word === targetWord + "ing" ||
    // Check if target word ends with 'e' and the word is target word without 'e' + 'ing'
    (targetWord.endsWith("e") && word === targetWord.slice(0, -1) + "ing") ||
    // Comparative/superlative
    word === targetWord + "er" ||
    word === targetWord + "est" ||
    // Adverb form
    word === targetWord + "ly"
  ) {
    return false;
  }

  return true;
}

/**
 * Find a suitable hint based on current game progress
 */
export async function findHintWord(
  targetWord: string,
  similarWords: Guess[],
  guesses: Guess[]
): Promise<string | null> {
  const guessedWords = new Set(guesses.map((g) => g.word));

  // Get the current best similarity score
  const bestGuess = [...guesses].sort((a, b) => b.similarity - a.similarity)[0];
  const bestSimilarity = bestGuess ? bestGuess.similarity : 0;

  // Filter available words
  const availableWords = similarWords.filter((item) => {
    const word = typeof item === "object" ? item.word : item;
    return filterHintCandidates(word, targetWord, guessedWords);
  });

  if (availableWords.length === 0) {
    return null;
  }

  // Sort by similarity (ensure all words have similarity scores)
  const sortedWords = [...availableWords]
    .map((item) => {
      if (typeof item === "object" && "similarity" in item) {
        return item;
      } else {
        // If no similarity score, we'll need to get it from the API
        return { word: item, similarity: 0 };
      }
    })
    .sort((a, b) => b.similarity - a.similarity);

  // Find natural thresholds - where there's a significant gap in similarity scores
  let significantThreshold = 0;
  for (let i = 1; i < sortedWords.length; i++) {
    const delta = sortedWords[i - 1].similarity - sortedWords[i].similarity;
    if (delta > 0.02) {
      significantThreshold = sortedWords[i - 1].similarity;
      break;
    }
  }

  // Default threshold if no significant gaps found
  if (significantThreshold === 0 && sortedWords.length > 0) {
    significantThreshold = Math.max(0.7, bestSimilarity + 0.1);
  }

  // Find words above the threshold and better than current best guess
  let candidateWords = sortedWords.filter(
    (word) =>
      word.similarity > Math.max(significantThreshold, bestSimilarity + 0.05)
  );

  // If no good candidates found, use the top 3 available
  if (candidateWords.length === 0) {
    candidateWords = sortedWords.slice(0, Math.min(3, sortedWords.length));
  }

  // Add some randomness to hint selection
  const randomIndex = Math.floor(
    Math.random() * Math.min(3, candidateWords.length)
  );
  return candidateWords[randomIndex].word;
}

/**
 * Consume a hint and make a guess
 */
export async function consumeHint(
  targetWord: string,
  similarWords: Guess[],
  guesses: Guess[],
  remainingHints: number,
  setError: (error: string) => void,
  setRemainingHints: (updater: (prev: number) => number) => void,
  setGuesses: (updater: (prev: Guess[]) => Guess[]) => void,
  setGameOver: (gameOver: boolean) => void
): Promise<void> {
  // Check hint availability
  const hintAvailability = getHintAvailability(guesses, remainingHints);
  if (!hintAvailability.available) {
    setError(hintAvailability.message);
    return;
  }

  // Find a suitable hint word
  const hintWord = await findHintWord(targetWord, similarWords, guesses);

  if (!hintWord) {
    setError("No suitable hint found.");
    return;
  }

  // Consume a hint
  setRemainingHints((prev) => prev - 1);

  // Make the guess
  try {
    const res = await fetch(`${API_URL}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: hintWord, target: targetWord }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to make guess");
    }

    const newGuess = {
      word: hintWord,
      similarity: data.similarity,
      isHint: true,
    };
    setGuesses((prev) => [...prev, newGuess]);

    if (data.similarity > 0.99) {
      setGameOver(true);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    setError(errorMessage);
  }
}
