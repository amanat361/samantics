// embeddings.ts
import { readFileSync, writeFileSync } from "fs";

interface EmbeddingCache {
  words: string[];
  embeddings: number[][];
  created: string;
}

interface SimilarityGraph {
  [word: string]: {
    word: string;
    similarity: number;
  }[];
}

class EmbeddingManager {
  private cache: Map<string, number[]> = new Map();
  private similarityGraph: SimilarityGraph = {};
  private cacheFile = "data/embeddings.json";
  private graphFile = "data/similarityGraph.json";
  private allWords: string[] = [];
  private targetWords: string[] = [];
  private readonly OLLAMA_URL: string;
  private readonly headers: HeadersInit;

  constructor() {
    this.OLLAMA_URL = `${process.env.CLOUDFLARE_URL}/api/embed`;
    this.headers = {
      Accept: "application/json",
      "Cf-Access-Client-Id": process.env.CLOUDFLARE_ID || "",
      "Cf-Access-Client-Secret": process.env.CLOUDFLARE_SECRET || "",
    };

    this.loadCache();
    this.loadTargetWords();
    this.loadAllWords();
    this.loadSimilarityGraph();
    this.initializeIfNeeded();
  }

  private async initializeIfNeeded() {
    const needsSeeding = this.cache.size < this.allWords.length;
    const needsGraph =
      Object.keys(this.similarityGraph).length < this.targetWords.length;

    if (needsSeeding || needsGraph) {
      console.log("Initializing missing data...");

      if (needsSeeding) {
        console.log("Embeddings cache incomplete. Running seedEmbeddings...");
        await this.seedEmbeddings();
      }

      if (needsGraph) {
        console.log("Similarity graph incomplete. Building graph...");
        await this.buildFullSimilarityGraph();
      }

      console.log("Initialization complete!");
    }
  }

  private loadCache() {
    try {
      const data: EmbeddingCache = JSON.parse(
        readFileSync(this.cacheFile, "utf-8")
      );
      data.words.forEach((word, i) => {
        this.cache.set(word, data.embeddings[i]);
      });
      console.log(`Loaded ${this.cache.size} cached embeddings`);
    } catch (e) {
      console.warn(
        "No embeddings cache found. Call seedEmbeddings() to precompute common words."
      );
    }
  }

  private loadAllWords() {
    try {
      this.allWords = readFileSync("data/words.txt", "utf-8")
        .split("\n")
        .filter(Boolean)
        .map((w) => w.trim());
      console.log(`Loaded ${this.allWords.length} words`);
    } catch (e) {
      console.warn("No words.txt found");
      this.allWords = [];
    }
  }

  private loadSimilarityGraph() {
    try {
      this.similarityGraph = JSON.parse(readFileSync(this.graphFile, "utf-8"));
      console.log(
        `Loaded similarity graph for ${
          Object.keys(this.similarityGraph).length
        } words`
      );
    } catch (e) {
      console.warn("No similarity graph found. Will build as needed.");
      this.similarityGraph = {};
    }
  }

  private saveSimilarityGraph() {
    writeFileSync(this.graphFile, JSON.stringify(this.similarityGraph));
  }

  async getTopSimilarWords(
    word: string,
    limit: number = 100
  ): Promise<{ word: string; similarity: number }[]> {
    // Check if we have pre-computed similarities
    if (this.similarityGraph[word]) {
      const cached = this.similarityGraph[word];
      // If we have enough cached results, return them
      if (cached.length >= limit) {
        return cached.slice(0, limit);
      }
      // If we need more results, recompute
      console.log(
        `Need more similarities for ${word} (cached: ${cached.length}, requested: ${limit})`
      );
    }

    // Get embedding for input word
    const { embedding } = await this.embed(word);

    // Calculate similarities with all words
    const similarities = await Promise.all(
      this.allWords.map(async (targetWord) => {
        
        // If it's the same word, set similarity to exactly 1.
        if (targetWord === word) {
          return { word: targetWord, similarity: 1 };
        }
        
        const { embedding: targetEmbedding } = this.cache.has(targetWord)
          ? { embedding: this.cache.get(targetWord)! }
          : await this.embed(targetWord);

        return {
          word: targetWord,
          similarity: this.computeCosineSimilarity(embedding, targetEmbedding),
        };
      })
    );

    // Sort by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Store all results (or at least more than currently requested)
    const topResults = similarities.slice(0, Math.max(limit, 100)); // Store at least 100 results

    // Cache the results
    this.similarityGraph[word] = topResults;
    this.saveSimilarityGraph();

    return topResults.slice(0, limit);
  }

  // Optional: Method to precompute similarities for all target words
  async buildFullSimilarityGraph() {
    const words = this.targetWords;

    console.log("Building full similarity graph...");
    const total = words.length;
    let completed = 0;

    for (const word of words) {
      if (!this.similarityGraph[word]) {
        console.log(
          `Computing similarities for: ${word} (${++completed}/${total})`
        );
        await this.getTopSimilarWords(word);
      } else {
        completed++;
      }
    }
    console.log("Similarity graph building complete!");
  }

