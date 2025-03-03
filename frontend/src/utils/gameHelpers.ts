// src/utils/gameHelpers.ts
import { TOTAL_HINTS } from "../hooks/useSamanticsGame";

export const emojiMap = {
  10: "🔥", // 1-9 guesses
  30: "👍", // 10-29 guesses
  50: "😐", // 30-49 guesses
  100: "🐢", // 50-99 guesses
  Infinity: "🤔", // 100+ guesses
};

export function getEmoji(numGuesses: number): string {
  return (
    Object.entries(emojiMap).find(
      ([threshold]) => numGuesses <= Number(threshold)
    )?.[1] || emojiMap.Infinity
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

interface ShareParams {
  guessesLength: number;
  dayNumber: number;
  remainingHints: number;
  revealed: boolean;
}

export async function handleShare({
  guessesLength,
  dayNumber,
  remainingHints,
  revealed
}: ShareParams): Promise<boolean> {
  const shareUrl = "https://play.qwertea.dev";
  const guessText = guessesLength === 1 ? "guess" : "guesses";
  const hintsUsed = TOTAL_HINTS - remainingHints;

  let shareMessage = `It took me ${
    guessesLength
  } ${guessText} to figure out ${
    dayNumber === 0 ? "a random word" : `Day #${dayNumber}`
  }`;

  if (hintsUsed === 0) {
    shareMessage += " with no hints";
  } else if (hintsUsed < TOTAL_HINTS) {
    shareMessage += ` with ${hintsUsed} hint${hintsUsed === 1 ? "" : "s"}`;
  } else {
    shareMessage += " with all of the hints";
  }

  if (revealed) {
    shareMessage += " (and cheated)";
  }

  try {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Samantics",
          text: shareMessage,
          url: shareUrl,
        });
        return true;
      } catch (err) {
        console.error("Failed to share: ", err);
        return await copyToClipboard(shareMessage);
      }
    } else {
      return await copyToClipboard(shareMessage);
    }
  } catch (error) {
    console.error("Share error:", error);
    return false;
  }
}