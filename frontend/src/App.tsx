// src/App.tsx
import React, { useState, useEffect } from "react";
import useSemantleGame from "./hooks/useSemantleGame";

function App() {
  const {
    dictionary,
    targetWord,
    guesses,
    error,
    gameOver,
    revealed,
    startNewGame,
    guessWord,
    setRevealed,
  } = useSemantleGame();

  const [inputValue, setInputValue] = useState("");

  // Start a new game once dictionary is loaded
  useEffect(() => {
    if (dictionary.length > 0) {
      startNewGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionary]);

  function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    guessWord(inputValue.trim());
    setInputValue("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">Semantle</h1>

        {error && <p className="text-red-600">Error: {error}</p>}

        <div className="flex space-x-2">
          <button
            onClick={startNewGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Game
          </button>
          {!revealed && !gameOver && (
            <button
              onClick={() => setRevealed(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reveal Word
            </button>
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

        {/* Display guesses, sorted by best similarity first */}
        <GuessList guesses={guesses} />
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
