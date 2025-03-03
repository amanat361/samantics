// src/components/HeaderWithInstructions.tsx
import React, { useState } from "react";
import Instructions from "./Instructions";
import { CircleHelpIcon } from "lucide-react";

const HeaderWithInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="w-full bg-bw rounded-lg shadow-shadow p-3 sm:py-4 sm:px-6 mb-2 border-2 border-border">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl max-sm:text-center max-sm:w-full leading-tight">
          <span className="text-mtext font-semibold">Samantics</span>{" "}
          <span className="text-text font-normal text-2xl">
            - Test your vocabulary
          </span>
        </h1>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center justify-between px-3 py-1 bg-main hover:bg-main/80 text-mtext rounded-base border-2 border-border mt-2 sm:mt-0 transition-colors text-sm gap-2"
        >
          <CircleHelpIcon className="w-4 h-4" />
          <span className="font-medium">
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
        </button>
      </div>
      {showInstructions && (
        <div className="my-4 bg-bw rounded-lg p-4 space-y-4 border-2 border-border shadow-shadow">
          <Instructions />
        </div>
      )}
    </div>
  );
};

export default HeaderWithInstructions;
