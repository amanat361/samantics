# Building Samantics: A Technical Journey

This document outlines the technical challenges, design decisions, and lessons learned while building Samantics - a semantic word guessing game.

## Architecture Overview

Samantics consists of two primary components:
1. A Bun/TypeScript API backend handling word embeddings and game logic
2. A React/TypeScript frontend delivering the user interface

What makes this project unique is its reliance on semantic word embeddings to determine similarity between words, rather than traditional character-based similarity.

## Key Technical Challenges

### 1. Embedding Generation and Management

The core of Samantics is the `embeddings.ts` file, which handles:
- Loading and caching word embeddings
- Calculating semantic similarity between words
- Managing a similarity graph for quick lookups

#### Embedding Model Access

One of the biggest challenges was accessing an embedding model efficiently. I set up a local Ollama instance running the Nomic Embed Text model on my RTX 3080 GPU. This worked great locally, but presented challenges for remote access:

```typescript
// The original solution in embeddings.ts
constructor() {
  this.OLLAMA_URL = `${process.env.CLOUDFLARE_URL}/api/embed`;
  this.headers = {
    Accept: "application/json",
    "Cf-Access-Client-Id": process.env.CLOUDFLARE_ID || "",
    "Cf-Access-Client-Secret": process.env.CLOUDFLARE_SECRET || "",
  };
  // ...
}
```

I learned that the Ollama API isn't designed for remote use out of the box. This led me to explore Cloudflare Zero Trust tunnels to securely expose my local model to the internet.

#### Setting up the Cloudflare Tunnel

1. Created a Cloudflare Zero Trust account
2. Set up a tunnel to my local machine
3. Configured API authentication with Cloudflare Access
4. Created service tokens for secure access

This approach gave me the benefits of using my powerful local GPU while making the API accessible from anywhere. It was a significant learning experience in both API security and cloud networking.

#### Embedding Cache Implementation

Rather than using a dedicated vector database (which would have been ideal for a larger-scale application), I implemented a more straightforward solution using JSON files:

```typescript
private saveCache() {
  const data: EmbeddingCache = {
    words: Array.from(this.cache.keys()),
    embeddings: Array.from(this.cache.values()),
    created: new Date().toISOString(),
  };
  writeFileSync(this.cacheFile, JSON.stringify(data));
}
```

This approach worked surprisingly well, with Bun efficiently handling large JSON files. The `seedEmbeddings()` method precomputes embeddings for common words, significantly improving response times for most users.

### 2. Similarity Calculation and Optimization

Computing word similarity was central to the game experience. I implemented cosine similarity as the core metric:

```typescript
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
```

I encountered some surprising edge cases:
1. Precision errors sometimes produced similarity scores slightly above 1.0
2. Computing similarity repeatedly for the same words was inefficient

To address these issues, I implemented:
1. Epsilon checking and clamping for mathematical robustness
2. A similarity graph cache to precompute relationships between words

### 3. The Hint System Challenge

Creating an effective hint system proved extraordinarily difficult. Several issues surfaced:

#### Problem 1: Relevance vs. Redundancy

Early attempts produced hints that were either:
- Too similar to the target word (making the game trivial)
- Too dissimilar (making hints unhelpful)
- Too similar to each other (providing redundant information)

For example, with target word "respect":
- "respecting" is too close to the target (just a suffix change)
- "disrespect" reveals too much of the target word
- "admire," "revere," and "venerate" are semantically similar to each other

#### Problem 2: Progressive Difficulty

I wanted hints to provide a gradual path toward the answer, but embedding spaces aren't linearly structured. Words with 85% similarity could be more conceptually distant than words with 75% similarity depending on the semantic context.

#### Solution: Hierarchical Filtering

I implemented a multi-stage filtering process in `filter-hints.py`:

```python
# Remove related word forms
suffixes = ['ed', 'ing', 'ion', 's', 'es', 'ned', 'er', 'est', 'ly', 'ment', 
            'ness', 'ful', 'less', 'able', 'ible']
for suffix in suffixes:
    if word.endswith(suffix):
        root = word[:-len(suffix)]
        if root in existing_words:
            return False, f"root form '{root}' exists"
```

This approach:
1. Eliminated direct word variations (plurals, -ing forms, etc.)
2. Filtered out words with common prefixes when the root exists
3. Removed uncommon character combinations
4. Applied clustering to select diverse semantic neighbors

