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
            <p className="text-gray-600">
              <span>Guess </span>
              <strong>#{guesses.length}</strong>:
            </p>
            <div
              className="p-2 rounded text-white flex items-center justify-between flex-wrap gap-2"
              style={{
                backgroundColor: interpolateColor(
                  guesses[guesses.length - 1].similarity
                ),
              }}
            >
              <div className="flex items-center gap-2">
                <GuessNumberLabel guessNumber={guesses.length} />
                <strong>{guesses[guesses.length - 1].word}</strong>
              </div>
              <div className="flex items-center gap-2">
                {guesses[guesses.length - 1].isHint && <HintLabel />}
                <GuessClosenessLabel
                  weight={getWeight(guesses[guesses.length - 1].similarity)}
                  />
              </div>
            </div>
          </div>
          <hr className="border-gray-200 my-4" />
        </>
      )}
      <GuessList guesses={guesses} />
    </>
  );
};

function GuessNumberLabel({ guessNumber }: { guessNumber: number }) {
  return (
    <span className={`text-nowrap px-2 py-1 rounded-md text-sm bg-white/20`}>
      <span className="max-sm:hidden">Guess </span><strong>#{guessNumber}</strong>
    </span>
  );
}

function HintLabel() {
  return (
    <span className={`text-nowrap px-2 py-1 rounded-md text-sm bg-white/20`}>
      <span className="max-sm:hidden">Hint </span><strong>💡</strong>
    </span>
  );
}

function GuessClosenessLabel({ weight }: { weight: number }) {
  const labels = [
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

  const label =
    labels.find((l) => weight >= l.threshold) || labels[labels.length - 1];

  return (
    <span className={`text-nowrap px-2 py-1 rounded-md text-sm bg-white/20`}>
      <strong>{(weight * 100).toFixed(2)}%</strong> - {label.text}
    </span>
  );
}

function GuessList({ guesses }: { guesses: Guess[] }) {
  const sorted = [...guesses]
    .map((guess, index) => ({ ...guess, originalIndex: index }))
    .sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="space-y-2">
      {sorted.map((g, i) => {
        const weight = getWeight(g.similarity);
        const bgColor = interpolateColor(g.similarity);
        return (
          <div
            key={i}
            className="p-2 rounded text-white flex items-center justify-between flex-wrap gap-2"
            style={{ backgroundColor: bgColor }}
          >
            <div className="flex items-center gap-2">
              <GuessNumberLabel guessNumber={g.originalIndex + 1} />
              <strong className="">{g.word}</strong>
              {/* {g.isHint && (
                <span title="Hint"><LightbulbIcon className="w-4 h-4" /></span>
              )} */}
            </div>
            <div className="flex items-center gap-2">
              {g.isHint && <HintLabel />}
              <GuessClosenessLabel weight={weight} />
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