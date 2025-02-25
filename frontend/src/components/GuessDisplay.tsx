// src/components/GuessDisplay.tsx
import React from "react";

interface Guess {
  word: string;
  similarity: number;
}

interface GuessDisplayProps {
  guesses: Guess[];
  revealed: boolean;
  gameOver: boolean;
  targetWord: string;
  remainingHints: number;
  getEmoji: (numGuesses: number) => string;
}

const GuessDisplay: React.FC<GuessDisplayProps> = ({
  guesses,
  revealed,
  gameOver,
  targetWord,
  remainingHints,
  getEmoji,
}) => {
  return (
    <>
      {gameOver && (
        <div className="space-y-2 flex-col flex">
          <p className="text-green-600 font-semibold">
            Congratulations! You guessed it in{" "}
            <strong>{guesses.length}</strong>{" "}
            {guesses.length === 1 ? "guess" : "guesses"}.{" "}
            {getEmoji(guesses.length)}
          </p>
          <p className="text-[#9f86c0] font-semibold">
            You used <strong>{5 - remainingHints}</strong> hint
            {5 - remainingHints > 1 ? "s" : ""}.
          </p>
          {revealed && (
            <p className="text-[#073b4c]">
              The answer is: <strong>{targetWord}</strong>
            </p>
          )}
        </div>
      )}
      {!gameOver && revealed && (
        <p className="text-text">
          The answer is: <strong>{targetWord}</strong>
        </p>
      )}
      {guesses.length > 0 && (
        <>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="max-sm:hidden">Guess </span>
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
              <GuessClosenessLabel
                weight={getWeight(guesses[guesses.length - 1].similarity)}
              />
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
            </div>
            <GuessClosenessLabel weight={weight} />
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

  // Easy to update color strings
  const startColor = "oklch(32% 0.50 123)";
  const endColor = "oklch(63% 0.30 216)";

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

  const lightness = start.l + weight * (end.l - start.l);
  const chroma = start.c + weight * (end.c - start.c);

  // Force decreasing path (negative direction around the wheel)
  const hueDiff = end.h - start.h;
  const hue = start.h + weight * (hueDiff - 360);

  return `oklch(${lightness}% ${chroma} ${hue})`;
}

export default GuessDisplay;