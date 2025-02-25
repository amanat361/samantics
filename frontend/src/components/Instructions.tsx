// src/components/Instructions.tsx
import React from "react";
import { LightbulbIcon, ShuffleIcon, InfinityIcon } from "lucide-react";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";

const Instructions: React.FC = () => {
  return (
    <div className="text-[#001524] overflow-hidden space-y-6">
      {/* Core Objective */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#78290f]">How to Play 👋</h2>
        <p className="leading-relaxed">
          Your goal is to guess the secret word! After each guess, you'll see a
          similarity percentage that tells you how close your guess is. Higher
          is better! The game is <strong>meant to be hard</strong> so don't give
          up!
        </p>
      </div>

      {/* Game Modes */}
      <div className="space-y-2 bg-[#f7edde] p-3 rounded-md">
        <h3 className="text-lg font-semibold text-[#78290f] flex items-center gap-2">
          <InfinityIcon className="w-5 h-5" />
          Game Modes
        </h3>
        <p>
          There are two ways to play:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>
            <strong>Daily Challenge</strong> - A new word each day that everyone plays
          </li>
          <li>
            <strong>Practice Mode</strong> - Play with random words as many times as you want
          </li>
        </ul>
        <p>
          You can switch between modes using the buttons at the top. A banner will
          clearly show which mode you're currently playing.
        </p>
      </div>

      {/* Hint Feature */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#15616d] flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5" />
          Using Hints
        </h3>
        <p>
          You have <strong>5 hints</strong> per game. When you click the{" "}
          <strong>Use Hint</strong> button, you'll be given a helpful
          suggestion:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>
            <i>Each hint gets closer to the target word</i>
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
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#15616d] flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          Reveal Answer
        </h3>
        <p>
          Once you run out of hints, the <strong>Use Hint</strong> button
          switches to <strong>Show Answer</strong>. Click it to reveal the
          secret word. Don't be lazy!
        </p>
      </div>

      {/* Random Guess */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#d67c24] flex items-center gap-2">
          <ShuffleIcon className="w-5 h-5" />
          Random Guess
        </h3>
        <p>
          If you're stuck, click the <strong>Random Guess</strong> button for a
          suggestion from the available words.
        </p>
      </div>

      {/* Share Feature */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#d67c24] flex items-center gap-2">
          <ShareIcon className="w-5 h-5" />
          Share Results
        </h3>
        <p>
          After you win, use the <strong>Share</strong> button to share your
          results with friends. Show off your awesome skills.
        </p>
      </div>

      {/* Strategy Explanation */}
      <div className="space-y-2 border-t border-[#d8c4a5] pt-4">
        <h3 className="text-lg font-semibold text-[#78290f]">Strategy Tips</h3>
        <p>
          Keep in mind that your guesses don't have to be exact synonyms. For
          instance, if your guess "jacket" is very close, it doesn't necessarily
          mean the answer is "coat" or "sweater" – it could be something in the
          same semantic space, like "closet."
        </p>
        <p>
          Think about words related in context and usage, not just similar in
          meaning.
        </p>
      </div>

      {/* Similarity Labels */}
      <div className="space-y-2 border-t border-[#d8c4a5] pt-4 pb-2">
        <h3 className="text-lg font-semibold text-[#78290f]">
          Understanding Similarity Scores
        </h3>
        <p>
          Each guess shows a similarity percentage and a helpful label. Here's
          what they mean:
        </p>
        <div className="bg-[#f7edde] p-3 rounded-md mt-2">
          <ul className="space-y-1.5">
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#0eab82]">•</span>
              <span><span className="font-semibold">99-100%:</span> <strong className="text-[#0eab82]">Correct!</strong> - You've found the word! 🎯</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#0eab82]">•</span>
              <span><span className="font-semibold">90-98%:</span> <strong className="text-[#0eab82]">Smoking!!!</strong> - Extremely close!</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#d67c24]">•</span>
              <span><span className="font-semibold">80-89%:</span> <strong className="text-[#d67c24]">Hotter!</strong> - Very close to the target</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#d67c24]">•</span>
              <span><span className="font-semibold">70-79%:</span> <strong className="text-[#d67c24]">Hot/Warmer!</strong> - Getting much closer</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#d67c24]">•</span>
              <span><span className="font-semibold">60-69%:</span> <strong className="text-[#d67c24]">Warm/Lukewarm</strong> - On the right track</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#15616d]">•</span>
              <span><span className="font-semibold">50-59%:</span> <strong className="text-[#15616d]">Cool</strong> - Some connection, but still far</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-[#15616d]">•</span>
              <span><span className="font-semibold">Below 50%:</span> <strong className="text-[#15616d]">Cold to Freezing</strong> - Try a different approach</span>
            </li>
          </ul>
        </div>
        <p className="text-sm italic mt-2">
          The higher the percentage, the more semantically similar your guess is
          to the target word.
        </p>
      </div>
    </div>
  );
};

export default Instructions;