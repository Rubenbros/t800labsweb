const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const INPUT = path.join(__dirname, "../public/bond-sprite-raw.png");
const OUTPUT_DIR = path.join(__dirname, "../public/bond-frames");

const IMG_W = 1792;
const IMG_H = 2400;
const ROW_H = 800;

const rows = [
  { cols: 7, label: "walk" },
  { cols: 7, label: "turn" },
  { cols: 5, label: "shoot" },
];

// Skip frames with overlapping adjacent figures
// Skip ALL frames with any adjacent figure bleeding
const SKIP_INDICES = new Set([1, 3, 4, 5, 8, 10, 11, 12, 15, 16, 17, 18]);

const WHITE_THRESHOLD = 230;

async function makeWhiteTransparent(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > WHITE_THRESHOLD && data[i + 1] > WHITE_THRESHOLD && data[i + 2] > WHITE_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

async function split() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const oldFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith("frame-"));
  for (const f of oldFiles) fs.unlinkSync(path.join(OUTPUT_DIR, f));

  let srcIndex = 0;
  let outIndex = 0;

  for (let r = 0; r < rows.length; r++) {
    const { cols, label } = rows[r];
    const colW = Math.floor(IMG_W / cols);

    for (let c = 0; c < cols; c++) {
      if (SKIP_INDICES.has(srcIndex)) {
        console.log(`  SKIP grid[${r}][${c}] (${label} ${c + 1}/${cols})`);
        srcIndex++;
        continue;
      }

      // Extract FULL cell — no crop margins
      const left = c * colW;
      const top = r * ROW_H;
      const width = Math.min(colW, IMG_W - left);
      const height = ROW_H;

      const frameNum = String(outIndex).padStart(2, "0");
      const filename = `frame-${frameNum}.png`;

      // 1. Extract full cell
      // 2. Flip horizontally (walk right)
      // 3. Make white transparent
      // 4. Trim whitespace automatically
      const extracted = await sharp(INPUT)
        .extract({ left, top, width, height })
        .flop()
        .png()
        .toBuffer();

      const transparent = await makeWhiteTransparent(extracted);

      // Trim removes transparent borders automatically
      const trimmed = await sharp(transparent)
        .trim()
        .png()
        .toBuffer();

      const meta = await sharp(trimmed).metadata();
      await sharp(trimmed).toFile(path.join(OUTPUT_DIR, filename));

      console.log(`${filename} ← grid[${r}][${c}] (${label} ${c + 1}/${cols}) — ${meta.width}x${meta.height} [trimmed]`);
      outIndex++;
      srcIndex++;
    }
  }

  console.log(`\nDone: ${outIndex} clean frames, trimmed + transparent bg`);
}

split().catch(console.error);
