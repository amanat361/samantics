#!/usr/bin/env python3
"""
generate-hints.py - Comprehensive script to generate a high-quality hints.txt word list

This script:
1. Reads from popular.txt and other word sources
2. Filters out profanity and inappropriate words
3. Removes words that are derivatives of other words
4. Ensures all words meet quality criteria for the Samantics game
5. Produces a clean, filtered word list optimized for hints

Usage: python generate-hints.py
"""

import re
import os
from collections import Counter

# Try to import profanity filter if available
try:
    from better_profanity import profanity
    HAS_PROFANITY_FILTER = True
except ImportError:
    print("Warning: better_profanity module not found. Basic profanity filtering will be used.")
    print("Install with: pip install better-profanity")
    HAS_PROFANITY_FILTER = False

# Configuration
MIN_WORD_LENGTH = 5
MAX_ADDITIONAL_CHARS = 4  # Max chars beyond root to consider as derivative
OUTPUT_FILE = 'hints.txt'
REMOVED_LOG = 'removed_words.log'
POPULAR_FILE = 'popular.txt'
WORDS_FILE = 'words.txt'  # Fallback source if popular.txt isn't sufficient

# Lists for filtering
COMMON_SUFFIXES = [
    'ed', 'ing', 'ion', 's', 'es', 'ned', 'er', 'est', 'ly', 'ment', 
    'ness', 'ful', 'less', 'able', 'ible', 'ial', 'al', 'ic', 'ive', 
    'ous', 'ical', 'ize', 'ise', 'ism', 'ity', 'ian', 'ology', 'el', 
    'ary', 'ation', 'ence', 'ance', 'ment', 'ship', 'hood', 'ly', 'ways'
]

COMMON_PREFIXES = [
    'un', 're', 'dis', 'over', 'under', 'pre', 'post', 'non', 'anti', 
    'sub', 'super', 'inter', 'intra', 'co', 'de', 'en', 'em', 'ex', 
    'in', 'im', 'micro', 'macro', 'mega', 'mini', 'mono', 'multi', 
    'neo', 'out', 'para', 'poly', 'pseudo', 'semi', 'tri', 'ultra'
]

UNUSUAL_CHAR_COMBOS = [
    'uu', 'ii', 'jj', 'kk', 'qq', 'vv', 'ww', 'xx', 'yy', 'zz',
    'fq', 'jx', 'qj', 'qx', 'qz', 'vj', 'vq', 'vx', 'wx', 'xj', 'zx'
]

UNCOMMON_ENDINGS = [
    'dg', 'fk', 'gk', 'hk', 'jk', 'mk', 'nk', 'pk', 'rk', 'sk', 
    'tk', 'vk', 'wk', 'xk', 'yk', 'zk', 'jz', 'qz', 'vz', 'wz'
]

# Basic profanity list as fallback if better_profanity isn't available
BASIC_PROFANITY = {
    # This is just a minimal list - the better_profanity library has a more comprehensive list
    'ass', 'fuck', 'shit', 'damn', 'cunt', 'bitch', 'cock', 'dick',
    'bastard', 'whore', 'slut', 'pussy', 'nigger', 'nigga', 'fag',
    'faggot', 'retard', 'porn', 'anal', 'cum', 'rape', 'dildo'
}

def load_words_from_file(filename):
    """Load words from a file, handling common formats and errors."""
    words = []
    if not os.path.exists(filename):
        print(f"Warning: {filename} not found.")
        return words
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                # Skip comments and empty lines
                if line.startswith('#') or not line.strip():
                    continue
                
                # Handle possible CSV or TSV formats
                word = line.strip().split(',')[0].split('\t')[0].lower()
                if word:
                    words.append(word)
        
        print(f"Loaded {len(words)} words from {filename}")
        return words
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []

def is_inappropriate(word):
    """Check if a word is inappropriate."""
    if HAS_PROFANITY_FILTER:
        return profanity.contains_profanity(word), "profanity"
    else:
        return word in BASIC_PROFANITY, "profanity"

def has_valid_format(word):
    """Check if word has a valid English word format."""
    # Only allow letters
    if not re.match(r'^[a-z]+$', word):
        return False, "non-alphabetic characters"
    
    # Require at least one vowel
    if not any(vowel in word for vowel in 'aeiou'):
        return False, "no vowels"
    
    # Check for unusual character combinations
    for combo in UNUSUAL_CHAR_COMBOS:
        if combo in word:
            return False, f"unusual letter combination '{combo}'"
    
    # Check for uncommon endings
    for ending in UNCOMMON_ENDINGS:
        if word.endswith(ending):
            return False, f"uncommon ending '{ending}'"
    
    return True, ""

