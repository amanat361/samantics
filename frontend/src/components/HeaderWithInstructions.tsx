// src/components/HeaderWithInstructions.tsx
import React, { useState } from "react";
import Instructions from "./Instructions";

const HeaderWithInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="w-full bg-white rounded-lg shadow-md py-3 px-4 mb-2">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-title max-sm:text-center max-sm:w-full leading-tight">
          <span className="text-[#78290f]">Samantics</span> <span className="text-[#001524] font-normal text-xl md:text-2xl">- Test your vocabulary</span>
        </h1>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center justify-between px-3 py-1 bg-[#f7edde] hover:bg-[#d8c4a5] text-[#78290f] rounded border border-[#d8c4a5] mt-2 sm:mt-0 transition-colors font-main text-sm"
        >
          <span className="font-medium mr-2">
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
        <div className="my-4 bg-white rounded-lg p-4 sm:p-6 space-y-4 border border-[#d8c4a5] shadow-sm">
          <Instructions />
        </div>
      )}
    </div>
  );
};

export default HeaderWithInstructions;
