from collections import defaultdict

def get_root_forms(word):
    """Returns possible root forms of a word based on common suffixes and prefixes"""
    suffixes = ['ed', 'ing', 'ion', 's', 'es', 'ned', 'er', 'est', 'ly', 'ment', 
                'ness', 'ful', 'less', 'able', 'ible']
    prefixes = ['un', 're', 'dis', 'over', 'under', 'pre', 'post', 'non', 'anti', 
                'sub', 'super']
    
    possible_roots = set()
    
    # Check suffixes
    for suffix in suffixes:
        if word.endswith(suffix):
            possible_roots.add(word[:-len(suffix)])
            # Handle double letters (e.g., planned -> plan)
            if len(word) > len(suffix) + 1 and word[-len(suffix)-1] == word[-len(suffix)-2]:
                possible_roots.add(word[:-len(suffix)-1])
    
    # Check prefixes
    for prefix in prefixes:
        if word.startswith(prefix):
            possible_roots.add(word[len(prefix):])
    
    return possible_roots

# Read words file
with open('words.txt', 'r', encoding='utf-8') as file:
    words = {word.strip().lower() for word in file.readlines()}

# Create word length buckets for faster processing
length_buckets = defaultdict(set)
for word in words:
    length_buckets[len(word)].add(word)

kept_words = set()
removed_words = {}

# Process words from shortest to longest
for length in sorted(length_buckets.keys()):
    for word in length_buckets[length]:
        # Skip if word was already marked for removal
        if word in removed_words:
            continue
            
        # Get possible root forms
        roots = get_root_forms(word)
        
        # Check if any root form exists in kept_words
        is_derived = False
        for root in roots:
            if root in kept_words:
                removed_words[word] = f"Derived from '{root}'"
                is_derived = True
                break
        
        # If word is not derived, check if it's a root for any previously kept word
        if not is_derived:
            kept_words.add(word)

# Write filtered words to hints.txt
with open('hints.txt', 'w', encoding='utf-8') as file:
    file.write('\n'.join(sorted(kept_words)))

# Write removal log
with open('removed_words.log', 'w', encoding='utf-8') as file:
    for word, reason in removed_words.items():
        file.write(f"{word}: {reason}\n")

print(f"Process complete:")
print(f"Original words: {len(words)}")
print(f"Kept words: {len(kept_words)}")
print(f"Removed words: {len(removed_words)}")
print("Check removed_words.log for details on removals")