The resulting hint system now provides a more natural progression toward the target word while avoiding redundancy.

### 4. Containerization with Docker

This was my first project using Docker, and the learning curve was significant. I created a multi-container setup:

```yaml
# docker-compose.yml
version: '3'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - api

  api:
    build:
      context: ./api
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - CLOUDFLARE_URL=${CLOUDFLARE_URL}
      - CLOUDFLARE_ID=${CLOUDFLARE_ID}
      - CLOUDFLARE_SECRET=${CLOUDFLARE_SECRET}
    volumes:
      - ./api/data:/app/data
```

Key lessons from Docker implementation:
1. Ensuring data persistence with volume mounts
2. Managing environment variables across containers
3. Optimizing build processes for smaller images
4. Handling inter-container dependencies

The `deploy.sh` script automates the build and deployment process, making updates straightforward.

### 5. Bun as a Runtime

Using Bun for the backend was a deliberate choice to explore this new JavaScript runtime:

```typescript
// Bun API Server in api.ts
const server = serve({
  port: 3000,
  development: true,
  async fetch(request: Request) {
    // Route handling...
  }
});
```

Benefits I discovered:
1. Extremely fast startup times
2. Excellent TypeScript integration
3. Built-in handling of environment variables
4. Superior performance for JSON parsing/stringifying
5. Simple API server implementation

I'm excited about Bun's new dev server functionality in upcoming releases, which should make development even more streamlined.

## Frontend Implementation

The frontend uses React with TypeScript and Tailwind CSS. Key components include:

### Game State Management

I implemented a custom hook `useSemantleGame` to manage the game state:

