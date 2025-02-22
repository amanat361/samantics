// verbose-debug-similar.ts
// This file runs multiple iterations against the /random-game endpoint to log detailed
// information about similarWords responses when errors occur.

const API_URL = "http://semantle-backend.qwertea.dev";
const ITERATIONS = 100; // Adjust this as needed

// Validation helpers (same as in the benchmark)
function isValidSimilarity(similarity: number): boolean {
  return typeof similarity === "number" && similarity >= -1 && similarity <= 1;
}

function isValidWord(word: string): boolean {
  return (
    typeof word === "string" && word.length > 0 && /^[a-zA-Z ]+$/.test(word)
  );
}

function isValidSimilarWord(obj: any): boolean {
  return obj && isValidWord(obj.word) && isValidSimilarity(obj.similarity);
}

async function runVerboseDebug() {
  console.log(`Starting verbose debug for ${ITERATIONS} iterations...\n`);

  let totalInvalidEntries = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    try {
      const response = await fetch(`${API_URL}/random-game`);
      const data = await response.json();

      const similarWords = data.similarWords;
      if (!Array.isArray(similarWords)) {
        console.error(`Iteration ${i + 1}: similarWords is not an array.`);
        continue;
      }

      // Validate each entry
      const invalidEntries = similarWords.filter(
        (entry: any) => !isValidSimilarWord(entry)
      );

      if (invalidEntries.length > 0) {
        totalInvalidEntries += invalidEntries.length;
        console.error(
          `Iteration ${i + 1}: Found ${
            invalidEntries.length
          } invalid similarWords entries.`
        );
        invalidEntries.forEach((entry: any, index: number) => {
          console.error(
            `  Invalid Entry ${index + 1}: ${JSON.stringify(entry)}`
          );
        });
      } else {
        console.log(`Iteration ${i + 1}: All similarWords entries are valid.`);
      }
    } catch (e: any) {
      console.error(
        `Iteration ${i + 1}: Error fetching or processing data - ${e.message}`
      );
    }
  }

  console.log(`\nCompleted ${ITERATIONS} iterations.`);
  console.log(
    `Total invalid similarWords entries across iterations: ${totalInvalidEntries}`
  );
}

runVerboseDebug().catch((err) => console.error("Fatal error:", err));
