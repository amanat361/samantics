// src/App.tsx
import React, { useState } from "react";
import useSemantleGame from "./hooks/useSemantleGame";
import {
  PlusCircleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShareIcon,
} from "@heroicons/react/16/solid";
// import { QuestionMarkCircleIcon } from "@heroicons/react/16/solid";

function App() {
  const {
    dayNumber,
    targetWord,
    guesses,
    error,
    gameOver,
    revealed,
    startNewGame,
    guessWord,
    guessRandomWord,
    setRevealed,
  } = useSemantleGame();

  const [inputValue, setInputValue] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

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
        // You could add a toast notification here if you want
        alert("Results copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

  async function handleShare() {
    const shareUrl = "https://play.qwertea.dev";
    const guessText = guesses.length === 1 ? "guess" : "guesses";
    const shareMessage = `It took me ${guesses.length} ${guessText} to figure out Day #${dayNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Samantics", text: shareMessage, url: shareUrl });
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
              {/* <QuestionMarkCircleIcon className="w-4 h-4 mr-2" /> */}
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
          {showInstructions && (
            <p className="text-gray-600 px-2 py-2 bg-gray-50 rounded">
              <strong>Instructions: </strong>Try to guess the secret word! After
              each guess, you'll see how similar your word is to the target word
              based on their meanings. The higher the percentage, the closer you
              are. Use the Random Hint button if you need help getting started.
            </p>
          )}
          {error && <p className="text-red-600">Error: {error}</p>}
          <div className="flex sm:space-x-2 items-center sm:flex-row flex-col w-full max-sm:space-y-2">
            <button
              onClick={startNewGame}
              className="w-full px-2 py-1.5 bg-[#00afb9] text-white rounded hover:bg-[#0081a7] transition flex items-center justify-center gap-2"
            >
              <span className="max-sm:mr-6.5">New Game</span>
              <PlusCircleIcon className="w-4 h-4" />
            </button>
            {gameOver && (
              <button
                onClick={() => handleShare()}
                className="w-full px-2 py-1.5 bg-[#84a98c] text-white rounded hover:bg-[#52796f] transition flex items-center justify-center gap-2"
              >
                <span className="max-sm:mr-2.5">Share</span>
                <ShareIcon className="w-4 h-4" />
              </button>
            )}
            {!revealed && !gameOver && (
              <>
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full px-2 py-1.5 bg-[#84a98c] text-white rounded hover:bg-[#52796f] transition flex items-center justify-center gap-2"
                >
                  <span className="max-sm:mr-2.5">Show Answer</span>
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={guessRandomWord}
                  className="w-full px-2 py-1.5 bg-[#9f86c0] text-white rounded hover:bg-[#5e548e] transition flex items-center justify-center gap-2"
                >
                  <span>Random Guess</span>
                  <LightBulbIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {/* If the game is over, show a message */}
          {gameOver && (
            <p className="text-green-600 font-semibold">
              Congratulations! You guessed it in {guesses.length} guesses.
            </p>
          )}
          {/* Show the target word if game is over or user clicks reveal */}
          {(revealed || gameOver) && (
            <p className="text-gray-500">
              Target word: <strong>{targetWord}</strong>
            </p>
          )}
          {/* Guess Form - disabled if gameOver */}
          {!gameOver && (
            <form onSubmit={handleGuess} className="flex space-x-2">
              <input
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

          {/* Show last guess above the list */}
          {guesses.length > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-gray-600">Last guess:</p>
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

          {/* Display guesses, sorted by best similarity first */}
          <GuessList guesses={guesses} />

          {/* add a little made with love message centered at the bottom */}
          <div className="text-center text-gray-500 text-xs">
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

// A sub-component for listing guesses
function GuessList({ guesses }: { guesses: Guess[] }) {
  // Sort guesses by descending similarity
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
    // Map 0-0.35 to 0-0.2
    return (sim / 0.35) * 0.2;
  } else if (sim > 0.55) {
    // Map 0.55-1.0 to 0.8-1.0
    return 0.8 + ((sim - 0.55) / 0.45) * 0.2;
  } else {
    // Map 0.35-0.55 to 0.2-0.8
    return 0.2 + ((sim - 0.35) / 0.2) * 0.6;
  }
}

function interpolateColor(sim: number): string {
  const weight = getWeight(sim);

  // More vibrant OKLCH interpolation
  const lightness = 55 + weight * 15; // Wider lightness range from 55-70%
  const chroma = 0.3 - weight * 0.05; // More saturated, from 0.30-0.25
  const hue = 15 + weight * 140; // Wider hue range from warm red (15) to green (155)

  return `oklch(${lightness}% ${chroma} ${hue})`;
}

export default App;
