"""
Remove frame-06, swap frame-07 and frame-08.
"""
import shutil
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

# Current: 00,01,02,03,04,05, 06(delete), 07,08, 09,10
# Result:  00,01,02,03,04,05, 08,07, 09,10
keep = [0,1,2,3,4,5, 8,7, 9,10]

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
