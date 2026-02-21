"""
Reorder and rename selected frames for the Bond barrel sequence.
Discard frames 06 (two figures), 13, 14 (too rotated), 15 (muzzle flash only).
"""
import shutil
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

# Selected frames in sequence order (old index -> new index)
selected = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]

# First, rename to temp names to avoid conflicts
for i, old_idx in enumerate(selected):
    src = os.path.join(out_dir, f"frame-{old_idx:02d}.png")
    dst = os.path.join(out_dir, f"temp-{i:02d}.png")
    shutil.copy2(src, dst)

# Delete all old frame-XX files
for f in os.listdir(out_dir):
    if f.startswith("frame-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

# Rename temp to final
for i in range(len(selected)):
    src = os.path.join(out_dir, f"temp-{i:02d}.png")
    dst = os.path.join(out_dir, f"frame-{i:02d}.png")
    os.rename(src, dst)
    print(f"frame-{i:02d}.png (was frame-{selected[i]:02d})")

print(f"\nTotal: {len(selected)} frames")
