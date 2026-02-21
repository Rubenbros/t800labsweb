"""
Final sprite sequence builder:
1. Re-cut from source with frame-06 split into two
2. Mirror all frames horizontally
3. Normalize to same dimensions (bottom-aligned)
4. Build final sequence: walk → turn → aim
"""
from PIL import Image
import numpy as np
import os

src = r"C:\Users\Rubenbros\Downloads\SPRITES.png"
out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

img = Image.open(src).convert("RGB")
W, H = img.size
pixels = np.array(img)
row_h = H // 3


def find_figures_in_row(row_pixels):
    h, w, _ = row_pixels.shape
    white_threshold = 240
    is_white_col = []
    for x in range(w):
        col = row_pixels[:, x, :]
        white_count = np.sum(np.all(col > white_threshold, axis=1))
        is_white_col.append(white_count / h > 0.95)

    figures = []
    in_figure = False
    fig_start = 0

    for x in range(w):
        if not is_white_col[x] and not in_figure:
            fig_start = x
            in_figure = True
        elif is_white_col[x] and in_figure:
            gap_end = x
            while gap_end < w and is_white_col[gap_end]:
                gap_end += 1
            gap_width = gap_end - x
            if gap_width >= 10:
                figures.append((fig_start, x))
                in_figure = False

    if in_figure:
        figures.append((fig_start, w))

    return figures


def crop_figure(fig_x_start, fig_x_end, row_i):
    row_pixels = pixels[row_i * row_h:(row_i + 1) * row_h, :, :]
    fig_pixels = row_pixels[:, fig_x_start:fig_x_end, :]
    white_threshold = 240

    top = 0
    for y in range(fig_pixels.shape[0]):
        if not np.all(fig_pixels[y, :, :] > white_threshold):
            top = y
            break

    bottom = fig_pixels.shape[0]
    for y in range(fig_pixels.shape[0] - 1, -1, -1):
        if not np.all(fig_pixels[y, :, :] > white_threshold):
            bottom = y + 1
            break

    pad = 3
    crop_x1 = max(0, fig_x_start - pad)
    crop_x2 = min(W, fig_x_end + pad)
    crop_y1 = max(0, row_i * row_h + top - pad)
    crop_y2 = min(H, row_i * row_h + bottom + pad)

    return img.crop((crop_x1, crop_y1, crop_x2, crop_y2))


# Get all figures per row
all_frames = []

# Row 0: 6 walking frames
row0_figs = find_figures_in_row(pixels[0:row_h, :, :])
print(f"Row 0: {len(row0_figs)} figures")
for xs, xe in row0_figs:
    all_frames.append(("walk", crop_figure(xs, xe, 0)))

# Row 1: has merged pair + 4 singles
row1_figs = find_figures_in_row(pixels[row_h:2*row_h, :, :])
print(f"Row 1: {len(row1_figs)} figures (first may be merged)")

for idx, (xs, xe) in enumerate(row1_figs):
    fig_w = xe - xs
    if fig_w > 350:  # Merged - split it
        # Find the gap within this merged figure using a smaller threshold
        row_pixels = pixels[row_h:2*row_h, xs:xe, :]
        h_r = row_pixels.shape[0]
        # Scan for narrowest white gap
        min_content = []
        for x in range(row_pixels.shape[1]):
            col = row_pixels[:, x, :]
            non_white = np.sum(~np.all(col > 240, axis=1))
            min_content.append(non_white)

        # Find the valley (minimum non-white content) in the middle region
        mid_start = int(fig_w * 0.3)
        mid_end = int(fig_w * 0.7)
        min_val = min(min_content[mid_start:mid_end])
        split_x = mid_start + min_content[mid_start:mid_end].index(min_val)

        print(f"  Splitting merged figure at x={split_x} (width={fig_w})")
        all_frames.append(("turn", crop_figure(xs, xs + split_x - 5, 1)))
        all_frames.append(("turn", crop_figure(xs + split_x + 5, xe, 1)))
    else:
        all_frames.append(("turn", crop_figure(xs, xe, 1)))

# Row 2: aiming frames
row2_figs = find_figures_in_row(pixels[2*row_h:3*row_h, :, :])
print(f"Row 2: {len(row2_figs)} figures")
for xs, xe in row2_figs:
    fig_w = xe - xs
    if fig_w < 150:  # Skip tiny muzzle flash
        print(f"  Skipping tiny fragment ({fig_w}px)")
        continue
    all_frames.append(("aim", crop_figure(xs, xe, 2)))

print(f"\nTotal raw frames: {len(all_frames)}")
for i, (cat, f) in enumerate(all_frames):
    print(f"  [{i}] {cat}: {f.size[0]}x{f.size[1]}")

# Save all raw frames as raw-XX for inspection
for f in os.listdir(out_dir):
    if f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))

for i, (cat, frame) in enumerate(all_frames):
    # Mirror horizontally
    frame = frame.transpose(Image.FLIP_LEFT_RIGHT).convert("RGBA")
    path = os.path.join(out_dir, f"raw-{i:02d}.png")
    frame.save(path)

print("\nSaved as raw-XX.png for inspection")
