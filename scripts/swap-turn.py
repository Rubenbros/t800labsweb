"""
Reorder turn frames: current 8→6, 6→7, 7→8
Rest stays the same.
"""
import shutil
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

# Current: 0,1,2,3,4,5, 6,7,8, 9,10,11
# New:     0,1,2,3,4,5, 8,6,7, 9,10,11
order = [0,1,2,3,4,5, 8,6,7, 9,10,11]

for i, old_idx in enumerate(order):
    src = os.path.join(out_dir, f"frame-{old_idx:02d}.png")
    dst = os.path.join(out_dir, f"temp-{i:02d}.png")
    shutil.copy2(src, dst)

for f in os.listdir(out_dir):
    if f.startswith("frame-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

for i in range(len(order)):
    src = os.path.join(out_dir, f"temp-{i:02d}.png")
    dst = os.path.join(out_dir, f"frame-{i:02d}.png")
    os.rename(src, dst)

print("Done")
