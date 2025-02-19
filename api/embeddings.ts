// embeddings.ts
import { readFileSync, writeFileSync } from "fs";

interface EmbeddingCache {
  words: string[];
  embeddings: number[][];
  created: string;
}

class EmbeddingManager {
  private cache: Map<string, number[]> = new Map();
  private cacheFile = "data/embeddings.json";
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
      const words = readFileSync("data/words.txt", "utf-8")
        .split("\n")
        .filter(Boolean)
        .map((w) => w.trim());

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