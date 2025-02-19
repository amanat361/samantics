def filter_similar_words():
    print("Starting word filtering process...")
    
    # Read existing words
    with open('target-words.txt', 'r') as file:
        words = [line.strip() for line in file.readlines()]
    
    print(f"Initial word count: {len(words)}")
    
    words_to_remove = set()
    for word in words:
        # Check for 's' endings
        if word.endswith('s'):
            base_word = word[:-1]
            if base_word in words:
                words_to_remove.add(word)
                print(f"Removing plural: {word} (base word: {base_word})")
        
        # Check for 'ing' endings
        if word.endswith('ing'):
            base_word = word[:-3]
            if base_word in words:
                words_to_remove.add(word)
                print(f"Removing ing form: {word} (base word: {base_word}")
    
    # Filter out the words
    filtered_words = [w for w in words if w not in words_to_remove]
    filtered_words.sort()
    
    print(f"\nRemoved {len(words_to_remove)} words")
    print(f"Final word count: {len(filtered_words)}")
    
    # Write back to file
    with open('target-words.txt', 'w') as file:
        for word in filtered_words:
            file.write(word + '\n')

def extract_and_combine():
    words = set()
    
    # Process both files
    for filename in ['english-long.txt', 'english-medium.txt']:
        try:
            with open(filename, 'r') as file:
                lines = file.readlines()
                # Get lines 20-120 (indices 19-119)
                selected_lines = lines[19:120]
                words.update(line.strip() for line in selected_lines)
        except FileNotFoundError:
            print(f"Could not find {filename}")
            return
    
    # Sort and write to new file
    sorted_words = sorted(words)
    print(f"Combined {len(sorted_words)} words from source files")
    with open('target-words.txt', 'w') as outfile:
        for word in sorted_words:
            outfile.write(word + '\n')

if __name__ == "__main__":
    extract_and_combine()
    filter_similar_words()