import React, { useState, useEffect } from "react";
import { ListRestart, Trophy, BarChart2 } from "lucide-react";
import { getEmoji, handleShare } from "../utils/gameHelpers";
import { GameStats } from "../types/stats";

interface GameResultProps {
  guessCount: number;
  hintsUsed: number;
  targetWord: string;
  revealed: boolean;
  dayNumber?: number;
  startPracticeGame: () => void;
  loadDailyGame: () => void;
  stats: GameStats;
}

const GameResult: React.FC<GameResultProps> = ({
  guessCount,
  hintsUsed,
  targetWord,
  revealed,
  dayNumber = 0,
  startPracticeGame,
  stats,
}) => {
  const [showConfetti, setShowConfetti] = useState(!revealed);
  const emoji = getEmoji(guessCount);
  const isDaily = dayNumber > 0;
  const isWin = !revealed;
  const winPercentage =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleShareClick = () => {
    handleShare({
      guessesLength: guessCount,
      dayNumber: dayNumber,
      remainingHints: 5 - hintsUsed,
      revealed,
    });
  };

  return (
    <div className="bg-[#f7edde] rounded-lg p-2 sm:p-6 pt-6 shadow-lg border-2 border-[#d8c4a5] relative overflow-hidden">
      {/* Top decorative wave */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-[#d67c24]/20"></div>

      {/* Main content with celebration theme */}
      <div className="space-y-2">
        {/* Header with dynamic celebration message */}
        <div className="text-center mb-4">
          {isWin ? (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#78290f]">
                You got it! <span className="text-2xl">{emoji}</span>
              </h1>
              <p className="text-[#d67c24] font-medium">
                {guessCount === 1
                  ? "Incredible! First try!"
                  : guessCount <= 3
                  ? "Amazing job!"
                  : "Well done!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#78290f]">Game Over</h1>
              <p className="text-[#d67c24]">Better luck next time!</p>
            </div>
          )}
        </div>

        {/* Word reveal with spotlight effect */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-[#d8c4a5] relative mb-2">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#d67c24] text-white text-xs font-bold px-3 py-1 rounded-full">
            The Answer
          </div>
          <div className="flex justify-center items-center h-16">
            {targetWord.split("").map((letter, index) => (
              <div
                key={index}
                className="w-10 h-10 mx-1 bg-[#15616d] text-white rounded-md flex items-center justify-center text-xl font-bold uppercase shadow-md"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Stats cards in horizontal layout */}
        <div className="grid grid-cols-2 gap-2">
          {/* Guesses card */}
          <div className="bg-white rounded-lg p-4 border border-[#d8c4a5] shadow-md flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#78290f] text-white flex items-center justify-center text-2xl font-bold mb-2">
              {guessCount}
            </div>
            <div className="text-center">
              <div className="text-xs text-[#78290f] font-medium uppercase tracking-wider">
                Guesses
              </div>
            </div>
          </div>

          {/* Hints card */}
          <div className="bg-white rounded-lg p-4 border border-[#d8c4a5] shadow-md flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#15616d] text-white flex items-center justify-center text-2xl font-bold mb-2">
              {hintsUsed}
            </div>
            <div className="text-center">
              <div className="text-xs text-[#15616d] font-medium uppercase tracking-wider">
                Hints Used
              </div>
            </div>
          </div>
        </div>

        {/* Player stats with improved visual hierarchy */}
        <div className="bg-white rounded-lg p-4 border border-[#d8c4a5] shadow-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-[#d67c24] font-bold">
              <BarChart2 className="w-4 h-4 mr-2" />
              <span>Your Stats</span>
            </div>
            {isDaily && isWin && stats.currentStreak > 0 && (
              <div className="flex items-center text-[#0eab82] font-bold">
                <Trophy className="w-4 h-4 mr-1" />
                <span>{stats.currentStreak} day streak!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-[#f7edde]/50 rounded">
              <span className="text-3xl font-bold text-[#001524]">
                {stats.gamesPlayed}
              </span>
              <span className="text-xs text-[#666] uppercase tracking-wider">
                Games
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#f7edde]/50 rounded">
              <span className="text-3xl font-bold text-[#001524]">
                {winPercentage}%
              </span>
              <span className="text-xs text-[#666] uppercase tracking-wider">
                Win %
              </span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#f7edde]/50 rounded">
              <span className="text-3xl font-bold text-[#001524]">
                {stats.currentStreak < Infinity ? `${stats.currentStreak} day${stats.currentStreak > 1 ? 's' : ''}` : '-'}
              </span>
              <span className="text-xs text-[#666] uppercase tracking-wider">
                Streak
              </span>
            </div>
          </div>
        </div>

        {/* Warning card for revealed answers */}
        {revealed && (
          <div className="bg-[#ffd485]/50 rounded-lg p-3 border-l-4 border-[#d67c24] flex items-center">
            <div className="text-[#78290f] text-sm">
              <span className="font-bold">Hint:</span> Next time try to solve
              without revealing!
            </div>
          </div>
        )}

        {/* Action buttons with improved styling */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleShareClick}
            className="flex-1 bg-[#d67c24] hover:bg-[#b56516] text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share Results
          </button>

          <button
            onClick={startPracticeGame}
            className="flex-1 bg-[#0eab82] hover:bg-[#0a8d6c] text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-md"
          >
            <ListRestart className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;
