// src/components/GuessForm.tsx
import React, { useState, useRef, useEffect } from "react";
import { ForwardIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface GuessFormProps {
  guessWord: (word: string) => void;
  gameOver: boolean;
  guessesLength: number;
  isLoading: boolean;
}

const GuessForm: React.FC<GuessFormProps> = ({ guessWord, gameOver, guessesLength }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Store the original focus method
    const originalFocus = input.focus.bind(input);

    // Override the focus method
    input.focus = function (options = {}) {
      return originalFocus({ preventScroll: true, ...options });
    };

    const handleFocus = () => {
      // if they've started guessing, don't scroll to top
      if (guessesLength > 0) return;

      // Immediately prevent default iOS scroll
      window.scrollTo({ top: window.scrollY, behavior: "instant" });

      let distanceToTop = 0;
      let element: HTMLElement | null = input;
      while (element) {
        distanceToTop += element.offsetTop;
        element = element.offsetParent as HTMLElement;
      }

      const threshold = window.innerHeight * 1.5;

      if (distanceToTop < threshold) {
        // Try multiple times to override iOS
        window.scrollTo({ top: window.scrollY, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          // One more time after a frame to be extra sure
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 16);
        });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.target === input) {
        // Try to prevent default iOS behavior
        window.scrollTo({ top: window.scrollY, behavior: "instant" });
      }
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("touchstart", handleTouchStart);

    return () => {
      input.focus = originalFocus;
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("touchstart", handleTouchStart);
    };
  }, [guessesLength]);

  function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    guessWord(inputValue.trim().toLowerCase());
    setInputValue("");
    // Auto-focus input after submitting
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  }

  if (gameOver) return null;

  return (
    <form onSubmit={handleGuess} className="flex w-full space-x-3">
      <div className="relative flex-1">
        <Input
          //@ts-expect-error idk why this is not working
          ref={inputRef}
          type="text"
          placeholder="Guess one or more words..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pr-8"
        />
        {inputValue && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => {
              setInputValue("");
              inputRef.current?.focus();
            }}
            aria-label="Clear input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      <Button 
        type="submit"
        className="sm:not-autofill:min-w-[120px]" 
        variant="reverse"
      >
        <span className="max-sm:hidden">Guess</span>
        <ForwardIcon className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default GuessForm;