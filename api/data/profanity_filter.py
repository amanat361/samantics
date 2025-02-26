from better_profanity import profanity

class ProfanityFilter:
    def __init__(self):
        self.blacklist = set()
        # Initialize better_profanity
        profanity.load_censor_words()
        self.load_minimal_blacklist()

    def load_minimal_blacklist(self):
        """Load only the most explicit inappropriate terms"""
        # Extreme slurs and explicit sexual terms only
        # This should be a very small set of unambiguously inappropriate words
        self.blacklist = {
            # Add explicit slurs and extremely inappropriate terms only
            # Better to start minimal and add more if needed
        }

    def is_inappropriate(self, word):
        """Simple check for explicit profanity only"""
        word = word.lower().strip()
        
        # Check better_profanity first
        if profanity.contains_profanity(word):
            return True, "profanity library match"

        # Direct blacklist check
        if word in self.blacklist:
            return True, "blacklist match"

        return False, ""

def main():
    print("Initializing profanity filter...")
    filter = ProfanityFilter()

    print("Processing words...")
    kept_words = set()
    removed_words = {}

    with open('hints.txt', 'r', encoding='utf-8') as file:
        words = {word.strip().lower() for word in file.readlines()}

    total = len(words)
    for i, word in enumerate(words, 1):
        if i % 1000 == 0:
            print(f"Processed {i}/{total} words...")
            
        inappropriate, reason = filter.is_inappropriate(word)
        if inappropriate:
            removed_words[word] = reason
        else:
            kept_words.add(word)

    with open('hints.txt', 'w', encoding='utf-8') as file:
        file.write('\n'.join(sorted(kept_words)))

    with open('inappropriate_removed.log', 'w', encoding='utf-8') as file:
        file.write("Removed words and reasons:\n")
        file.write("========================\n")
        for word, reason in sorted(removed_words.items()):
            file.write(f"{word}: {reason}\n")

    print(f"""
    Processing complete:
    Original words: {len(words)}
    Kept words: {len(kept_words)}
    Removed words: {len(removed_words)}
    Check inappropriate_removed.log for details on removals
    """)

if __name__ == "__main__":
    main()