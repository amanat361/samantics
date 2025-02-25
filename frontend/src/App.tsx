// src/App.tsx
import { useEffect } from "react";
import useSemantleGame from "./hooks/useSemantleGame";
import GameControls from "./components/GameControls";
import GuessForm from "./components/GuessForm";
import GuessDisplay from "./components/GuessDisplay";
import HeaderWithInstructions from "./components/HeaderWithInstructions";
import GameModeBanner from "./components/GameModeBanner";

function App() {
  const {
    dayNumber,
    targetWord,
    guesses,
    error,
    gameOver,
    revealed,
    remainingHints,
    startPracticeGame,
    loadDailyGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    setRevealed,
  } = useSemantleGame();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [targetWord]);

  return (
    <div className="min-h-screen flex justify-center bg-[#ffecd1] p-2 sm:p-4 font-main">
      <div className="flex flex-col w-full max-w-xl">
        <HeaderWithInstructions />
        <div className="w-full bg-[#fff] rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <GameModeBanner dayNumber={dayNumber} />

          {error && <p className="text-red-600">Error: {error}</p>}

          <GameControls
            gameOver={gameOver}
            revealed={revealed}
            remainingHints={remainingHints}
            dayNumber={dayNumber}
            guessesLength={guesses.length}
            startPracticeGame={startPracticeGame}
            loadDailyGame={loadDailyGame}
            guessRandomWord={guessRandomWord}
            consumeHint={consumeHint}
            setRevealed={setRevealed}
          />

          <GuessForm
            guessWord={guessWord}
            gameOver={gameOver}
            guessesLength={guesses.length}
          />
          <GuessDisplay
            guesses={guesses}
            revealed={revealed}
            gameOver={gameOver}
            targetWord={targetWord}
            remainingHints={remainingHints}
            dayNumber={dayNumber}
            startPracticeGame={startPracticeGame}
            loadDailyGame={loadDailyGame}
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
