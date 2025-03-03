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
      {guesses.length > 0 && !gameOver && (
        <>
          <div className="space-y-2">
            <p className="text-text font-medium">
              <span>Latest Guess:</span>
            </p>
            <div
              className="rounded-md text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden"
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
                    <span className="font-medium text-sm sm:text-base break-all">
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
                        return label.text.split(' ')[0];
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
            style={{ backgroundColor: bgColor }}
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
                  <span className="font-medium text-sm sm:text-base break-all">
                    {g.word}
                  </span>
                </div>
              </div>
              
              {/* Right section with percentage */}
              <div className="bg-black/25 p-2 flex flex-col items-center justify-center border-l-2 border-black">
                <div className="text-center">
                  <div className="font-bold text-sm">{percentValue}%</div>
                  <div className="text-xs text-white/80">{label.text.split(' ')[0]}</div>
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

  // Warm gradient that transitions from rust/brown to orange
  // Representing "far" (cooler, darker) to "near" (warmer, brighter)
  // const startColor = "oklch(35% 0.14 30)"; // Deep rust brown (far)
  // const endColor = "oklch(65% 0.18 60)"; // Warm orange (near)
  const startColor = "oklch(30% 0.13 25)"; // Deep chocolate brown (far)
  const endColor = "oklch(70% 0.17 70)"; // Bright orange-gold (near)
  
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

  const start = parseOklch(startColor);
  const end = parseOklch(endColor);

  // Ease-in-out function to make the middle range transition more gradual
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  const easedWeight = easeInOut(weight);

  const lightness = start.l + easedWeight * (end.l - start.l);
  const chroma = start.c + easedWeight * (end.c - start.c);
  const hue = start.h + easedWeight * (end.h - start.h);

  return `oklch(${lightness}% ${chroma} ${hue})`;
}

export default GuessDisplay;