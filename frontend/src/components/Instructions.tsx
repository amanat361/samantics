// src/components/Instructions.tsx
import React from "react";
import {
  LightbulbIcon,
  ShuffleIcon,
  InfinityIcon,
  CalendarIcon,
  BrainIcon,
  GamepadIcon,
  HelpCircleIcon
} from "lucide-react";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/16/solid";
import { TOTAL_HINTS } from "../hooks/useSamanticsGame";

const Instructions: React.FC = () => {
  return (
    <div className="text-text overflow-hidden space-y-5" style={{ fontFamily: 'var(--font-base)' }}>
      {/* Introduction Card */}
      <div className="bg-yellow p-4 rounded-base border-2 border-border shadow-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-bw rounded-full border-2 border-border">
            <HelpCircleIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            How to Play
          </h2>
        </div>
        <p className="leading-relaxed text-base">
          Your goal is to guess the secret word! After each guess, you'll see a
          similarity percentage that tells you how close your guess is. Higher
          is better! The game is <strong>meant to be challenging</strong> - so
          don't give up if it seems tough at first!
        </p>
      </div>

      {/* Game Modes Card */}
      <div className="bg-blue p-4 rounded-base border-2 border-border shadow-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-bw rounded-full border-2 border-border">
            <GamepadIcon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Game Modes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Challenge Card */}
          <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-4 h-4 text-mtext" />
              <h4 className="font-bold text-base" style={{ fontFamily: 'var(--font-accent)' }}>Daily Challenge</h4>
            </div>
            <p className="text-sm">
              A new word each day that everyone gets to play. Compare your
              results with friends!
            </p>
          </div>

          {/* Practice Mode Card */}
          <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-1">
              <InfinityIcon className="w-4 h-4 text-mtext" />
              <h4 className="font-bold text-base" style={{ fontFamily: 'var(--font-accent)' }}>Practice Mode</h4>
            </div>
            <p className="text-sm">
              Play with random words as many times as you want. Perfect for
              honing your skills!
            </p>
          </div>
        </div>
      </div>

      {/* Hints Card */}
      <div className="bg-pink p-4 rounded-base border-2 border-border shadow-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-bw rounded-full border-2 border-border">
            <LightbulbIcon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Hints & Features
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Hints Section */}
          <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-accent)' }}>Hints ({TOTAL_HINTS} per game)</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-1.5">
                <span className="text-pink font-bold">•</span>
                <span>One hint unlocks after every <strong>5 guesses</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pink font-bold">•</span>
                <span>Each hint gets progressively closer to the target word</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pink font-bold">•</span>
                <span>Hints won't repeat words you've already guessed</span>
              </li>
            </ul>
          </div>

          {/* Other Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-1">
                <ShuffleIcon className="w-4 h-4 text-mtext" />
                <h4 className="font-bold text-base" style={{ fontFamily: 'var(--font-accent)' }}>Random Guess</h4>
              </div>
              <p className="text-sm">
                If you're stuck, get a randomly selected word from our dictionary.
              </p>
            </div>

            <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-1">
                <ShareIcon className="w-4 h-4 text-mtext" />
                <h4 className="font-bold text-base" style={{ fontFamily: 'var(--font-accent)' }}>Share Results</h4>
              </div>
              <p className="text-sm">
                After solving, share your score with friends and challenge them to beat it!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Card */}
      <div className="bg-mint p-4 rounded-base border-2 border-border shadow-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-bw rounded-full border-2 border-border">
            <BrainIcon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Strategy Tips
          </h3>
        </div>

        <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3">
          <blockquote className="border-l-4 pl-2 border-mint italic">
            <p className="font-medium text-sm">Think in semantic space, not just synonyms!</p>
          </blockquote>
          <p className="mt-2 text-sm">
            Your guesses don't have to be exact synonyms. The similarity is
            based on how words relate in context and usage within language.
          </p>
          <div className="mt-2 bg-yellow/20 p-2 rounded-base border border-border">
            <p className="text-sm"><strong>Example:</strong> If <strong>"jacket"</strong> is very close, the answer might not be "coat" but something in the same space, like <strong>"closet"</strong> or <strong>"wardrobe"</strong>.</p>
          </div>
        </div>

        {/* Similarity Guide */}
        <h4 className="font-bold mb-2 text-base" style={{ fontFamily: 'var(--font-heading)' }}>
          Similarity Score Guide
        </h4>
        <div className="bg-bw p-3 rounded-base border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold" width="25%">90-100%:</td>
                <td className="py-1"><span className="font-bold">Correct/Smoking! 🔥</span></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold">80-89%:</td>
                <td className="py-1"><span className="font-bold">Very hot! 🔥🔥</span></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold">70-79%:</td>
                <td className="py-1"><span className="font-bold">Hot! 🔥</span></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold">60-69%:</td>
                <td className="py-1"><span className="font-bold">Warm! 🌞</span></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold">50-59%:</td>
                <td className="py-1"><span className="font-bold">Lukewarm 👍</span></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold">40-49%:</td>
                <td className="py-1"><span className="font-bold">Cool 👀</span></td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-1 font-bold">30-39%:</td>
                <td className="py-1"><span className="font-bold">Cold ❄️</span></td>
              </tr>
              <tr>
                <td className="py-1 font-bold">0-29%:</td>
                <td className="py-1"><span className="font-bold">Freezing 🧊</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
