// src/components/GuessDisplay.tsx
import React from "react";
import GameResult from "./GameResult";
import { GameStats } from "../types/stats";
import { TOTAL_HINTS } from "../hooks/useSamanticsGame";

interface Guess {
  word: string;
  similarity: number;
  isHint?: boolean;
}

interface GuessDisplayProps {
  guesses: Guess[];
  revealed: boolean;
  gameOver: boolean;
  targetWord: string;
  remainingHints: number;
  dayNumber?: number;
  startPracticeGame: () => void;
  loadDailyGame: () => void;
  stats: GameStats;
  isLoading?: boolean;
}

const GuessDisplay: React.FC<GuessDisplayProps> = ({
  guesses,
  revealed,
  gameOver,
  targetWord,
  remainingHints,
  dayNumber = 0,
  startPracticeGame,
  loadDailyGame,
  stats,
  isLoading = false,
}) => {
  return (
    <>
      {gameOver && (
        <GameResult
          guessCount={guesses.length}
          hintsUsed={TOTAL_HINTS - remainingHints}
          targetWord={targetWord}
          revealed={revealed}
          dayNumber={dayNumber}
          startPracticeGame={startPracticeGame}
          loadDailyGame={loadDailyGame}
          stats={stats}
        />
      )}
      
      {/* Show loading guess UI when isLoading is true */}
      {isLoading && (
        <>
          <div className="space-y-2">
            <p className="text-text font-medium">
              <span>Processing...</span>
            </p>
            <div
              className="rounded-md text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden animate-in fade-in-0 duration-300"
              style={{
                backgroundColor: "#333", // Dark gray/almost black
              }}
            >
              {/* Main content row */}
              <div className="flex items-stretch">
                {/* Left section with number */}
                <div className="bg-black/40 p-2 flex items-center w-10 justify-center border-r-2 border-black">
                  <span className="font-bold text-sm">{guesses.length + 1}</span>
                </div>
                
                {/* Word section */}
                <div className="px-3 py-2 flex-grow flex items-center">
                  <div className="flex items-center">
                    <span className="font-medium text-sm sm:text-base break-all">
                      Processing...
                    </span>
                  </div>
                </div>
                
                {/* Right section with spinner */}
                <div className="bg-black/40 p-2 flex flex-col items-center justify-center border-l-2 border-black w-16">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="border-2 border-border my-6" />
        </>
      )}
      
      {guesses.length > 0 && !gameOver && (
        <>
          <div className="space-y-2">
            <p className="text-text font-medium">
              <span>Latest Guess:</span>
            </p>
            <div
              className="rounded-md text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              style={{
                backgroundColor: interpolateColor(
                  guesses[guesses.length - 1].similarity
                ),
              }}
            >
              {/* Main content row */}
              <div className="flex items-stretch">
                {/* Left section with number */}
                <div className="bg-black/25 p-2 flex items-center w-10 justify-center border-r-2 border-black">
                  <span className="font-bold text-sm">{guesses.length}</span>
                </div>
                
                {/* Word section */}
                <div className="px-3 py-2 flex-grow flex items-center">
                  <div className="flex items-center">
                    {guesses[guesses.length - 1].isHint && 
                      <span className="bg-black/25 p-1 rounded-sm mr-2 text-xs">
                        💡
                      </span>
                    }
                    <span className="font-medium text-md sm:text-base break-all">
                      {guesses[guesses.length - 1].word}
                    </span>
                  </div>
                </div>
                
                {/* Right section with percentage */}
                <div className="bg-black/25 p-2 flex flex-col items-center justify-center border-l-2 border-black">
                  <div className="text-center">
                    <div className="font-bold text-sm">
                      {(getWeight(guesses[guesses.length - 1].similarity) * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-white/80">
                      {(() => {
                        const weight = getWeight(guesses[guesses.length - 1].similarity);
                        const label = SIMILARITY_LABELS.find((l) => weight >= l.threshold) || SIMILARITY_LABELS[SIMILARITY_LABELS.length - 1];
                        // Extract just the text without any emoji
                        return label.text.replace(/[^\w\s!?]/g, '').trim().split('!')[0];
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="border-2 border-border my-6" />
        </>
      )}
      <GuessList guesses={guesses} />
    </>
  );
};

// Label constants for use in multiple places
const SIMILARITY_LABELS = [
  { threshold: 0.99, text: "Correct! 🎯🎯🎯" },
  { threshold: 0.9, text: "Smoking!!! ♨️" },
  { threshold: 0.8, text: "Hotter! 🔥🔥" },
  { threshold: 0.75, text: "Hot! 🔥" },
  { threshold: 0.7, text: "Warmer! 🌞🌞" },
  { threshold: 0.65, text: "Warm 🌞" },
  { threshold: 0.6, text: "Lukewarm 👍" },
  { threshold: 0.55, text: "Cool 👀" },
  { threshold: 0.5, text: "Cooler 👎" },
  { threshold: 0.45, text: "Cold! ❄️" },
  { threshold: 0.4, text: "Ice Cold! ❄️ ❄️" },
  { threshold: 0, text: "Freezing!!! 🧊" },
];

function GuessList({ guesses }: { guesses: Guess[] }) {
  const sorted = [...guesses]
    .map((guess, index) => ({ ...guess, originalIndex: index }))
    .sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="space-y-2">
      {sorted.map((g, i) => {
        const weight = getWeight(g.similarity);
        const bgColor = interpolateColor(g.similarity);
        const percentValue = (weight * 100).toFixed(2);
        
        const label = SIMILARITY_LABELS.find((l) => weight >= l.threshold) || SIMILARITY_LABELS[SIMILARITY_LABELS.length - 1];

        return (
          <div
            key={i}
            className="rounded-md text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden"
            style={{ backgroundColor: bgColor, animationDelay: `${i * 50}ms` }}
          >
            {/* Main content row */}
            <div className="flex items-stretch">
              {/* Left section with number */}
              <div className="bg-black/25 p-2 flex items-center w-10 justify-center border-r-2 border-black">
                <span className="font-bold text-sm">{g.originalIndex + 1}</span>
              </div>
              
              {/* Word section */}
              <div className="px-3 py-2 flex-grow flex items-center">
                <div className="flex items-center">
                  {g.isHint && 
                    <span className="bg-black/25 p-1 rounded-sm mr-2 text-xs">
                      💡
                    </span>
                  }
                  <span className="font-medium text-md sm:text-base break-all">
                    {g.word}
                  </span>
                </div>
              </div>
              
              {/* Right section with percentage */}
              <div className="bg-black/25 p-2 flex flex-col items-center justify-center border-l-2 border-black">
                <div className="text-center">
                  <div className="font-bold text-sm">{percentValue}%</div>
                  <div className="text-xs text-white/80">{label.text.replace(/[^\w\s!?]/g, '').trim().split('!')[0]}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getWeight(sim: number): number {
  const percent = sim * 100;

  if (percent > 75) {
    // Very hot (75-100%) -> 90-100%
    return 0.9 + ((percent - 75) / 25) * 0.1;
  } else if (percent > 65) {
    // Hot (65-75%) -> 80-90%
    return 0.8 + ((percent - 65) / 10) * 0.1;
  } else if (percent > 55) {
    // Warm (55-65%) -> 65-80%
    return 0.65 + ((percent - 55) / 10) * 0.15;
  } else if (percent > 45) {
    // Getting warmer (45-55%) -> 45-65%
    return 0.45 + ((percent - 45) / 10) * 0.2;
  } else {
    // Cold (<45%) -> 0-45%
    return Math.max(0, (percent / 45) * 0.45);
  }
}

function interpolateColor(sim: number): string {
  const weight = Math.max(0.1, getWeight(sim));

  // Rainbow color scheme from cold to hot
  // Full spectrum: violet -> blue -> teal -> green -> yellow -> orange -> red
  const coldColor = "oklch(45% 0.20 300)";  // Violet (coldest)
  const coolColor = "oklch(55% 0.22 260)";  // Blue-purple
  const midColor  = "oklch(65% 0.24 180)";  // Teal-cyan
  const warmColor = "oklch(70% 0.26 120)";  // Green-yellow
  const hotColor  = "oklch(65% 0.28 25)";   // Red-orange (hottest)
  
  // Parse OKLCH strings into components
  const parseOklch = (str: string) => {
    const matches = str.match(/oklch\((\d+)%\s+(\d*\.?\d+)\s+(\d+)/);
    if (!matches) throw new Error("Invalid OKLCH string");
    return {
      l: parseFloat(matches[1]),
      c: parseFloat(matches[2]),
      h: parseFloat(matches[3]),
    };
  };

  const cold = parseOklch(coldColor);
  const cool = parseOklch(coolColor);
  const mid = parseOklch(midColor);
  const warm = parseOklch(warmColor);
  const hot = parseOklch(hotColor);

  // Ease-in-out function to make the transition more gradual (unused for now)
  // const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  
  // Determine which segment of the gradient to use based on weight
  let lightness, chroma, hue;
  
  if (weight < 0.25) {
    // Coldest segment (violet to blue-purple)
    const adjustedWeight = weight * 4;
    lightness = cold.l + adjustedWeight * (cool.l - cold.l);
    chroma = cold.c + adjustedWeight * (cool.c - cold.c);
    hue = cold.h + adjustedWeight * (cool.h - cold.h);
  } else if (weight < 0.5) {
    // Cool segment (blue-purple to teal)
    const adjustedWeight = (weight - 0.25) * 4;
    lightness = cool.l + adjustedWeight * (mid.l - cool.l);
    chroma = cool.c + adjustedWeight * (mid.c - cool.c);
    hue = cool.h + adjustedWeight * (mid.h - cool.h);
  } else if (weight < 0.75) {
    // Warm segment (teal to green-yellow)
    const adjustedWeight = (weight - 0.5) * 4;
    lightness = mid.l + adjustedWeight * (warm.l - mid.l);
    chroma = mid.c + adjustedWeight * (warm.c - mid.c);
    hue = mid.h + adjustedWeight * (warm.h - mid.h);
  } else {
    // Hottest segment (green-yellow to red-orange)
    const adjustedWeight = (weight - 0.75) * 4;
    lightness = warm.l + adjustedWeight * (hot.l - warm.l);
    chroma = warm.c + adjustedWeight * (hot.c - warm.c);
    hue = warm.h + adjustedWeight * (hot.h - warm.h);
  }

  return `oklch(${lightness}% ${chroma} ${hue})`;
}

export default GuessDisplay;