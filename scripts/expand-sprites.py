"""
Expand frames by repeating walk cycle and holding aim pose.
Source: frame-00 to frame-11 (12 unique frames)
Output: final-00 to final-18 (19 frames with repeats)
"""
import shutil
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

# Sequence with repeats (indices into the 12 unique frames)
sequence = [
    # Walk cycle x2
    0, 1, 2, 3, 4, 5,
    0, 1, 2, 3, 4, 5,
    # Turn toward camera
    6, 7, 8, 9,
    # Aim and hold
    10, 11, 11,
]

# Copy unique frames to temp
for i in range(12):
    src = os.path.join(out_dir, f"frame-{i:02d}.png")
    dst = os.path.join(out_dir, f"unique-{i:02d}.png")
    shutil.copy2(src, dst)

# Delete old frame files
for f in os.listdir(out_dir):
    if f.startswith("frame-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

# Create expanded sequence
for new_idx, src_idx in enumerate(sequence):
    src = os.path.join(out_dir, f"unique-{src_idx:02d}.png")
    dst = os.path.join(out_dir, f"frame-{new_idx:02d}.png")
    shutil.copy2(src, dst)
    print(f"frame-{new_idx:02d}.png <- unique-{src_idx:02d}")

# Clean up temp
for f in os.listdir(out_dir):
    if f.startswith("unique-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

print(f"\nTotal: {len(sequence)} frames")
