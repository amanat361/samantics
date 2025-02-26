def should_keep_word(word, existing_words):
    """
    Single comprehensive function to determine if a word should be kept.
    Returns (should_keep, reason_if_removed)
    """
    # Must have at least one vowel
    if not any(vowel in word for vowel in 'aeiou'):
        return False, "no vowels"
    
    # Check for simpler forms that already exist
    if len(word) > 1:  # Only check if word is long enough
        word_without_last = word[:-1]
        if word_without_last in existing_words:
            return False, f"simpler form '{word_without_last}' exists"

    # Common suffixes - if root word exists, don't keep this word
    suffixes = ['ed', 'ing', 'ion', 's', 'es', 'ned', 'er', 'est', 'ly', 'ment', 
                'ness', 'ful', 'less', 'able', 'ible']
    for suffix in suffixes:
        if word.endswith(suffix):
            root = word[:-len(suffix)]
            # Only check for double letters if root is long enough
            if len(root) > 1:  # Need at least 2 characters to check doubles
                if root[-1] == root[-2]:
                    simpler_root = root[:-1]
                    if simpler_root in existing_words:
                        return False, f"root form '{simpler_root}' exists"
            if root in existing_words:
                return False, f"root form '{root}' exists"

    # Common prefixes - if root word exists, don't keep this word
    prefixes = ['un', 're', 'dis', 'over', 'under', 'pre', 'post', 'non', 'anti', 
                'sub', 'super']
    for prefix in prefixes:
        if word.startswith(prefix):
            root = word[len(prefix):]
            if root in existing_words:
                return False, f"root form '{root}' exists"

    # Remove words with unusual character combinations
    unusual_combos = ['uu', 'ii', 'jj', 'kk', 'qq', 'vv', 'ww', 'xx', 'yy', 'zz']
    for combo in unusual_combos:
        if combo in word:
            return False, f"unusual letter combination '{combo}'"

    # Remove words with uncommon endings
    uncommon_endings = ['dg', 'fk', 'gk', 'hk', 'jk', 'mk', 'nk', 'pk', 'rk', 'sk', 
                       'tk', 'vk', 'wk', 'xk', 'yk', 'zk']
    for ending in uncommon_endings:
        if word.endswith(ending):
            return False, f"uncommon ending '{ending}'"

    return True, ""

def main():
    print("Reading words file...")
    with open('hints.txt', 'r', encoding='utf-8') as file:
        words = {word.strip().lower() for word in file.readlines()}

    print("Processing words...")
    kept_words = set()
    removed_words = {}
    
    total = len(words)
    # Sort words by length (shortest first) to prioritize simpler forms
    for i, word in enumerate(sorted(words, key=len)):
        if i % 1000 == 0:  # Progress indicator
            print(f"Processed {i}/{total} words...")
            
        keep_word, reason = should_keep_word(word, kept_words)
        if keep_word:
            kept_words.add(word)
        else:
            removed_words[word] = reason

    print("Writing results...")
    with open('hints.txt', 'w', encoding='utf-8') as file:
        file.write('\n'.join(sorted(kept_words)))

    with open('removed_words.log', 'w', encoding='utf-8') as file:
        for word, reason in sorted(removed_words.items()):
            file.write(f"{word}: {reason}\n")

    print(f"""
    Process complete:
    Original words: {len(words)}
    Kept words: {len(kept_words)}
    Removed words: {len(removed_words)}
    Check removed_words.log for details on removals
    """)

if __name__ == "__main__":
    main()