import { writeFileSync } from "fs";
import { performance } from "perf_hooks";

// Node 18+ has a built-in fetch. If using an earlier version, consider installing a fetch polyfill.
const API_URL = "http://semantle-backend.qwertea.dev";
// const API_URL = "http://localhost:3000";
const ITERATIONS = 100;
const CONCURRENT_REQUESTS = 10;

interface BenchmarkResult {
  name: string;
  averageMs: number;
  minMs: number;
  maxMs: number;
  totalMs: number;
  httpSuccessRate: number;
  validDataRate: number;
  errors: {
    network: number;
    invalidData: number;
    invalidRange: number;
  };
  details: string[];
}

// Validation helpers
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

async function validateResponse(
  response: any,
  endpoint: string
): Promise<{ valid: boolean; details: string[] }> {
  const details: string[] = [];

  switch (endpoint) {
    case "daily-game": {
      if (!isValidWord(response.targetWord)) {
        details.push("Invalid or missing targetWord");
      }
      if (!Array.isArray(response.targetWords)) {
        details.push("targetWords is not an array");
      } else if (!response.targetWords.every(isValidWord)) {
        details.push("Some targetWords are invalid");
      }
      if (!Array.isArray(response.similarWords)) {
        details.push("similarWords is not an array");
      } else if (!response.similarWords.every(isValidSimilarWord)) {
        details.push("Some similarWords entries are invalid");
      }
      if (typeof response.dayNumber !== "number" || response.dayNumber < 1) {
        details.push("Invalid dayNumber");
      }
      return { valid: details.length === 0, details };
    }
    case "random-game": {
      if (!isValidWord(response.targetWord)) {
        details.push("Invalid or missing targetWord");
      }
      if (!Array.isArray(response.targetWords)) {
        details.push("targetWords is not an array");
      } else if (!response.targetWords.every(isValidWord)) {
        details.push("Some targetWords are invalid");
      }
      if (!Array.isArray(response.similarWords)) {
        details.push("similarWords is not an array");
      } else if (!response.similarWords.every(isValidSimilarWord)) {
        details.push("Some similarWords entries are invalid");
      }
      return { valid: details.length === 0, details };
    }
    case "similar": {
      if (!Array.isArray(response.similarWords)) {
        details.push("similarWords is not an array");
        return { valid: false, details };
      }
      const invalidEntries = response.similarWords.filter(
        (s: any) => !isValidSimilarWord(s)
      );
      if (invalidEntries.length > 0) {
        details.push(
          `${invalidEntries.length} invalid similarity entries found`
        );
      }
      // Check if similarities are properly ordered (descending)
      const similarities = response.similarWords.map((s: any) => s.similarity);
      for (let i = 1; i < similarities.length; i++) {
        if (similarities[i] > similarities[i - 1]) {
          details.push("Similarities not properly sorted (desc)");
          break;
        }
      }
      return { valid: details.length === 0, details };
    }
    case "guess": {
      if (!isValidSimilarity(response.similarity)) {
        details.push("Invalid similarity value");
      }
      return { valid: details.length === 0, details };
    }
    default:
      return { valid: false, details: ["Unknown endpoint"] };
  }
}

