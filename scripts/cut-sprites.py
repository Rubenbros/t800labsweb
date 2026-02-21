"""
Cut SPRITES.png into individual frames using white-gap detection.
Instead of a fixed grid, we detect vertical white columns between figures
to find the actual boundaries of each character.
"""
from PIL import Image
import numpy as np
import os

src = r"C:\Users\Rubenbros\Downloads\SPRITES.png"
out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

img = Image.open(src).convert("RGB")
W, H = img.size  # 1792 x 2400
pixels = np.array(img)

# 3 rows of equal height
row_h = H // 3  # 800px each

# Clear old frames
for f in os.listdir(out_dir):
    if f.startswith("frame-") and f.endswith(".png"):
        os.remove(os.path.join(out_dir, f))


def find_figures_in_row(row_pixels, row_y_start):
    """
    Detect individual figures by finding vertical white gaps.
    Returns list of (x_start, x_end) for each figure.
    """
    h, w, _ = row_pixels.shape

    # For each column x, check if it's mostly white (> 95% white pixels)
    white_threshold = 240
    is_white_col = []
    for x in range(w):
        col = row_pixels[:, x, :]
        white_count = np.sum(np.all(col > white_threshold, axis=1))
        is_white_col.append(white_count / h > 0.95)

    # Find runs of non-white columns (those are figures)
    figures = []
    in_figure = False
    fig_start = 0

    for x in range(w):
        if not is_white_col[x] and not in_figure:
            fig_start = x
            in_figure = True
        elif is_white_col[x] and in_figure:
            # Need a minimum gap width to count as separator (at least 5px)
            # Look ahead to see if this is a real gap
            gap_end = x
            while gap_end < w and is_white_col[gap_end]:
                gap_end += 1
            gap_width = gap_end - x

            if gap_width >= 10:  # Real gap between figures
                figures.append((fig_start, x))
                in_figure = False
            # If gap < 10px, it's probably noise within a figure, keep going

    if in_figure:
        figures.append((fig_start, w))

    return figures


frame_idx = 0
for row_i in range(3):
    y_start = row_i * row_h
    y_end = y_start + row_h
    row_pixels = pixels[y_start:y_end, :, :]

    figures = find_figures_in_row(row_pixels, y_start)
    print(f"Row {row_i}: found {len(figures)} figures at {figures}")

    for fig_x_start, fig_x_end in figures:
        # Crop from original image
        # Add small horizontal padding
        pad_x = 3
        crop_x1 = max(0, fig_x_start - pad_x)
        crop_x2 = min(W, fig_x_end + pad_x)

        # Also trim vertical whitespace
        fig_pixels = row_pixels[:, fig_x_start:fig_x_end, :]
        white_threshold = 240

        # Find top and bottom of figure
        top = 0
        for y in range(fig_pixels.shape[0]):
            row_line = fig_pixels[y, :, :]
            if not np.all(row_line > white_threshold):
                top = y
                break

        bottom = fig_pixels.shape[0]
        for y in range(fig_pixels.shape[0] - 1, -1, -1):
            row_line = fig_pixels[y, :, :]
            if not np.all(row_line > white_threshold):
                bottom = y + 1
                break

        pad_y = 3
        crop_y1 = max(0, y_start + top - pad_y)
        crop_y2 = min(H, y_start + bottom + pad_y)

        frame = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))

        out_path = os.path.join(out_dir, f"frame-{frame_idx:02d}.png")
        frame.save(out_path)
        print(f"  Frame {frame_idx:02d}: {frame.size[0]}x{frame.size[1]} (x: {crop_x1}-{crop_x2})")
        frame_idx += 1

print(f"\nTotal frames: {frame_idx}")
