// src/components/GameControls.tsx
import React from "react";
import {
  LightbulbIcon,
  ShuffleIcon,
  InfinityIcon,
  CalendarIcon,
  LockIcon,
} from "lucide-react";
import { Button } from "./ui/button";

interface GameControlsProps {
  gameOver: boolean;
  revealed: boolean;
  remainingHints: number;
  dayNumber: number;
  guessesLength: number;
  startPracticeGame: () => void;
  loadDailyGame: () => void;
  guessRandomWord: () => void;
  consumeHint: () => void;
  isLoading?: boolean;
  getHintAvailability: () => {
    available: boolean;
    message: string;
    nextThreshold: number | null;
    guessesUntilNextHint: number;
  };
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
  isLoading = false,
  getHintAvailability,
  setRevealed,
}) => {
  return gameOver ? null : (
    <div className="flex sm:space-x-2 items-center sm:flex-row flex-col w-full max-sm:space-y-2">
      {/* Don't show the control buttons when game is over, as they're now in the GameResult component */}
      <>
        {dayNumber > 0 ? (
          <Button
            onClick={startPracticeGame}
            className="w-full"
            >
              <span className="max-sm:mr-2">Practice Mode</span>
              <InfinityIcon className="w-4 h-4" />
            </Button>
        ) : (
          <Button
            onClick={loadDailyGame}
            variant="default"
            className="w-full"
          >
            <span className="max-sm:mr-0">Daily Challenge</span>
            <CalendarIcon className="w-4 h-4" />
          </Button>
        )}

        {!revealed && (
          <>
            {/* Use the hint availability helper function */}
            {(() => {
              const hintStatus = getHintAvailability();

              // If hint is available
              if (hintStatus.available) {
                return (
                  <Button
                    onClick={() => consumeHint()}
                    variant="default"
                    className="w-full"
                  >
                    <span className="max-sm:mr-0">
                      Use Hint: <strong>{remainingHints} left</strong>
                    </span>
                    <LightbulbIcon className="w-4 h-4" />
                  </Button>
                );
              } else if (remainingHints > 0) {
                // Hints remaining but locked until more guesses
                return (
                  <Button 
                    disabled
                    variant="neutral"
                    className="w-full"
                  >
                    <span className="max-sm:mr-0">
                      {hintStatus.guessesUntilNextHint} more {hintStatus.guessesUntilNextHint > 1 ? 'tries' : 'try'}
                    </span>
                    <LockIcon className="w-4 h-4" />
                  </Button>
                );
              } else {
                // No hints left
                return (
                  <Button
                    onClick={() => setRevealed(true)}
                    variant="neutral"
                    className="w-full"
                  >
                    <span className="max-sm:mr-2.5">Give Up</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </Button>
                );
              }
            })()}
            <Button
              onClick={guessRandomWord}
              className="w-full"
            >
              <span>Random Guess</span>
              <ShuffleIcon className="w-4 h-4" />
            </Button>
          </>
        )}
      </>
    </div>
  );
};

export default GameControls;
