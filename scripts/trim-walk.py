"""
Remove second walk loop (frames 06-11).
Keep: 00-05 (walk x1), 12-13 (turn), 14-16 (aim)
"""
import shutil
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

keep = [0,1,2,3,4,5, 12,13, 14,15,16]

for i, old_idx in enumerate(keep):
    src = os.path.join(out_dir, f"frame-{old_idx:02d}.png")
    dst = os.path.join(out_dir, f"temp-{i:02d}.png")
    shutil.copy2(src, dst)

for f in os.listdir(out_dir):
    if f.startswith("frame-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

for i in range(len(keep)):
    src = os.path.join(out_dir, f"temp-{i:02d}.png")
    dst = os.path.join(out_dir, f"frame-{i:02d}.png")
    os.rename(src, dst)

print(f"Total: {len(keep)} frames")
