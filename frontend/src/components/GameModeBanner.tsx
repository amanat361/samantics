// src/components/GameModeBanner.tsx
import React from "react";
import { CalendarIcon, InfinityIcon } from "lucide-react";

interface GameModeBannerProps {
  dayNumber: number;
}

const GameModeBanner: React.FC<GameModeBannerProps> = ({ dayNumber }) => {
  const isDaily = dayNumber > 0;
  
  return (
    <div
      className={`w-full py-3 px-4 mb-6 rounded-base flex items-center justify-center gap-3 ${
        isDaily ? "bg-[#0c58af]" : "bg-[#17889c]"
      } border-2 border-border shadow-shadow text-white`}
      style={{ fontFamily: "Londrina Solid, sans-serif" }}
    >
      {isDaily ? (
        <>
          <CalendarIcon className="w-6 h-6" />
          <div className="font-bold text-center text-lg">
            DAILY CHALLENGE: DAY #{dayNumber}
          </div>
        </>
      ) : (
        <>
          <InfinityIcon className="w-6 h-6" />
          <div className="font-bold text-center text-lg">PRACTICE MODE</div>
        </>
      )}
    </div>
  );
};

export default GameModeBanner;