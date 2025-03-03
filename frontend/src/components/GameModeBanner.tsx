// src/components/GameModeBanner.tsx
import React from "react";
import { CalendarIcon, InfinityIcon } from "lucide-react";

interface GameModeBannerProps {
  dayNumber: number;
}

const GameModeBanner: React.FC<GameModeBannerProps> = ({ dayNumber }) => {
  const isDaily = dayNumber > 0;
  
  return (
    <div className={`w-full py-3 px-4 mb-6 rounded-base flex items-center justify-center gap-3 ${isDaily ? 'bg-[#FBE7C6]' : 'bg-[#B4F8C8]'} border-2 border-border shadow-shadow text-mtext`} style={{ fontFamily: 'Londrina Solid, sans-serif' }}>
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
          <div className="font-bold text-center text-lg">
            PRACTICE MODE
          </div>
        </>
      )}
    </div>
  );
};

export default GameModeBanner;