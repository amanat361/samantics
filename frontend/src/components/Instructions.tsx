// src/components/Instructions.tsx
import React from "react";
import {
  LightbulbIcon,
  ShuffleIcon,
  InfinityIcon,
  CalendarIcon,
  BrainIcon,
  GamepadIcon
} from "lucide-react";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";

const Instructions: React.FC = () => {
  return (
    <div className="text-[#001524] overflow-hidden space-y-6">
      {/* Core Objective */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#78290f]">How to Play 👋</h2>
        <p className="leading-relaxed">
          Your goal is to guess the secret word (or multiple)! After each guess, you'll see a
          similarity percentage that tells you how close your guess is. Higher
          is better! The game is <strong>meant to be challenging</strong> - so
          don't give up if it seems tough at first!
        </p>
      </div>

      {/* Game Modes - Now with separate cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#78290f] flex items-center gap-2">
          <GamepadIcon className="w-5 h-5" />
          Game Modes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Challenge Card */}
          <div className="bg-[#f7edde] p-4 rounded-md border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-primary">Daily Challenge</h4>
            </div>
            <p className="text-sm">
              A new word each day that everyone gets to play. Compare your
              results with friends and see who can solve it in fewer guesses!
            </p>
          </div>

          {/* Practice Mode Card */}
          <div className="bg-[#f7edde] p-4 rounded-md border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <InfinityIcon className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-primary">Practice Mode</h4>
            </div>
            <p className="text-sm">
              Play with random words as many times as you want. Perfect for
              honing your skills or just having fun when you can't wait for
              tomorrow's challenge.
            </p>
          </div>
        </div>

        <p className="text-sm italic">
          Switch between modes using the buttons at the top. A banner will
          clearly show which mode you're currently playing.
        </p>
      </div>

      {/* Hint Feature - Updated with new hint info */}
      <div className="space-y-2 bg-[#f7edde] p-4 rounded-md">
        <h3 className="text-lg font-semibold text-[#15616d] flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5" />
          Using Hints
        </h3>
        <p>
          You have <strong>5 hints</strong> per game, but they unlock gradually:
        </p>
        <ul className="list-inside space-y-2 pl-2 mt-2">
          <li className="flex items-start">
            <span className="text-[#15616d] font-bold mr-2">•</span>
            <span>
              One hint unlocks after every <strong>5 guesses</strong> you make
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-[#15616d] font-bold mr-2">•</span>
            <span>Each hint gets progressively closer to the target word</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#15616d] font-bold mr-2">•</span>
            <span>Hints will never repeat words you've already guessed</span>
          </li>
        </ul>
        <p className="text-sm italic mt-2">
          Use hints strategically when you're stuck - they're designed to guide
          you toward the answer!
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
          switches to <strong>Show Answer</strong>. If you're completely stuck,
          you can click it to reveal the secret word - but try your best to
          solve it without peeking!
        </p>
      </div>

      {/* Random Guess - Updated with more info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#d67c24] flex items-center gap-2">
          <ShuffleIcon className="w-5 h-5" />
          Random Guess
        </h3>
        <p>
          If you're stuck, click the <strong>Random Guess</strong> button for a
          suggestion. These guesses are pulled from the same dictionary as the
          target words, giving you a potentially useful word to try.
        </p>
      </div>

      {/* Share Feature */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#d67c24] flex items-center gap-2">
          <ShareIcon className="w-5 h-5" />
          Share Results
        </h3>
        <p>
          After solving the word, use the <strong>Share</strong> button to share
          your results with friends. Challenge them to beat your score on the
          daily word!
        </p>
      </div>

      {/* Strategy Explanation - Better formatted */}
      <div className="space-y-3 border-t border-[#d8c4a5] pt-4">
        <h3 className="text-lg font-semibold text-[#5a0d6b] flex items-center gap-2">
          <BrainIcon className="w-5 h-5" />
          Strategy Tips
        </h3>

        <div className="bg-[#f7edde] p-4 rounded-md">
          <p className="mb-3 italic font-medium text-[#78290f]">
            "Think in semantic space, not just synonyms!"
          </p>

          <div className="space-y-3">
            <p>
              Your guesses don't have to be exact synonyms. The similarity is
              based on how words relate in context and usage within language.
            </p>

            <div className="bg-white/70 p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Example:</p>
              <p className="text-sm">
                If your guess <strong>"jacket"</strong> is very close, the
                answer might not be "coat" or "sweater" – it could be something
                in the same semantic space, like <strong>"closet"</strong> or{" "}
                <strong>"wardrobe"</strong>.
              </p>
            </div>

            <p className="text-sm">
              Try words related by context, category, or function. Look at the
              similarity percentage as a guide for exploring different
              directions.
            </p>
          </div>
        </div>
      </div>

      {/* Similarity Labels - Now in a nicer table format */}
      <div className="space-y-3 border-t border-[#d8c4a5] pt-4 pb-2">
        <h3 className="text-lg font-semibold text-[#78290f]">
          Understanding Similarity Scores
        </h3>
        <p>Each guess shows a similarity percentage and a helpful label:</p>

        <div className="bg-[#f7edde] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#d8c4a5]/50">
                <th className="py-2 px-3 text-left text-sm font-semibold">
                  Score
                </th>
                <th className="py-2 px-3 text-left text-sm font-semibold">
                  Label
                </th>
                <th className="py-2 px-3 text-left text-sm font-semibold">
                  What it means
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#d8c4a5]/30">
                <td className="py-2 px-3 text-sm font-semibold">99-100%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#0eab82]">Correct!</span>
                </td>
                <td className="py-2 px-3 text-sm">You've found the word! 🎯</td>
              </tr>
              <tr className="border-t border-[#d8c4a5]/30 bg-white/30">
                <td className="py-2 px-3 text-sm font-semibold">90-98%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#0eab82]">Smoking!!!</span>
                </td>
                <td className="py-2 px-3 text-sm">Extremely close!</td>
              </tr>
              <tr className="border-t border-[#d8c4a5]/30">
                <td className="py-2 px-3 text-sm font-semibold">80-89%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#d67c24]">Hotter!</span>
                </td>
                <td className="py-2 px-3 text-sm">Very close to the target</td>
              </tr>
              <tr className="border-t border-[#d8c4a5]/30 bg-white/30">
                <td className="py-2 px-3 text-sm font-semibold">70-79%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#d67c24]">Hot/Warmer!</span>
                </td>
                <td className="py-2 px-3 text-sm">Getting much closer</td>
              </tr>
              <tr className="border-t border-[#d8c4a5]/30">
                <td className="py-2 px-3 text-sm font-semibold">60-69%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#d67c24]">
                    Warm/Lukewarm
                  </span>
                </td>
                <td className="py-2 px-3 text-sm">On the right track</td>
              </tr>
              <tr className="border-t border-[#d8c4a5]/30 bg-white/30">
                <td className="py-2 px-3 text-sm font-semibold">50-59%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#15616d]">Cool</span>
                </td>
                <td className="py-2 px-3 text-sm">
                  Some connection, but still far
                </td>
              </tr>
              <tr className="border-t border-[#d8c4a5]/30">
                <td className="py-2 px-3 text-sm font-semibold">Below 50%</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-[#15616d]">
                    Cold/Freezing
                  </span>
                </td>
                <td className="py-2 px-3 text-sm">Try a different approach</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm italic mt-2">
          The higher the percentage, the more semantically similar your guess is
          to the target word. Use these labels to guide your next guesses!
        </p>
      </div>
    </div>
  );
};

export default Instructions;