async function time(fn: () => Promise<any>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

async function benchmarkEndpoint(
  name: string,
  fn: () => Promise<any>,
  endpoint: string,
  iterations: number
): Promise<BenchmarkResult> {
  const times: number[] = [];
  let httpSuccesses = 0;
  let validData = 0;
  const errors = {
    network: 0,
    invalidData: 0,
    invalidRange: 0,
  };
  const details: string[] = [];

  for (let i = 0; i < iterations; i++) {
    try {
      let response: any;
      const ms = await time(async () => {
        response = await fn();
      });
      times.push(ms);
      httpSuccesses++;

      const validation = await validateResponse(response, endpoint);
      if (validation.valid) {
        validData++;
      } else {
        errors.invalidData++;
        details.push(`Iteration ${i + 1}: ${validation.details.join(", ")}`);
      }
    } catch (e: any) {
      errors.network++;
      details.push(`Iteration ${i + 1}: Network error - ${e.message}`);
    }
  }

  return {
    name,
    averageMs: times.reduce((a, b) => a + b, 0) / times.length,
    minMs: Math.min(...times),
    maxMs: Math.max(...times),
    totalMs: times.reduce((a, b) => a + b, 0),
    httpSuccessRate: (httpSuccesses / iterations) * 100,
    validDataRate: (validData / iterations) * 100,
    errors,
    details,
  };
}

async function runBenchmarks() {
  console.log("Starting benchmarks...");
  const results: BenchmarkResult[] = [];
  const output: string[] = [];

  // Get test data
  console.log("Getting test data...");
  let targetWords: string[] = [];
  let allWords: string[] = [];

  try {
    const targetResponse = await fetch(`${API_URL}/target-words`);
    const targetJson = await targetResponse.json();
    targetWords = targetJson.targetWords;

    const wordsResponse = await fetch(`${API_URL}/cached`);
    const wordsJson = await wordsResponse.json();
    allWords = wordsJson.words;
  } catch (e) {
    console.error("Failed to get test data:", e);
    return;
  }

  const testWords = allWords.slice(0, 10);
  const testTargets = targetWords.slice(0, 5);

  // Test /daily-game (should be cached after first call)
  results.push(
    await benchmarkEndpoint(
      "GET /daily-game (first call)",
      async () => {
        const response = await fetch(`${API_URL}/daily-game`);
        return await response.json();
      },
      "daily-game",
      1
    )
  );

  results.push(
    await benchmarkEndpoint(
      "GET /daily-game (cached)",
      async () => {
        const response = await fetch(`${API_URL}/daily-game`);
        return await response.json();
      },
      "daily-game",
      ITERATIONS
    )
  );

  // Test /random-game with different targets
  results.push(
    await benchmarkEndpoint(
      "GET /random-game (different targets)",
      async () => {
        const response = await fetch(`${API_URL}/random-game`);
        return await response.json();
      },
      "random-game",
      ITERATIONS
    )
  );

  // Test /similar endpoint with caching
  const testWord = testWords[0];
  results.push(
    await benchmarkEndpoint(
      `POST /similar (first call for "${testWord}")`,
      async () => {
        const response = await fetch(`${API_URL}/similar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: testWord, limit: 100 }),
        });
        return await response.json();
      },
      "similar",
      1
    )
  );

  results.push(
    await benchmarkEndpoint(
      `POST /similar (cached for "${testWord}")`,
      async () => {
        const response = await fetch(`${API_URL}/similar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: testWord, limit: 100 }),
        });
        return await response.json();
      },
      "similar",
      ITERATIONS
    )
  );

  // Test /guess endpoint with different combinations
  results.push(
    await benchmarkEndpoint(
      "POST /guess (cached words)",
      async () => {
        const target =
          testTargets[Math.floor(Math.random() * testTargets.length)];
        const guess = testWords[Math.floor(Math.random() * testWords.length)];
        const response = await fetch(`${API_URL}/guess`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: guess, target }),
        });
        return await response.json();
      },
      "guess",
      ITERATIONS
    )
  );

  // Test concurrent requests
  results.push(
    await benchmarkEndpoint(
      `${CONCURRENT_REQUESTS} concurrent similar requests`,
      async () => {
        const promises = testWords.slice(0, CONCURRENT_REQUESTS).map((word) =>
          fetch(`${API_URL}/similar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word, limit: 100 }),
          }).then((r) => r.json())
        );
        const res = await Promise.all(promises);
        return res[0]; // Return first result for validation
      },
      "similar",
      Math.floor(ITERATIONS / 10)
    )
  );

  // Format results
  output.push("=== Benchmark Results ===");
  output.push(`Date: ${new Date().toISOString()}`);
  output.push(`API URL: ${API_URL}`);
  output.push(`Base iterations per test: ${ITERATIONS}`);
  output.push("\nResults:");

  results.forEach((result) => {
    output.push(`\n${result.name}:`);
    output.push(`  Average: ${result.averageMs.toFixed(2)}ms`);
    output.push(`  Min: ${result.minMs.toFixed(2)}ms`);
    output.push(`  Max: ${result.maxMs.toFixed(2)}ms`);
    output.push(`  Total: ${result.totalMs.toFixed(2)}ms`);
    output.push(`  HTTP Success Rate: ${result.httpSuccessRate.toFixed(1)}%`);
    output.push(`  Valid Data Rate: ${result.validDataRate.toFixed(1)}%`);
    output.push(`  Errors:`);
    output.push(`    Network: ${result.errors.network}`);
    output.push(`    Invalid Data: ${result.errors.invalidData}`);
    output.push(`    Invalid Range: ${result.errors.invalidRange}`);

    if (result.details.length > 0) {
      output.push("\n  Error Details:");
      result.details.forEach((detail) => {
        output.push(`    - ${detail}`);
      });
    }
  });

  // Add interpretation guide
  output.push("\n=== Results Interpretation ===");
  output.push("Response Times:");
  output.push("  Excellent: < 100ms average");
  output.push("  Good: < 300ms average");
  output.push("  Concerning: > 500ms average");
  output.push("  Problem: > 1000ms average");

  output.push("\nSuccess Rates:");
  output.push("  Expected: 100% HTTP success rate");
  output.push("  Expected: 100% valid data rate");
  output.push("  Investigate if either rate < 100%");

  output.push("\nCaching Effectiveness:");
  output.push("  Expected: Cached calls 10-100x faster than first calls");
  output.push(
    "  Expected: Consistent times for cached data (low max/min variance)"
  );

  output.push("\nConcurrent Performance:");
  output.push("  Good: Average concurrent time < 2x single request time");
  output.push("  Investigate if concurrent times > 5x single request time");

  // Save results to a timestamped file
  const filename = `benchmarks/benchmark-results-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.txt`;
  writeFileSync(filename, output.join("\n"));
  console.log(`Benchmarks complete! Results saved to ${filename}`);

  // Log immediate concerns
  const problems = results.filter(
    (r) => r.validDataRate < 100 || r.averageMs > 1000 || r.errors.network > 0
  );

  if (problems.length > 0) {
    console.error("\n⚠️ Issues requiring attention:");
    problems.forEach((p) => {
      console.error(`- ${p.name}: ${p.details.join(", ")}`);
    });
  } else {
    console.log("\n✅ All benchmarks passed expected thresholds!");
  }
}

runBenchmarks().catch((err) => console.error(err));
