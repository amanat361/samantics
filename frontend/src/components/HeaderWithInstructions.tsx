// src/components/HeaderWithInstructions.tsx
import React, { useState } from "react";
import Instructions from "./Instructions";

const HeaderWithInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-start items-center">
        <h1 className="text-[#001524] text-2xl font-bold max-sm:text-center max-sm:w-full">
          Guess the Secret Word
        </h1>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center justify-between px-1 lg:px-2 py-1 hover:bg-gray-50 rounded"
        >
          <span className="font-sm mr-2">
            {showInstructions ? "Hide" : "Show"} Instructions
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform ${
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
      {showInstructions && <Instructions />}
    </>
  );
};

export default HeaderWithInstructions;
