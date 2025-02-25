// src/components/GameHeader.tsx
import React from "react";

interface GameHeaderProps {
  dayNumber: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ dayNumber }) => {
  return (
    <div className="w-full bg-[#78290f] rounded-lg shadow-md p-2 space-y-4">
      <p className="text-lg text-center text-white">
        {dayNumber > 0 ? (
          <span>
            You're guessing the word for <strong>Day #{dayNumber}!</strong>
          </span>
        ) : dayNumber === 0 ? (
          <span>
            You're guessing a <strong>random</strong> word!
          </span>
        ) : (
          <span>Loading...</span>
        )}
      </p>
    </div>
  );
};

export default GameHeader;