```typescript
// Part of useSemantleGame hook
const submitGuess = async (guess: string) => {
  // Prevent duplicate guesses
  if (previousGuesses.some(g => g.word.toLowerCase() === guess.toLowerCase())) {
    setError("You've already guessed that word!");
    return;
  }

  setIsLoading(true);
  try {
    // Calculate similarity on the server
    const response = await fetch(`${API_URL}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: guess, target: targetWord }),
    });
    
    // Process result and update game state
    // ...
  } catch (error) {
    setError("Failed to submit guess. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

This approach centralizes game logic and makes components more focused on presentation.

### Color Interpolation for Feedback

One interesting challenge was creating a smooth color gradient to reflect similarity scores. Drawing from my previous experience with D3 and color interpolations (as showcased on my portfolio site, saminamanat.com), I implemented a custom interpolation function:

```typescript
// In gameHelpers.ts
export function getColorForSimilarity(similarity: number): string {
  // Map from -1...1 to 0...1
  const normalizedSimilarity = (similarity + 1) / 2;
  
  // Use different gradients for different ranges
  if (normalizedSimilarity < 0.5) {
    // Cool colors for dissimilar words
    return interpolateColors(
      "rgb(59, 130, 246)", // blue
      "rgb(16, 185, 129)", // green
      normalizedSimilarity * 2
    );
  } else {
    // Warm colors for similar words
    return interpolateColors(
      "rgb(16, 185, 129)", // green
      "rgb(239, 68, 68)",  // red
      (normalizedSimilarity - 0.5) * 2
    );
  }
}
```

I found that a simple linear interpolation didn't provide enough visual contrast between different similarity levels. The solution was to use a two-part gradient that emphasizes the transitions:
1. Blue to green for less similar words (normalized similarity 0-0.5)
2. Green to red for more similar words (normalized similarity 0.5-1.0)

This provides intuitive visual feedback without explicitly giving away the exact similarity values, creating an engaging experience where players can "feel" they're getting closer to the target word.

### Weighting and Display Challenges

One of the more subtle challenges was getting the "weights" right. The raw similarity scores from the embedding model weren't always intuitive for players. For example:

- Words with 0.6 similarity might feel very distant to human players
- The difference between 0.8 and 0.9 similarity can be enormous in terms of semantic closeness

I experimented with different scaling functions:

```typescript
// Applied to raw similarity scores for better "feel"
function adjustSimilarityForDisplay(rawSimilarity) {
  // Emphasize differences in the high range (0.7-1.0)
  if (rawSimilarity > 0.7) {
    // Scale 0.7-1.0 range to be more pronounced
    const normalized = (rawSimilarity - 0.7) / 0.3;
    return 0.7 + (Math.pow(normalized, 0.7) * 0.3);
  }
  return rawSimilarity;
}
```

This adjustment made the game more intuitive - players could "feel" they were getting closer to the answer as the colors and scores changed.

## Frontend Implementation and User Feedback

The frontend development was iterative, driven heavily by user feedback. I shared early versions with family, friends, and Discord communities, collecting valuable insights.

### Key User-Driven Improvements

1. **Difficulty Balancing**: The initial version was consistently described as "too hard" - players would get stuck and give up.

   Solution: Added progressive hints and improved the feedback system.

2. **Game Modes**: Users wanted more flexibility in how they played.

   Solution: Added both daily challenge and random word modes.

3. **Visual Feedback**: Early testers struggled to understand how close they were to the solution.

   Solution: Enhanced the color system and added "getting warmer/colder" indicators.

4. **Mobile Experience**: Initial implementation was desktop-focused.

   Solution: Rebuilt UI components with responsive design principles.

```tsx
// Mobile-responsive guess display component
const GuessDisplay = ({ guesses, isLoading }) => {
  return (
    <div className="w-full overflow-auto max-h-[50vh] md:max-h-[60vh] px-2">
      <table className="w-full table-auto border-collapse">
        <thead className="sticky top-0 bg-slate-800 z-10">
          <tr className="text-left border-b border-slate-600">
            <th className="p-2 w-16 text-center">#</th>
            <th className="p-2">Word</th>
            <th className="p-2 text-right w-24">Similarity</th>
          </tr>
        </thead>
        <tbody>
          {guesses.map((guess, index) => (
            <GuessRow key={index} guess={guess} index={index} />
          ))}
          {isLoading && <LoadingRow />}
        </tbody>
      </table>
    </div>
  );
};
```

### Result Tracking and Sharing

A feature frequently requested was the ability to track progress and share results:

```tsx
const generateShareableResult = () => {
  const guessCount = gameState.guesses.length;
  const percentile = calculatePercentile(gameState.bestSimilarity);
  
  return `Samantics #${gameState.dayNumber} - ${gameState.solved ? '💯' : '❌'}\n` +
    `Guesses: ${guessCount}\n` +
    `Best Match: ${percentile}%\n` +
    `${window.location.origin}`;
};
```

This social element dramatically increased user engagement and retention.

## Lessons Learned

### What Worked Well

1. **JSON-based caching**: For this scale, simple file-based caching worked surprisingly well.
2. **Bun runtime**: Excellent performance characteristics and developer experience.
3. **Cloudflare tunnel**: Made local GPU resources available securely through the internet.
4. **Word filtering approach**: The multi-stage filtering process ultimately produced good hint results.
5. **User-driven development**: Continuously incorporating feedback led to a much better product.
6. **Color feedback system**: The visual representation of progress helped keep players engaged.

### What I'd Do Differently

1. **Use a proper vector database**: For larger scale, a dedicated vector DB like Pinecone or Weaviate would be more robust.
2. **Implement better test coverage**: The project would benefit from automated tests, especially for the word filtering and similarity calculations.
3. **Develop a more sophisticated hint clustering algorithm**: While the current approach works, a more advanced algorithm could provide an even better progression of hints.
4. **Improve deployment automation**: A CI/CD pipeline would streamline updates.
5. **Start with a responsive design**: Building for mobile first would have saved refactoring time.

## Conclusion

Building Samantics has been a journey through several technologies and concepts:
- Embedding models and semantic similarity
- Secure API access via Cloudflare tunnels
- Docker containerization
- Bun as a server runtime
- React state management patterns
- UX design and feedback incorporation

The most challenging aspect was surprisingly not the technical implementation, but finding the right balance to make the game engaging without being frustrating. This required multiple iterations of data filtering, testing, and most importantly, listening to users.

The project demonstrates my ability to:
1. Solve complex technical challenges (embedding handling, similarity calculations)
2. Learn and implement new technologies (Bun, Cloudflare tunnels, Docker)
3. Build intuitive user interfaces (responsive design, color feedback)
4. Iterate based on user feedback (difficulty adjustments, game modes)
5. Create a complete, production-ready application

For anyone looking to build a similar application, I'd recommend starting with a clear understanding of your embedding model's characteristics, developing rigorous filtering criteria for your word corpus early in the process, and most importantly, testing with real users from the start.