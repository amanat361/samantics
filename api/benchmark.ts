// benchmark.ts
import { writeFileSync } from "fs";

const API_URL = "http://semantle-backend.qwertea.dev";
const ITERATIONS = 100;
const CONCURRENT_REQUESTS = 10;

interface BenchmarkResult {
  name: string;
  averageMs: number;
  minMs: number;
  maxMs: number;
  totalMs: number;
  successRate: number;
}

async function time(fn: () => Promise<any>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

async function benchmarkEndpoint(
  name: string,
  fn: () => Promise<any>,
  iterations: number
): Promise<BenchmarkResult> {
  const times: number[] = [];
  let successes = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const ms = await time(fn);
      times.push(ms);
      successes++;
    } catch (e) {
      console.error(`Error in ${name}:`, e);
    }
  }

  return {
    name,
    averageMs: times.reduce((a, b) => a + b, 0) / times.length,
    minMs: Math.min(...times),
    maxMs: Math.max(...times),
    totalMs: times.reduce((a, b) => a + b, 0),
    successRate: (successes / iterations) * 100,
  };
}

async function runBenchmarks() {
  console.log("Starting benchmarks...");
  const results: BenchmarkResult[] = [];
  const output: string[] = [];

  // Get test data
  console.log("Getting test data...");
  const { targetWords } = await fetch(`${API_URL}/target-words`).then((r) =>
    r.json()
  );
  const { words: allWords } = await fetch(`${API_URL}/cached`).then((r) =>
    r.json()
  );

  const testWords = allWords.slice(0, 10);
  const testTargets = targetWords.slice(0, 5);

  // Test /daily-game (should be cached after first call)
  results.push(
    await benchmarkEndpoint(
      "GET /daily-game (first call)",
      async () => {
        const response = await fetch(`${API_URL}/daily-game`);
        await response.json();
      },
      1
    )
  );

  results.push(
    await benchmarkEndpoint(
      "GET /daily-game (cached)",
      async () => {
        const response = await fetch(`${API_URL}/daily-game`);
        await response.json();
      },
      ITERATIONS
    )
  );

  // Test /random-game with different targets
  results.push(
    await benchmarkEndpoint(
      "GET /random-game (different targets)",
      async () => {
        const response = await fetch(`${API_URL}/random-game`);
        await response.json();
      },
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
        await response.json();
      },
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
        await response.json();
      },
      ITERATIONS
    )
  );

  // Test guess endpoint with different combinations
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
        await response.json();
      },
      ITERATIONS
    )
  );

  // Test concurrent requests
  results.push(
    await benchmarkEndpoint(
      `${CONCURRENT_REQUESTS} concurrent similar requests`,
      async () => {
        const promises = testWords.slice(0, CONCURRENT_REQUESTS).map((word: string) =>
          fetch(`${API_URL}/similar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word, limit: 100 }),
          }).then((r) => r.json())
        );
        await Promise.all(promises);
      },
      ITERATIONS / 10
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
    output.push(`  Success Rate: ${result.successRate.toFixed(1)}%`);
  });

  // Save results
  const filename = `benchmarks/benchmark-results-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.txt`;
  writeFileSync(filename, output.join("\n"));
  console.log(`Benchmarks complete! Results saved to ${filename}`);
}

runBenchmarks().catch(console.error);
