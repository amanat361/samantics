// src/components/GameControls.tsx
import React from "react";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";
import { LightbulbIcon, ShuffleIcon, InfinityIcon } from "lucide-react";
import { handleShare } from "../utils/gameHelpers";

interface GameControlsProps {
  gameOver: boolean;
  revealed: boolean;
  remainingHints: number;
  dayNumber: number;
  guessesLength: number;
  startNewGame: () => void;
  guessRandomWord: () => void;
  consumeHint: (count: number, proximity: number) => void;
  setRevealed: (revealed: boolean) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameOver,
  revealed,
  remainingHints,
  dayNumber,
  guessesLength,
  startNewGame,
  guessRandomWord,
  consumeHint,
  setRevealed,
}) => {
  const onShareClick = () => {
    handleShare({
      guessesLength,
      dayNumber,
      remainingHints,
      revealed
    });
  };

  return (
    <div className="flex sm:space-x-2 items-center sm:flex-row flex-col w-full max-sm:space-y-2">
      <button
        onClick={startNewGame}
        className="w-full px-2 py-1.5 bg-primary text-white rounded hover:bg-primary/80 transition flex items-center justify-center gap-2"
      >
        <span className="max-sm:mr-2.5">Change Word</span>
        <InfinityIcon className="w-4 h-4" />
      </button>
      {gameOver && (
        <button
          onClick={onShareClick}
          className="w-full px-2 py-1.5 bg-share text-white rounded hover:bg-share/80 transition flex items-center justify-center gap-2"
        >
          <span className="max-sm:mr-2.5">Share Results</span>
          <ShareIcon className="w-4 h-4" />
        </button>
      )}
      {!revealed && !gameOver && (
        <>
          {remainingHints > 0 ? (
            <button
              onClick={() => consumeHint(20, 3)}
              className="w-full px-2 py-1.5 bg-hint text-white rounded hover:bg-hint/80 transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-0">
                Use Hint: <strong>{remainingHints} left</strong>
              </span>
              <LightbulbIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="w-full px-2 py-1.5 bg-hint text-white rounded hover:bg-hint/80 transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-2.5">Show Answer</span>
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={guessRandomWord}
            className="w-full px-2 py-1.5 bg-share text-white rounded hover:bg-share/80 transition flex items-center justify-center gap-2"
          >
            <span>Random Guess</span>
            <ShuffleIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default GameControls;