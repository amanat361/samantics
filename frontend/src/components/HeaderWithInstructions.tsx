// src/components/HeaderWithInstructions.tsx
import React, { useState } from "react";
import Instructions from "./Instructions";
import { CircleHelpIcon } from "lucide-react";
import { Button } from "./ui/button";

const HeaderWithInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="w-full bg-bw rounded-lg shadow-shadow p-3 sm:py-4 sm:px-6 mb-2 border-2 border-border">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left max-sm:w-full">
          <h1 className="inline-block relative mb-2">
            <span className="text-4xl sm:text-5xl font-black text-mtext tracking-wide" 
                  style={{ 
                    fontFamily: "'Londrina Solid', sans-serif",
                    letterSpacing: "0.05em" 
                  }}>SAMANTICS</span>
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-pink rounded-full"></div>
          </h1>
          <div className="text-text text-sm max-w-[90%] mx-auto sm:mx-0">
            Guess words based on their semantic similarity
          </div>
        </div>
        <Button
          onClick={() => setShowInstructions(!showInstructions)}
          className="mt-2 sm:mt-0 bg-blue"
          variant="default"
        >
          <CircleHelpIcon className="w-4 h-4" />
          <span style={{ fontFamily: 'var(--font-accent)' }}>
            {showInstructions ? "Hide" : "How to Play"}
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              showInstructions ? "rotate-180" : ""
            }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </Button>
      </div>
      {showInstructions && (
        <div className="my-4 bg-bg rounded-lg border-2 border-border shadow-shadow relative">
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
            <Instructions />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderWithInstructions;
