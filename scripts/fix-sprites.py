"""
Fix sprites:
1. Mirror horizontally (flip walking direction)
2. Print dimensions for correct aspect ratio
"""
from PIL import Image
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

max_w = 0
max_h = 0

for f in sorted(os.listdir(out_dir)):
    if not f.startswith("frame-") or not f.endswith(".png"):
        continue
    path = os.path.join(out_dir, f)
    img = Image.open(path)
    # Mirror horizontally
    img = img.transpose(Image.FLIP_LEFT_RIGHT)
    img.save(path)
    max_w = max(max_w, img.size[0])
    max_h = max(max_h, img.size[1])
    print(f"{f}: {img.size[0]}x{img.size[1]}")

print(f"\nMax dimensions: {max_w}x{max_h}")
print(f"Aspect ratio: {max_w/max_h:.3f}")
print(f"If height=20%, width should be: {20 * max_w/max_h:.1f}%")
