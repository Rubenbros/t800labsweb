"""
Remove frames 12 and 14 (still look like side-walking).
Keep: 00-11 (walk), 13+15 (turn), 16-18 (aim)
Result: 17 frames
"""
import shutil
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

# Frames to keep (current indices)
keep = [0,1,2,3,4,5,6,7,8,9,10,11, 13,15, 16,17,18]

# Copy keepers to temp
for i, old_idx in enumerate(keep):
    src = os.path.join(out_dir, f"frame-{old_idx:02d}.png")
    dst = os.path.join(out_dir, f"temp-{i:02d}.png")
    shutil.copy2(src, dst)

# Delete all frame files
for f in os.listdir(out_dir):
    if f.startswith("frame-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

# Rename temp to final
for i in range(len(keep)):
    src = os.path.join(out_dir, f"temp-{i:02d}.png")
    dst = os.path.join(out_dir, f"frame-{i:02d}.png")
    os.rename(src, dst)
    print(f"frame-{i:02d}.png (was {keep[i]:02d})")

print(f"\nTotal: {len(keep)} frames")
