// src/App.tsx
import { useEffect } from "react";
import useSamanticsGame from "./hooks/useSamanticsGame";
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
    stats,
    startPracticeGame,
    loadDailyGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    getHintAvailability,
    setRevealed,
  } = useSamanticsGame();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [targetWord]);

  return (
    <div className="min-h-screen flex justify-center bg-[#ffecd1] p-2 sm:p-4 font-main">
      <div className="flex flex-col w-full max-w-xl">
        <HeaderWithInstructions />
        <div className="w-full bg-[#fff] rounded-lg shadow-md p-4 sm:p-6 space-y-6 sm:space-y-4 border border-primary">
          <GameModeBanner dayNumber={dayNumber} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600"><strong>Error:</strong> {error}</p>
            </div>
          )}

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
            getHintAvailability={getHintAvailability}
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
            stats={stats}
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
            {" - "}Enjoy :)
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
