// manual-test.ts
import { readFileSync, writeFileSync } from "fs";
import { embed, getWords } from "./embeddings";

// Helper: Compute cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      "Vectors must be of the same length to compute cosine similarity."
    );
  }
  const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
  const normB = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

// Helper: Select random elements from an array
function getRandomElements<T>(arr: T[], count: number): T[] {
  const result: T[] = [];
  const len = arr.length;
  for (let i = 0; i < count; i++) {
    result.push(arr[Math.floor(Math.random() * len)]);
  }
  return result;
}

async function runTests() {
  const logLines: string[] = [];
  function log(msg: string) {
    console.log(msg);
    logLines.push(msg);
  }

  // Load the dictionary from the words file
  const dictionary = readFileSync("data/words.txt", "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((w) => w.trim());
  log(`Loaded dictionary with ${dictionary.length} words.`);

  // === Test 1: Embedding known words from the dictionary ===
  log("\n--- Embedding Known Words ---");
  const randomKnownWords = getRandomElements(dictionary, 10);
  for (const word of randomKnownWords) {
    const start = performance.now();
    const result = await embed(word);
    const elapsed = performance.now() - start;
    log(
      `Embedded word "${word}" in ${elapsed.toFixed(2)}ms from ${
        result.source
      }.`
    );
  }

  // === Test 2: Similarity Report ===
  log("\n--- Similarity Report ---");
  // Pick a random target word and embed it.
  const targetWord = getRandomElements(dictionary, 1)[0];
  const targetRes = await embed(targetWord);
  log(`Target word: "${targetWord}".`);

  // Get the list of cached words (all words that have been embedded so far).
  const cachedWords = getWords();
  log(`Total cached words: ${cachedWords.length}`);

  // For each cached word, compute cosine similarity with the target's embedding.
  const similarityResults: { word: string; similarity: number }[] = [];
  for (const word of cachedWords) {
    const res = await embed(word); // This should be fast (cache hit) for most words.
    const sim = cosineSimilarity(targetRes.embedding, res.embedding);
    similarityResults.push({ word, similarity: sim });
  }

  // Sort descending by similarity and pick the top 5 (excluding the target itself).
  similarityResults.sort((a, b) => b.similarity - a.similarity);
  const top5 = similarityResults
    .filter((s) => s.word !== targetWord)
    .slice(0, 5);
  log(`Top 5 words similar to "${targetWord}":`);
  top5.forEach((entry, i) => {
    log(`${i + 1}. ${entry.word} - similarity: ${entry.similarity.toFixed(4)}`);
  });

  // === Test 3: Embedding Unknown Words ===
  log("\n--- Embedding Unknown Words ---");
  const unknownWords = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "plmoknijb",
    "qazwsxedc",
  ];
  log("First call (likely via API):");
  for (const word of unknownWords) {
    const start = performance.now();
    const result = await embed(word);
    const elapsed = performance.now() - start;
    log(
      `Embedded unknown word "${word}" in ${elapsed.toFixed(2)}ms from ${
        result.source
      }.`
    );
  }

  log("Second call (should hit cache):");
  for (const word of unknownWords) {
    const start = performance.now();
    const result = await embed(word);
    const elapsed = performance.now() - start;
    log(
      `Embedded unknown word "${word}" again in ${elapsed.toFixed(2)}ms from ${
        result.source
      }.`
    );
  }

  // Write the report to a file
  const report = logLines.join("\n");
  writeFileSync("manual-test-output.txt", report, "utf-8");
  log("\nTest output written to manual-test-output.txt");
}

runTests().catch((err) => {
  console.error("Error during manual testing:", err);
});
