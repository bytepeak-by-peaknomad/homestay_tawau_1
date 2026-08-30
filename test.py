# Number of lines for the pattern
n = 5

# Increasing pattern: from 1 to n stars
print("Increasing pattern:")
for i in range(1, n + 1):
    print('*' * i)

# Blank line for separation
print()

# Inverted (decreasing) pattern: from n down to 1 star
print("Inverted pattern:")
for i in range(n, 0, -1):
    print('*' * i)