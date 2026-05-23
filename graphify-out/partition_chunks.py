import json
from pathlib import Path

# Load files
uncached = Path('graphify-out/.graphify_uncached.txt').read_text(encoding='utf-8-sig').splitlines()

# Filter out image files
non_images = [f for f in uncached if not any(f.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'])]

print(f"Total uncached files: {len(uncached)}")
print(f"Non-image uncached files: {len(non_images)}")

# Chunk non-images into chunks of size ~23
chunk_size = 23
chunks = [non_images[i:i + chunk_size] for i in range(0, len(non_images), chunk_size)]

for idx, chunk in enumerate(chunks):
    chunk_file = Path(f'graphify-out/chunk_{idx+1}.txt')
    chunk_file.write_text('\n'.join(chunk), encoding='utf-8')
    print(f"Chunk {idx+1}: {len(chunk)} files written to {chunk_file}")
