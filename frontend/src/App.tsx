// src/App.tsx
import React, { useState } from "react";
import useSemantleGame from "./hooks/useSemantleGame";

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

  function DayNumber() {
    return dayNumber > 0 ? (
      <span>
        You're playing the daily word for <strong>Day #{dayNumber}!</strong>
      </span>
    ) : dayNumber === 0 ? (
      <span>You're playing a new game with a random word!</span>
    ) : (
      <span>Loading...</span>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 p-4">
      <div className="flex flex-col space-y-4">
        <div className="w-full bg-zinc-800 rounded-lg shadow-md p-2 space-y-4">
          <p className="text-lg text-center text-white">
            <DayNumber />
          </p>
        </div>
        <div className="max-w-xl lg:min-w-xl w-full bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start">
            <h1 className="text-2xl font-bold">Guess the Secret Word</h1>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center justify-between px-1 lg:px-2 py-1 hover:bg-gray-50 rounded"
            >
              <span className="font-sm mr-2">{showInstructions ? "Hide" : "Show"} Instructions</span>
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
              <strong>Instructions: </strong>Try to guess the secret word! After each guess, you'll see how
              similar your word is to the target word based on their meanings.
              The higher the percentage, the closer you are. Use the Random Hint
              button if you need help getting started.
            </p>
          )}
          {error && <p className="text-red-600">Error: {error}</p>}
          <div className="flex space-x-2">
            <button
              onClick={startNewGame}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Game
            </button>
            {!revealed && !gameOver && (
              <>
                <button
                  onClick={() => setRevealed(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Reveal Word
                </button>
                <button
                  onClick={guessRandomWord}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Random Hint
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
                  {(guesses[guesses.length - 1].similarity * 100).toFixed(2)}%
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
            {g.word} - {(g.similarity * 100).toFixed(2)}%
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interpolate a color from red (0%) to green (100%) for similarity.
 */
function interpolateColor(sim: number): string {
  const red = Math.round(255 * (1 - sim));
  const green = Math.round(255 * sim);
  return `rgb(${red}, ${green}, 0)`;
}

export default App;