def should_keep_word(word, word_set, common_word_set):
    """
    Determines if a word should be kept based on advanced filtering rules.
    Returns (should_keep, reason_if_removed)
    
    Args:
        word: The word to check
        word_set: Set of all words being considered
        common_word_set: Set of common/popular words (these get priority)
    """
    # Check minimum length
    if len(word) < MIN_WORD_LENGTH:
        return False, f"too short (under {MIN_WORD_LENGTH} characters)"
    
    # Check for inappropriate content
    is_bad, reason = is_inappropriate(word)
    if is_bad:
        return False, reason
    
    # Check word format
    is_valid, format_reason = has_valid_format(word)
    if not is_valid:
        return False, format_reason
    
    # Always keep common/popular words
    if word in common_word_set:
        return True, ""
    
    # Check if there's a shorter word that is a root of this word
    for potential_root in word_set:
        # Skip comparison with itself
        if potential_root == word:
            continue
            
        # Only consider shorter words as potential roots
        if len(potential_root) >= len(word):
            continue
            
        # If word length diff is more than our threshold, likely not just a simple derivative
        # For example, "astro" and "astronomical" are different enough
        if len(word) - len(potential_root) > MAX_ADDITIONAL_CHARS:
            continue
        
        # Prioritize popular words
        if potential_root in common_word_set:
            # If potential root is common but current word isn't, be more aggressive
            # Check if potential_root is a prefix of the word
            if word.startswith(potential_root):
                return False, f"derived from popular root '{potential_root}'"
                
            # Check if potential_root without last letter is in the word (universe/universal case)
            if len(potential_root) > 2 and word.startswith(potential_root[:-1]):
                return False, f"derived from modified popular root '{potential_root}'"
        else:
            # Both words are not in common set - apply standard rules
            # Check if potential_root is a prefix of the word
            if word.startswith(potential_root):
                return False, f"derived from root '{potential_root}'"
    
    # Common suffixes - if root word exists, don't keep this word
    for suffix in COMMON_SUFFIXES:
        if word.endswith(suffix) and len(word) > len(suffix):
            root = word[:-len(suffix)]
            
            # Check for doubled consonants before suffixes (stopped -> stop)
            if len(root) > 1 and root[-1] == root[-2] and root[-1] not in 'aeiou':
                shorter_root = root[:-1]
                if shorter_root in word_set:
                    return False, f"root form '{shorter_root}' (with doubled consonant) exists"
                    
            # Direct check for root
            if root in word_set:
                return False, f"root form '{root}' exists"
            
            # If removing 'e' from the end of a word gives us a word in the set
            if root.endswith('e') and root[:-1] in word_set:
                return False, f"root form '{root[:-1]}' (without final e) exists"

    # Common prefixes - if root word exists, don't keep this word
    for prefix in COMMON_PREFIXES:
        if word.startswith(prefix):
            root = word[len(prefix):]
            if root in word_set:
                return False, f"root form '{root}' exists (with prefix '{prefix}')"

    return True, ""

def main():
    print(f"\n{'='*50}")
    print("SAMANTICS HINT WORD GENERATOR")
    print(f"{'='*50}\n")
    
    # Initialize profanity filter if available
    if HAS_PROFANITY_FILTER:
        profanity.load_censor_words()
        print("Profanity filter initialized.")
    
    # Load popular words first - these get priority
    popular_words = load_words_from_file(POPULAR_FILE)
    popular_words_set = set(popular_words)
    
    # Load words from main dictionary as a fallback/supplement
    words_from_dict = load_words_from_file(WORDS_FILE)
    
    # Combine and deduplicate
    all_words = list(set(popular_words + words_from_dict))
    print(f"Total unique words after combining sources: {len(all_words)}")
    
    # Sort words to prioritize processing
    # Sort first by popularity (popular words first), then by length (shorter first)
    def word_priority(word):
        is_popular = 1 if word in popular_words_set else 0
        return (-is_popular, len(word))
    
    sorted_words = sorted(all_words, key=word_priority)
    
    # Process words
    word_set = set(all_words)
    filtered_words = []
    removed_words = {}
    
    print("Processing words...")
    for i, word in enumerate(sorted_words):
        if i % 1000 == 0 and i > 0:  # Progress indicator
            print(f"Processed {i}/{len(sorted_words)} words...")
            
        keep_word, reason = should_keep_word(word, word_set, popular_words_set)
        
        if keep_word:
            filtered_words.append(word)
        else:
            removed_words[word] = reason
    
    # Final sort alphabetically for output
    filtered_words.sort()
    
    # Get some statistics on word length distribution
    lengths = Counter([len(word) for word in filtered_words])
    length_stats = sorted(lengths.items())
    
    # Write results
    print("\nWriting results...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as file:
        file.write('\n'.join(filtered_words))
    
    with open(REMOVED_LOG, 'w', encoding='utf-8') as file:
        file.write("REMOVED WORDS AND REASONS:\n")
        file.write("=========================\n\n")
        for word, reason in sorted(removed_words.items()):
            file.write(f"{word}: {reason}\n")
    
    # Print summary statistics
    print(f"""
{'='*50}
PROCESS COMPLETE
{'='*50}

Input:
- Total words processed: {len(all_words)}
- Popular words: {len(popular_words)}
- Dictionary words: {len(words_from_dict)}

Results:
- Kept words: {len(filtered_words)}
- Removed words: {len(removed_words)}

Word length distribution of final list:
{'-'*30}""")
    
    for length, count in length_stats:
        print(f"  {length} letters: {count} words")
    
    print(f"""
{'='*50}
Output files:
- {OUTPUT_FILE} - Clean, filtered word list
- {REMOVED_LOG} - Words removed with reasons
{'='*50}
""")

if __name__ == "__main__":
    main()