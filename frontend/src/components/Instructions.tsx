// src/components/Instructions.tsx
import React from "react";
import { LightbulbIcon, ShuffleIcon, InfinityIcon } from "lucide-react";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";

const Instructions: React.FC = () => {
  return (
    <div className="text-gray-700 px-4 py-4 sm:px-6 sm:py-6 bg-gray-50 rounded space-y-6">
      {/* Core Objective */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">How to Play 👋</h2>
        <p>
          Your goal is to guess the secret word! After each guess, you'll see a
          similarity percentage that tells you how close your guess is. Higher
          is better! The game is <strong>meant to be hard</strong> so don't give
          up!
        </p>
      </div>

      {/* New Game */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#00afb9] flex items-center gap-2">
          <InfinityIcon className="w-5 h-5" />
          Change Word
        </h3>
        <p>
          Click the <strong>Change Word</strong> button to start a fresh game.
          This resets your guesses and loads a new secret word. This is{" "}
          <strong>not</strong> the daily word. Check the top of the screen to
          see what you're guessing.
        </p>
      </div>

      {/* Random Guess */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#9f86c0] flex items-center gap-2">
          <ShuffleIcon className="w-5 h-5" />
          Random Guess
        </h3>
        <p>
          If you're stuck, click the <strong>Random Guess</strong> button for a
          suggestion from the available words.
        </p>
      </div>

      {/* Hint Feature */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#84a98c] flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5" />
          Hints
        </h3>
        <p>
          You have <strong>5 hints</strong> per game. When you click the{" "}
          <strong>Use Hint</strong> button, you'll be given a helpful
          suggestion:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <i>Each hint ges closer to the target word</i> 
          </li>
          <li>
            <i>Early hints are distant, later hints are closer</i>
          </li>
        </ul>
        <p>
          Hints will never reveal the secret word or repeat a word you've
          already guessed.
        </p>
      </div>

      {/* Reveal Answer */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#84a98c] flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          Reveal Answer
        </h3>
        <p>
          Once you run out of hints, the <strong>Use Hint</strong> button
          switches to <strong>Show Answer</strong>. Click it to reveal the
          secret word. Don't be lazy!
        </p>
      </div>

      {/* Share Feature */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#84a98c] flex items-center gap-2">
          <ShareIcon className="w-5 h-5" />
          Share Results
        </h3>
        <p>
          After you win, use the <strong>Share</strong> button to share your
          results with friends. Show off your awesome skills.
        </p>
      </div>

      {/* Strategy Explanation */}
      <div className="space-y-1 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold">Strategy Tips</h3>
        <p>
          Keep in mind that your guesses don’t have to be exact synonyms. For
          instance, if your guess “jacket” is very close, it doesn't necessarily
          mean the answer is “coat” or “sweater” – it could be something in the
          same semantic space, like “closet.”
        </p>
        <p>
          Think about words related in context and usage, not just similar in
          meaning.
        </p>
      </div>

      {/* Similarity Labels */}
      <div className="space-y-1 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold">
          Understanding Similarity Scores
        </h3>
        <p>
          Each guess shows a similarity percentage and a helpful label. Here's
          what they mean:
        </p>
        <ul className="list-inside space-y-1">
          <li>
            • 99-100%: <strong>Correct!</strong> - You've found the word! 🎯
          </li>
          <li>
            • 90-98%: <strong>Smoking!!!</strong> - Extremely close!
          </li>
          <li>
            • 80-89%: <strong>Hotter!</strong> - Very close to the target
          </li>
          <li>
            • 70-79%: <strong>Hot/Warmer!</strong> - Getting much closer
          </li>
          <li>
            • 60-69%: <strong>Warm/Lukewarm</strong> - On the right track
          </li>
          <li>
            • 50-59%: <strong>Cool</strong> - Some connection, but still far
          </li>
          <li>
            • Below 50%: <strong>Cold to Freezing</strong> - Try a different
            approach
          </li>
        </ul>
        <p className="text-sm italic mt-2">
          The higher the percentage, the more semantically similar your guess is
          to the target word.
        </p>
      </div>
    </div>
  );
};

export default Instructions;
