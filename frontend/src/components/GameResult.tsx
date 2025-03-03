import React, { useState, useEffect } from "react";
import { ListRestart, Trophy, BarChart2 } from "lucide-react";
import { getEmoji, handleShare } from "../utils/gameHelpers";
import { GameStats } from "../types/stats";
import { TOTAL_HINTS } from "../hooks/useSamanticsGame";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

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
      remainingHints: TOTAL_HINTS - hintsUsed,
      revealed,
    });
  };

  return (
    <Card className="bg-[#FFB6C1] p-2 sm:p-6 overflow-hidden">
      {/* Main content with celebration theme */}
      <div className="space-y-4">
        {/* Header with dynamic celebration message */}
        <CardHeader className="text-center p-0 sm:p-2">
          {isWin ? (
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-mtext">
                You got it! <span className="text-3xl">{emoji}</span>
              </CardTitle>
              <p className="text-mtext font-medium">
                {guessCount === 1
                  ? "Incredible! First try!"
                  : guessCount <= 3
                  ? "Amazing job!"
                  : "Well done!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-mtext">Game Over</CardTitle>
              <p className="text-mtext">Better luck next time!</p>
            </div>
          )}
        </CardHeader>

        {/* Word reveal with neobrutalist style */}
        <div className="bg-bw rounded-base p-4 border-2 border-border shadow-shadow relative mb-6">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#71BBFF] text-mtext text-xs font-bold px-4 py-1 rounded-base border-2 border-border">
            The Answer
          </div>
          <div className="flex justify-center items-center h-16 pt-2">
            {targetWord.split("").map((letter, index) => (
              <div
                key={index}
                className="w-10 h-10 mx-1 bg-[#71BBFF] text-mtext rounded-base flex items-center justify-center text-xl font-bold uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Stats cards in horizontal layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Guesses card */}
          <div className="bg-[#A0E7E5] rounded-base p-4 border-2 border-border shadow-shadow flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-base bg-bw text-mtext flex items-center justify-center text-2xl font-bold mb-3 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {guessCount}
            </div>
            <div className="text-center">
              <div className="text-sm text-mtext font-bold uppercase tracking-wider">
                Guesses
              </div>
            </div>
          </div>

          {/* Hints card */}
          <div className="bg-[#FFAEBC] rounded-base p-4 border-2 border-border shadow-shadow flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-base bg-bw text-mtext flex items-center justify-center text-2xl font-bold mb-3 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {hintsUsed}
            </div>
            <div className="text-center">
              <div className="text-sm text-mtext font-bold uppercase tracking-wider">
                Hints Used
              </div>
            </div>
          </div>
        </div>

        {/* Player stats with neobrutalist style */}
        <div className="bg-[#B4F8C8] rounded-base p-5 border-2 border-border shadow-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-mtext font-bold">
              <BarChart2 className="w-5 h-5 mr-2" />
              <span className="text-lg">Your Stats</span>
            </div>
            {isDaily && isWin && stats.currentStreak > 0 && (
              <div className="flex items-center text-mtext font-bold bg-[#FBE7C6] px-3 py-1 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Trophy className="w-4 h-4 mr-2" />
                <span>{stats.currentStreak} day streak!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-bw rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-3xl font-bold text-mtext">
                {stats.gamesPlayed}
              </span>
              <span className="text-xs text-mtext font-bold uppercase tracking-wider mt-1">
                Games
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-bw rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-3xl font-bold text-mtext">
                {winPercentage}%
              </span>
              <span className="text-xs text-mtext font-bold uppercase tracking-wider mt-1">
                Win %
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-bw rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-3xl font-bold text-mtext">
                {stats.currentStreak < Infinity
                  ? stats.currentStreak
                  : "-"}
              </span>
              <span className="text-xs text-mtext font-bold uppercase tracking-wider mt-1">
                Streak
              </span>
            </div>
          </div>
        </div>

        {/* Warning card for revealed answers */}
        {revealed && (
          <div className="bg-[#FBE7C6] rounded-base p-4 border-2 border-border shadow-shadow flex items-center">
            <div className="text-mtext text-sm font-bold">
              <span className="font-extrabold">Hint:</span> Next time try to solve
              without revealing!
            </div>
          </div>
        )}

        {/* Action buttons with neobrutalist styling */}
        <CardFooter className="flex gap-3 pt-2 px-0">
          <Button
            onClick={startPracticeGame}
            className="flex-1 bg-[#B4F8C8] text-mtext"
            variant="default"
          >
            <ListRestart className="w-5 h-5 mr-1" />
            Play Again
          </Button>
          
          <Button
            onClick={handleShareClick}
            className="flex-1 bg-[#A0E7E5] text-mtext animate-bounce"
            variant="default"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share Results
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default GameResult;
