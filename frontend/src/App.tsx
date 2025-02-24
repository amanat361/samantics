// src/App.tsx
import React, { useState, useRef, useEffect } from "react";
import useSemantleGame from "./hooks/useSemantleGame";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";
import { LightbulbIcon, ShuffleIcon, InfinityIcon, ForwardIcon } from "lucide-react";
import Instructions from "./components/Instructions";

function App() {
  const {
    dayNumber,
    targetWord,
    guesses,
    error,
    gameOver,
    revealed,
    remainingHints,
    startNewGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    setRevealed,
  } = useSemantleGame();

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Store the original focus method
    const originalFocus = input.focus.bind(input);

    // Override the focus method
    input.focus = function (options = {}) {
      return originalFocus({ preventScroll: true, ...options });
    };

    const handleFocus = () => {
      // if they've started guessing, don't scroll to top
      if (guesses.length > 0) return;

      // Immediately prevent default iOS scroll
      window.scrollTo({ top: window.scrollY, behavior: "instant" });

      let distanceToTop = 0;
      let element: HTMLElement | null = input;
      while (element) {
        distanceToTop += element.offsetTop;
        element = element.offsetParent as HTMLElement;
      }

      const threshold = window.innerHeight * 1.5;

      if (distanceToTop < threshold) {
        // Try multiple times to override iOS
        window.scrollTo({ top: window.scrollY, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          // One more time after a frame to be extra sure
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 16);
        });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.target === input) {
        // Try to prevent default iOS behavior
        window.scrollTo({ top: window.scrollY, behavior: "instant" });
      }
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("touchstart", handleTouchStart);

    return () => {
      input.focus = originalFocus;
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("touchstart", handleTouchStart);
    };
  }, [guesses]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [targetWord]);

  function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    guessWord(inputValue.trim().toLowerCase());
    setInputValue("");
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Results copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

  const emojiMap = {
    10: "🔥", // 1-9 guesses
    30: "👍", // 10-29 guesses
    50: "😐", // 30-49 guesses
    100: "🐢", // 50-99 guesses
    Infinity: "🤔", // 100+ guesses
  };

  const getEmoji = (numGuesses: number) => {
    return (
      Object.entries(emojiMap).find(
        ([threshold]) => numGuesses <= Number(threshold)
      )?.[1] || emojiMap.Infinity
    );
  };

  async function handleShare() {
    const shareUrl = "https://play.qwertea.dev";
    const guessText = guesses.length === 1 ? "guess" : "guesses";
    const hintsUsed = 5 - remainingHints; // Calculate hints used

    let shareMessage = `It took me ${
      guesses.length
    } ${guessText} to figure out ${
      dayNumber === 0 ? "a random word" : `Day #${dayNumber}`
    }`;

    // if they didnt use any hints, add that to the message
    if (hintsUsed === 0) {
      shareMessage += " with no hints";
    }
    // if they used some hints, add that to the message
    else if (hintsUsed < 5) {
      shareMessage += ` with ${hintsUsed} hint${hintsUsed > 1 ? "s" : ""}`;
    }
    // if they used all 5 hints, add that to the message
    else {
      shareMessage += " with all of the hints";
    }

    // if they revealed the answer, add that to the message
    if (revealed) {
      shareMessage += " (and cheated)";
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Samantics",
          text: shareMessage,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Failed to share: ", err);
        copyToClipboard(shareMessage);
      }
    } else {
      copyToClipboard(shareMessage);
    }
  }

  function DayNumber() {
    return dayNumber > 0 ? (
      <span>
        You're guessing the word for <strong>Day #{dayNumber}!</strong>
      </span>
    ) : dayNumber === 0 ? (
      <span>
        You're guessing a <strong>random</strong> word!
      </span>
    ) : (
      <span>Loading...</span>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-[#ffecd1] p-2 sm:p-4">
      <div className="flex flex-col space-y-2 sm:space-y-4 w-full sm:w-auto">
        <div className="w-full bg-[#78290f] rounded-lg shadow-md p-2 space-y-4">
          <p className="text-lg text-center text-white">
            <DayNumber />
          </p>
        </div>
        <div className="max-w-xl sm:min-w-xl w-full bg-[#fff] rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-start items-center">
            <h1 className="text-[#001524] text-2xl font-bold max-sm:text-center max-sm:w-full">
              Guess the Secret Word
            </h1>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center justify-between px-1 lg:px-2 py-1 hover:bg-gray-50 rounded"
            >
              <span className="font-sm mr-2">
                {showInstructions ? "Hide" : "Show"} Instructions
              </span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showInstructions ? "rotate-180" : ""
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
          {showInstructions && <Instructions />}
          {error && <p className="text-red-600">Error: {error}</p>}
          <div className="flex sm:space-x-2 items-center sm:flex-row flex-col w-full max-sm:space-y-2">
            <button
              onClick={startNewGame}
              className="w-full px-2 py-1.5 bg-primary text-white rounded hover:bg-primary/80 transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-2.5">Change Word</span>
              <InfinityIcon className="w-4 h-4" />
            </button>
            {gameOver && (
              <button
                onClick={() => handleShare()}
                className="w-full px-2 py-1.5 bg-share text-white rounded hover:bg-share/80 transition flex items-center justify-center gap-2"
              >
                <span className="max-sm:mr-2.5">Share Results</span>
                <ShareIcon className="w-4 h-4" />
              </button>
            )}
            {!revealed && !gameOver && (
              <>
                {remainingHints > 0 ? (
                  <button
                    onClick={() => consumeHint(20, 3)}
                    className="w-full px-2 py-1.5 bg-hint text-white rounded hover:bg-hint/80 transition flex items-center justify-center gap-2"
                  >
                    <span className="max-sm:mr-0">
                      Use Hint: <strong>{remainingHints} left</strong>
                    </span>
                    {/* <LightBulbIcon className="w-4 h-4" /> */}
                    <LightbulbIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setRevealed(true)}
                    className="w-full px-2 py-1.5 bg-hint text-white rounded hover:bg-hint/80 transition flex items-center justify-center gap-2"
                  >
                    <span className="max-sm:mr-2.5">Show Answer</span>
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={guessRandomWord}
                  className="w-full px-2 py-1.5 bg-share text-white rounded hover:bg-share/80 transition flex items-center justify-center gap-2"
                >
                  <span>Random Guess</span>
                  <ShuffleIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
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
          {!gameOver && (
            <form onSubmit={handleGuess} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Guess a word"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-guess text-white rounded hover:bg-guess/80 transition flex items-center justify-center gap-2"
              >
                Guess
                <ForwardIcon className="w-4 h-4" />
              </button>
            </form>
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
          <div className="text-center text-gray-500 text-sm">
            Made with{" "}
            <span role="img" aria-label="love">
              ❤️
            </span>{" "}
            by{" "}
            <a href="https://saminamanat.com" className="underline">
              Sam
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Guess {
  word: string;
  similarity: number;
}

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

export default App;
