// src/App.tsx
import React, { useState, useRef, useEffect } from "react";
import useSemantleGame from "./hooks/useSemantleGame";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";
import { LightbulbIcon, ShuffleIcon, SquarePlusIcon } from "lucide-react";
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
    if (inputRef.current) {
      inputRef.current.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetWord]);

  // if the input is ever focused, scroll to the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [inputRef.current?.focus]);

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
    let shareMessage = `It took me ${
      guesses.length
    } ${guessText} to figure out ${
      dayNumber === 0 ? "a random word" : `Day #${dayNumber}`
    }`;
    // if they didnt use any hints, add that to the message
    if (remainingHints === 5) {
      shareMessage += " with no hints";
    }
    // if they used some hints, add that to the message
    if (remainingHints > 0 && remainingHints < 5) {
      shareMessage += ` with ${remainingHints} hint${
        remainingHints > 1 ? "s" : ""
      }`;
    }
    // if they used all 5 hints, add that to the message
    if (remainingHints === 0) {
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
    <div className="min-h-screen flex justify-center bg-[#caf0f8] p-2 sm:p-4">
      <div className="flex flex-col space-y-2 sm:space-y-4 w-full sm:w-auto">
        <div className="w-full bg-[#073b4c] rounded-lg shadow-md p-2 space-y-4">
          <p className="text-lg text-center text-white">
            <DayNumber />
          </p>
        </div>
        <div className="max-w-xl sm:min-w-xl w-full bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-start items-center">
            <h1 className="text-2xl font-bold max-sm:text-center max-sm:w-full">
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
              className="w-full px-2 py-1.5 bg-[#00afb9] text-white rounded hover:bg-[#0081a7] transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-6.5">New Game</span>
              <SquarePlusIcon className="w-4 h-4" />
            </button>
            {gameOver && (
              <button
                onClick={() => handleShare()}
                className="w-full px-2 py-1.5 bg-[#84a98c] text-white rounded hover:bg-[#52796f] transition flex items-center justify-center gap-2"
              >
                <span className="max-sm:mr-2.5">Share Results</span>
                <ShareIcon className="w-4 h-4" />
              </button>
            )}
            {!revealed && !gameOver && (
              <>
                {remainingHints > 0 ? (
                  <button
                    onClick={consumeHint}
                    className="w-full px-2 py-1.5 bg-[#84a98c] text-white rounded hover:bg-[#52796f] transition flex items-center justify-center gap-2"
                  >
                    <span className="max-sm:mr-2.5">
                      Use Hint: <strong>{remainingHints} left</strong>
                    </span>
                    {/* <LightBulbIcon className="w-4 h-4" /> */}
                    <LightbulbIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setRevealed(true)}
                    className="w-full px-2 py-1.5 bg-[#84a98c] text-white rounded hover:bg-[#52796f] transition flex items-center justify-center gap-2"
                  >
                    <span className="max-sm:mr-2.5">Show Answer</span>
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={guessRandomWord}
                  className="w-full px-2 py-1.5 bg-[#9f86c0] text-white rounded hover:bg-[#5e548e] transition flex items-center justify-center gap-2"
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
                You used <strong>{5 - remainingHints}</strong> hints.
              </p>
              {revealed && (
                <p className="text-[#073b4c]">
                  The answer is: <strong>{targetWord}</strong>
                </p>
              )}
            </div>
          )}
          {!gameOver && revealed && (
            <p className="text-[#073b4c]">
              The answer is: <strong>{targetWord}</strong>
            </p>
          )}
          {!gameOver && (
            <form onSubmit={handleGuess} className="flex space-x-2">
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder="Guess a word"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#06d6a0] text-white rounded hover:bg-[#354f52] transition"
              >
                Guess
              </button>
            </form>
          )}
          {guesses.length > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Guess <strong>#{guesses.length}</strong>:
                </p>
                <div
                  className="p-2 rounded text-white"
                  style={{
                    backgroundColor: interpolateColor(
                      guesses[guesses.length - 1].similarity
                    ),
                  }}
                >
                  {guesses[guesses.length - 1].word} -{" "}
                  {(
                    getWeight(guesses[guesses.length - 1].similarity) * 100
                  ).toFixed(2)}
                  %
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

function GuessList({ guesses }: { guesses: Guess[] }) {
  const sorted = [...guesses].sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="space-y-2">
      {sorted.map((g, i) => {
        const bgColor = interpolateColor(g.similarity);
        return (
          <div
            key={i}
            className="p-2 rounded text-white"
            style={{ backgroundColor: bgColor }}
          >
            {g.word} - {(getWeight(g.similarity) * 100).toFixed(2)}%
          </div>
        );
      })}
    </div>
  );
}

function getWeight(sim: number): number {
  if (sim < 0.35) {
    return (sim / 0.35) * 0.2;
  } else if (sim > 0.55) {
    return 0.8 + ((sim - 0.55) / 0.45) * 0.2;
  } else {
    return 0.2 + ((sim - 0.35) / 0.2) * 0.6;
  }
}

function interpolateColor(sim: number): string {
  const weight = getWeight(sim);
  const lightness = 55 + weight * 15;
  const chroma = 0.3 - weight * 0.05;
  const hue = 15 + weight * 140;
  return `oklch(${lightness}% ${chroma} ${hue})`;
}

export default App;
