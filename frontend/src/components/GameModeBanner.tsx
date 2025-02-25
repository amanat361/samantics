// src/components/GameModeBanner.tsx
import React from "react";
import { CalendarIcon, InfinityIcon } from "lucide-react";

interface GameModeBannerProps {
  dayNumber: number;
}

const GameModeBanner: React.FC<GameModeBannerProps> = ({ dayNumber }) => {
  const isDaily = dayNumber > 0;
  
  return (
    <div className={`w-full py-2 px-3 mb-3 rounded flex items-center justify-center gap-2 bg-[#78290f]/10 border-2 border-[#78290f] text-[#78290f]`}>
      {isDaily ? (
        <>
          <CalendarIcon className="w-5 h-5" />
          <div className="font-bold text-center">
            DAILY CHALLENGE: Day #{dayNumber}
          </div>
        </>
      ) : (
        <>
          <InfinityIcon className="w-5 h-5" />
          <div className="font-bold text-center">
            PRACTICE MODE
          </div>
        </>
      )}
    </div>
  );
};

export default GameModeBanner;