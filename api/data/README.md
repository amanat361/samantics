# Samantics Data Processing

This directory contains all the data files and processing scripts used to generate the word lists and manage embeddings for the Samantics word game.

## Data Files

- `words.txt` - The complete dictionary of valid words that can be guessed
- `target-words.txt` - Curated list of words that can be used as the target (secret) word
- `hints.txt` - A processed list of words used for generating hint related words
- `animals.txt` - A list of animal words (can be used for themed games)
- `embeddings.json` - Cache of word embeddings (generated at runtime, gitignored)
- `similarityGraph.json` - Precomputed similarity scores between words (generated at runtime, gitignored)
- `english-long.txt` / `english-medium.txt` - Source word lists for building target words

## Processing Scripts

### Word List Management

- `cleanup.py` - Removes duplicate words from target-words.txt while preserving order
- `combine.py` - Extracts and combines words from source lists and filters out similar words
- `filter-all-words.py` - Filters the main dictionary file to remove short words and non-English characters
- `filter-hints.py` - Processes the hints word list to remove derived forms and redundant words
- `profanity_filter.py` - Removes inappropriate words from the word lists

## How the Data Processing Works

### Word List Generation Process

1. **Initial Word Collection**: English word lists are sourced and placed in `english-long.txt` and `english-medium.txt`.

2. **Word Extraction**: `combine.py` extracts and combines these words into `target-words.txt`.

3. **Word Filtering**:
   - `filter-all-words.py` processes raw word lists to create a clean dictionary
   - `filter-hints.py` processes the hints list to remove redundant words (plurals, conjugations, etc.)
   - `profanity_filter.py` removes inappropriate content
   - `cleanup.py` removes duplicates

### Embedding Data Management

The embeddings and similarity data are managed by the main application at runtime:

1. The `embeddings.ts` file in the parent directory handles:
   - Loading existing embeddings from `embeddings.json`
   - Fetching new embeddings from the embedding API
   - Saving updated embeddings back to the cache
   - Building the similarity graph between words

2. When the API starts, it automatically initializes missing data (if necessary).

## Adding New Words

To add new target words:

1. Add words to `target-words.txt`
2. Run `cleanup.py` to deduplicate
3. Make sure all new words are also in `words.txt` (or add them there)

## Requirements for Processing Scripts

The Python scripts require:

```bash
pip install better_profanity
```

## Notes on Word Quality

The word selection process prioritizes:

1. Common, familiar words for target words
2. A broader dictionary for valid guesses
3. Removal of explicit content
4. Removal of redundant word forms (plurals, conjugations, etc.)
5. Words with good embedding representations