def remove_duplicates():
    # Read original words
    with open('words.txt', 'r') as f:
        words = f.read().splitlines()
    
    # Track original words for logging
    original = words.copy()
    
    # Remove duplicates while preserving order
    seen = set()
    unique_words = []
    for word in words:
        if word not in seen:
            seen.add(word)
            unique_words.append(word)
    
    # Write unique words back to file
    with open('words.txt', 'w') as f:
        f.write('\n'.join(unique_words))
    
    # Log changes
    removed = set(original) - set(unique_words)
    if removed:
        print(f"Removed {len(removed)} duplicate words:")
        for word in removed:
            print(f"- {word}")
    else:
        print("No duplicates found")

if __name__ == '__main__':
    remove_duplicates()