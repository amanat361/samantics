// src/utils/gameHelpers.ts

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

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    alert("Results copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text: ", err);
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
}: ShareParams): Promise<void> {
  const shareUrl = "https://play.qwertea.dev";
  const guessText = guessesLength === 1 ? "guess" : "guesses";
  const hintsUsed = 5 - remainingHints;

  let shareMessage = `It took me ${
    guessesLength
  } ${guessText} to figure out ${
    dayNumber === 0 ? "a random word" : `Day #${dayNumber}`
  }`;

  if (hintsUsed === 0) {
    shareMessage += " with no hints";
  } else if (hintsUsed < 5) {
    shareMessage += ` with ${hintsUsed} hint${hintsUsed === 1 ? "" : "s"}`;
  } else {
    shareMessage += " with all of the hints";
  }

  if (revealed) {
    shareMessage += " (and cheated)";
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Samantics",
        text: shareMessage,
        url: shareUrl,
      });
    } catch (err) {
      console.error("Failed to share: ", err);
      copyToClipboard(shareMessage);
    }
  } else {
    copyToClipboard(shareMessage);
  }
}