// src/App.tsx
import { useEffect } from "react";
import useSemantleGame from "./hooks/useSemantleGame";
import GameHeader from "./components/GameHeader";
import GameControls from "./components/GameControls";
import GuessForm from "./components/GuessForm";
import GuessDisplay from "./components/GuessDisplay";
import HeaderWithInstructions from "./components/HeaderWithInstructions";

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [targetWord]);

  return (
    <div className="min-h-screen flex justify-center bg-[#ffecd1] p-2 sm:p-4">
      <div className="flex flex-col space-y-2 sm:space-y-4 w-full sm:w-auto">
        <GameHeader dayNumber={dayNumber} />
        <div className="max-w-xl sm:min-w-xl w-full bg-[#fff] rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <HeaderWithInstructions />

          {error && <p className="text-red-600">Error: {error}</p>}

          <GameControls
            gameOver={gameOver}
            revealed={revealed}
            remainingHints={remainingHints}
            dayNumber={dayNumber}
            guessesLength={guesses.length}
            startNewGame={startNewGame}
            guessRandomWord={guessRandomWord}
            consumeHint={consumeHint}
            setRevealed={setRevealed}
          />

          <GuessDisplay
            guesses={guesses}
            revealed={revealed}
            gameOver={gameOver}
            targetWord={targetWord}
            remainingHints={remainingHints}
          />

          <GuessForm
            guessWord={guessWord}
            gameOver={gameOver}
            guessesLength={guesses.length}
          />

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

export default App;
