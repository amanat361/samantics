// src/components/GameControls.tsx
import React from "react";
import { LightbulbIcon, ShuffleIcon, InfinityIcon, CalendarIcon } from "lucide-react";

interface GameControlsProps {
  gameOver: boolean;
  revealed: boolean;
  remainingHints: number;
  dayNumber: number;
  guessesLength: number;
  startPracticeGame: () => void;
  loadDailyGame: () => void;
  guessRandomWord: () => void;
  consumeHint: (count: number, proximity: number) => void;
  setRevealed: (revealed: boolean) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameOver,
  revealed,
  remainingHints,
  dayNumber,
  startPracticeGame,
  loadDailyGame,
  guessRandomWord,
  consumeHint,
  setRevealed,
}) => {

  return (
    <div className="flex sm:space-x-2 items-center sm:flex-row flex-col w-full max-sm:space-y-2">
      {/* Don't show the control buttons when game is over, as they're now in the GameResult component */}
      {!gameOver && (
        <>
          {dayNumber > 0 ? (
            <button
              onClick={startPracticeGame}
              className="w-full px-2 py-1.5 bg-primary text-white rounded hover:bg-primary/80 transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-2">Practice Mode</span>
              <InfinityIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={loadDailyGame}
              className="w-full px-2 py-1.5 bg-primary text-white rounded hover:bg-primary/80 transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-0">Daily Challenge</span>
              <CalendarIcon className="w-4 h-4" />
            </button>
          )}

          {!revealed && (
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
                  <span className="max-sm:mr-2.5">Give Up</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
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
        </>
      )}
    </div>
  );
};

export default GameControls;