  private loadTargetWords() {
    try {
      this.targetWords = readFileSync("data/target-words.txt", "utf-8")
        .split("\n")
        .filter(Boolean)
        .map((w) => w.trim());
      console.log(`Loaded ${this.targetWords.length} target words`);
    } catch (e) {
      console.warn("No target-words.txt found");
      this.targetWords = [];
    }
  }

  private saveCache() {
    const data: EmbeddingCache = {
      words: Array.from(this.cache.keys()),
      embeddings: Array.from(this.cache.values()),
      created: new Date().toISOString(),
    };
    writeFileSync(this.cacheFile, JSON.stringify(data));
  }

  private async getFromAPI(words: string[]): Promise<number[][]> {
    const response = await fetch(this.OLLAMA_URL, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        model: "nomic-embed-text",
        input: words,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("API Request failed:", {
        status: response.status,
        response: text,
        words,
      });
      throw new Error(`Embedding API error: ${response.status} - ${text}`);
    }

    const data = await response.json();

    if (!data.embeddings || !Array.isArray(data.embeddings)) {
      console.error("Unexpected API response:", data);
      throw new Error("Invalid API response format");
    }

    return data.embeddings;
  }

  /**
   * Compute cosine similarity between two numeric vectors.
   */
  computeCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error(
        "Vectors must be of the same length to compute cosine similarity."
      );
    }
    const dotProduct = a.reduce((sum, aVal, i) => sum + aVal * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
    const normB = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
    if (normA === 0 || normB === 0) {
      throw new Error("Cannot compute similarity for zero-vector(s).");
    }
    let similarity = dotProduct / (normA * normB);

    // Use a small epsilon to detect near-boundary values
    const epsilon = 1e-12;
    if (similarity > 1 && similarity - 1 < epsilon) {
      similarity = 1;
    }
    if (similarity < -1 && -1 - similarity < epsilon) {
      similarity = -1;
    }

    // Alternatively, a direct clamp ensures the returned value is in [-1,1]
    similarity = Math.min(1, Math.max(-1, similarity));

    return similarity;
  }

  async embed(
    word: string
  ): Promise<{ embedding: number[]; source: "cache" | "api" }> {
    if (this.cache.has(word)) {
      return {
        embedding: this.cache.get(word)!,
        source: "cache",
      };
    }

    const [embedding] = await this.getFromAPI([word]);
    this.cache.set(word, embedding);
    this.saveCache();
    return { embedding, source: "api" };
  }

  async embedBatch(
    words: string[]
  ): Promise<{ embeddings: number[][]; newWords: string[] }> {
    const uncached = words.filter((w) => !this.cache.has(w));

    if (uncached.length > 0) {
      console.log(`Computing embeddings for ${uncached.length} new words...`);
      try {
        const embeddings = await this.getFromAPI(uncached);
        if (embeddings.length !== uncached.length) {
          throw new Error(
            `API returned ${embeddings.length} embeddings for ${uncached.length} words`
          );
        }
        uncached.forEach((word, i) => {
          this.cache.set(word, embeddings[i]);
        });
        this.saveCache();
      } catch (e) {
        console.error("Failed to get embeddings:", e);
        throw e;
      }
    }

    return {
      embeddings: words.map((w) => this.cache.get(w)!),
      newWords: uncached,
    };
  }

  getWords(): string[] {
    return Array.from(this.cache.keys());
  }

  getRandomTargetWord(): string {
    if (this.targetWords.length === 0) {
      throw new Error("No target words loaded");
    }
    return this.targetWords[
      Math.floor(Math.random() * this.targetWords.length)
    ];
  }

  getTargetWords(): string[] {
    if (this.targetWords.length === 0) {
      throw new Error("No target words loaded");
    }
    return this.targetWords;
  }

  async seedEmbeddings() {
    try {
      const words = this.allWords;

      const BATCH_SIZE = 1000;
      for (let i = 0; i < words.length; i += BATCH_SIZE) {
        const batch = words.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
            words.length / BATCH_SIZE
          )}`
        );
        await this.embedBatch(batch);
      }

      console.log(`Seeding complete. Cached ${this.cache.size} words.`);
    } catch (e) {
      console.error("Error seeding embeddings:", e);
      throw e;
    }
  }
}

const manager = new EmbeddingManager();

export const embed = (word: string) => manager.embed(word);
export const embedBatch = (words: string[]) => manager.embedBatch(words);
export const seedEmbeddings = () => manager.seedEmbeddings();
export const getWords = () => manager.getWords();
export const getRandomTargetWord = () => manager.getRandomTargetWord();
export const getTargetWords = () => manager.getTargetWords();
export const getTopSimilarWords = (word: string, limit: number) =>
  manager.getTopSimilarWords(word, limit);
export const buildFullSimilarityGraph = () =>
  manager.buildFullSimilarityGraph();
export const computeCosineSimilarity = (a: number[], b: number[]) =>
  manager.computeCosineSimilarity(a, b);