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
    isLoading,
    startPracticeGame,
    loadDailyGame,
    guessWord,
    guessRandomWord,
    consumeHint,
    getHintAvailability,
    setRevealed,
    setError,
  } = useSamanticsGame();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [targetWord]);

  return (
    <div className="min-h-screen flex justify-center bg-bg p-2 sm:p-4" style={{ fontFamily: 'var(--font-base)' }}>
      <div className="flex flex-col w-full max-w-xl">
        <HeaderWithInstructions />
        <div className="w-full bg-bw rounded-lg shadow-shadow p-4 sm:p-6 space-y-6 sm:space-y-4 border-2 border-border">
          <GameModeBanner dayNumber={dayNumber} />

          {error && (
            <div className="bg-white border-2 border-border rounded-base p-4 shadow-error relative">
              <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 font-bold rounded-tl-sm">
                Error
              </div>
              <p className="text-text pt-6 pl-1 font-medium">{error}</p>
              <button 
                onClick={() => setError("")} 
                className="absolute top-1 right-2 font-bold text-lg hover:text-red-500 transition-colors"
                aria-label="Close error message"
              >
                ×
              </button>
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
            isLoading={isLoading}
            getHintAvailability={getHintAvailability}
            setRevealed={setRevealed}
          />

          <GuessForm
            guessWord={guessWord}
            gameOver={gameOver}
            guessesLength={guesses.length}
            isLoading={isLoading}
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
            isLoading={isLoading}
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
            {" - "}
            <a href="https://github.com/amanat361/samantics" className="underline">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
