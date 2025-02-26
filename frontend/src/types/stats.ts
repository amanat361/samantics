// src/types/stats.ts

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  bestScore: number; // Lowest number of guesses (lower is better)
  averageGuesses: number;
  lastCompletedDay: number; // To track daily streak
  lastCompletedTime: number; // Timestamp of last completed game
  history: GameRecord[];
}

export interface GameRecord {
  dayNumber: number;
  timestamp: number;
  guesses: number;
  hintsUsed: number;
  revealed: boolean;
  won: boolean;
  isDaily: boolean;
}

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestScore: Infinity,
  averageGuesses: 0,
  lastCompletedDay: 0,
  lastCompletedTime: 0,
  history: []
};