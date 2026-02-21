"""
Normalize all frames to the same dimensions with bottom-alignment.
This prevents Y-axis jitter during animation.
"""
from PIL import Image
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

# First pass: find max dimensions
max_w = 0
max_h = 0
frames = []

for f in sorted(os.listdir(out_dir)):
    if not f.startswith("frame-") or not f.endswith(".png"):
        continue
    path = os.path.join(out_dir, f)
    img = Image.open(path).convert("RGBA")
    max_w = max(max_w, img.size[0])
    max_h = max(max_h, img.size[1])
    frames.append((f, path, img))

print(f"Normalizing to {max_w}x{max_h}")

# Second pass: create normalized frames (centered X, bottom-aligned Y)
for fname, path, img in frames:
    w, h = img.size
    canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
    # Center horizontally, align bottom
    x_offset = (max_w - w) // 2
    y_offset = max_h - h  # bottom-align
    canvas.paste(img, (x_offset, y_offset))
    canvas.save(path)
    print(f"{fname}: {w}x{h} -> placed at ({x_offset}, {y_offset})")

print(f"\nAll frames normalized to {max_w}x{max_h}")
