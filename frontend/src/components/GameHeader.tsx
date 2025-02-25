// src/components/GameHeader.tsx
import React from "react";

interface GameHeaderProps {
  dayNumber: number;
}

const GameHeader: React.FC<GameHeaderProps> = () => {
  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm border-b-2 border-[#78290f]">
      <h1 className="text-xl font-bold text-center text-[#001524]">
        <span className="text-[#78290f]">Samantics</span> - Test your vocabulary
      </h1>
    </div>
  );
};

export default GameHeader;