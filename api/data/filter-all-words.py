import re

# Read input file
with open('all-words.txt', 'r', encoding='utf-8') as file:
    words = file.readlines()

# Process words
filtered_words = []
for word in words:
    word = word.strip().lower()
    
    # Skip comments and empty lines
    if '#!comment' in word or not word:
        continue
        
    # Skip words 3 chars or less
    if len(word) <= 3:
        continue
        
    # Check if word contains only English letters
    if not re.match('^[a-z]+$', word):
        continue
        
    filtered_words.append(word)

# Write output
with open('all-words.txt', 'w', encoding='utf-8') as file:
    file.write('\n'.join(filtered_words))