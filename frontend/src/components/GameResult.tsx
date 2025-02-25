// src/components/GameResult.tsx
import React from "react";
import { getEmoji, handleShare } from "../utils/gameHelpers";
import { ListRestartIcon } from "lucide-react";

interface GameResultProps {
  guessCount: number;
  hintsUsed: number;
  targetWord: string;
  revealed: boolean;
  dayNumber?: number;
  startPracticeGame: () => void;
  loadDailyGame: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  guessCount,
  hintsUsed,
  targetWord,
  revealed,
  dayNumber = 0,
  startPracticeGame,
}) => {
  const emoji = getEmoji(guessCount);

  const handleShareClick = () => {
    handleShare({
      guessesLength: guessCount,
      dayNumber: dayNumber,
      remainingHints: 5 - hintsUsed,
      revealed,
    });
  };

  return (
    <div className="bg-[#f7edde] rounded-lg p-4 shadow-md border border-[#d8c4a5]">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#78290f]">
            Congratulations! 🎉
          </h2>
          <span className="text-2xl">{emoji}</span>
        </div>

        <div className="space-y-2">
          <div className="bg-white/70 rounded p-2 flex items-center border border-[#d8c4a5]/50">
            <div className="w-9 h-9 bg-[#78290f] text-white rounded-full flex items-center justify-center mr-3">
              <span className="text-base font-bold">{guessCount}</span>
            </div>
            <div>
              <div className="text-xs text-[#78290f] font-medium">
                Total Guesses
              </div>
              <div className="text-sm font-medium text-[#001524]">
                {guessCount === 1
                  ? "First try!"
                  : `Found in ${guessCount} guesses`}
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded p-2 flex items-center border border-[#d8c4a5]/50">
            <div className="w-9 h-9 bg-[#15616d] text-white rounded-full flex items-center justify-center mr-3">
              <span className="text-base font-bold">{hintsUsed}</span>
            </div>
            <div>
              <div className="text-xs text-[#15616d] font-medium">
                Hints Used
              </div>
              <div className="text-sm font-medium text-[#001524]">
                {hintsUsed === 0
                  ? "No hints needed!"
                  : hintsUsed === 5
                  ? "All hints used"
                  : `${hintsUsed} hint${hintsUsed !== 1 ? "s" : ""} used`}
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded p-2 border border-[#d8c4a5]/50">
            <div className="text-xs text-[#d67c24] font-medium">The Answer</div>
            <div className="text-base font-bold text-[#001524]">
              {targetWord}
            </div>
          </div>

          {revealed && (
            <div className="bg-[#ffd485]/50 rounded p-2 border-l-4 border-[#d67c24]">
              <div className="text-xs text-[#78290f] font-medium">
                Revealed Answer
              </div>
              <div className="text-sm text-[#001524]">
                You revealed the answer before solving it... 👀
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleShareClick}
            className="flex-1 bg-[#d67c24] hover:bg-[#b56516] text-white py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1.5 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share Results
          </button>

          <button
            onClick={startPracticeGame}
            className="flex-1 bg-[#0eab82] hover:bg-[#0a8d6c] text-white py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1.5 text-sm"
          >
            <ListRestartIcon className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;
