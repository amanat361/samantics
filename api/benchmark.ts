// benchmark.ts
import { writeFileSync } from "fs";

const API_URL = "https://semantle-backend.qwertea.dev";
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

async function getTargets(count: number): Promise<string[]> {
  const targets: string[] = [];
  for (let i = 0; i < count; i++) {
    const response = await fetch(`${API_URL}/target`);
    const { targetWord } = await response.json();
    targets.push(targetWord);
  }
  return targets;
}

async function runBenchmarks() {
  console.log("Starting benchmarks...");
  const results: BenchmarkResult[] = [];
  const output: string[] = [];

  // Get some target words for testing
  console.log("Getting target words...");
  const targets = await getTargets(5);
  const guessWords = ["hello", "world", "test", "benchmark", "computer"];

  // Benchmark /target endpoint
  results.push(
    await benchmarkEndpoint(
      "GET /target",
      async () => {
        const response = await fetch(`${API_URL}/target`);
        await response.json();
      },
      ITERATIONS
    )
  );

  // Benchmark new /guess endpoint
  results.push(
    await benchmarkEndpoint(
      "POST /guess (new method)",
      async () => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const guess = guessWords[Math.floor(Math.random() * guessWords.length)];
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

  // Benchmark old method (separate embed + similarity calls)
  results.push(
    await benchmarkEndpoint(
      "Old method (embed + similarity)",
      async () => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const guess = guessWords[Math.floor(Math.random() * guessWords.length)];

        // Get embeddings
        const [guessEmbed, targetEmbed] = await Promise.all([
          fetch(`${API_URL}/embed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: guess }),
          }).then((r) => r.json()),
          fetch(`${API_URL}/embed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: target }),
          }).then((r) => r.json()),
        ]);

        // Get similarity
        await fetch(`${API_URL}/similarity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            a: guessEmbed.embedding,
            b: targetEmbed.embedding,
          }),
        }).then((r) => r.json());
      },
      ITERATIONS
    )
  );

  // Benchmark concurrent guesses
  results.push(
    await benchmarkEndpoint(
      `${CONCURRENT_REQUESTS} concurrent guesses`,
      async () => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const promises = Array(CONCURRENT_REQUESTS)
          .fill(0)
          .map(() => {
            const guess =
              guessWords[Math.floor(Math.random() * guessWords.length)];
            return fetch(`${API_URL}/guess`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ word: guess, target }),
            }).then((r) => r.json());
          });
        await Promise.all(promises);
      },
      ITERATIONS / 10
    )
  );

  // Format results
  output.push("=== Benchmark Results ===");
  output.push(`Date: ${new Date().toISOString()}`);
  output.push(`Iterations per test: ${ITERATIONS}`);
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
  writeFileSync("benchmark-results.txt", output.join("\n"));
  console.log("Benchmarks complete! Results saved to benchmark-results.txt");
}

runBenchmarks().catch(console.error);
