"""
Build final frame sequence from raw files, normalize and save.
Walk: raw 00-05
Turn: raw 08, 09, 11, 06 (progressive side→frontal)
Aim:  raw 12, 13 (hold)
"""
from PIL import Image
import os

out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

sequence = [0, 1, 2, 3, 4, 5, 8, 9, 11, 6, 12, 13]

# Load raw frames
raw_frames = []
for idx in sequence:
    path = os.path.join(out_dir, f"raw-{idx:02d}.png")
    raw_frames.append(Image.open(path).convert("RGBA"))

# Find max dimensions for normalization
max_w = max(f.size[0] for f in raw_frames)
max_h = max(f.size[1] for f in raw_frames)
print(f"Normalizing to {max_w}x{max_h}")

# Clean all files
for f in os.listdir(out_dir):
    if f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

# Save normalized frames
for i, frame in enumerate(raw_frames):
    w, h = frame.size
    canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
    x_offset = (max_w - w) // 2
    y_offset = max_h - h  # bottom-align
    canvas.paste(frame, (x_offset, y_offset))
    path = os.path.join(out_dir, f"frame-{i:02d}.png")
    canvas.save(path)
    print(f"frame-{i:02d} <- raw-{sequence[i]:02d} ({w}x{h})")

print(f"\nFinal: {len(sequence)} frames")
print("Walk: 0-5 | Turn: 6-9 | Aim: 10-11")
