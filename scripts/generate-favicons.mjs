import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const srcAppDir = join(rootDir, 'src', 'app');

// "T8" favicon - bold, clean, transparent background
// White "T", red "8" matching the accent color #e50914
function createT8Svg(size) {
  const fontSize = Math.round(size * 0.65);
  const y = Math.round(size * 0.72);
  // Shift text slightly left so T8 is visually centered
  const x = Math.round(size * 0.5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <text x="${x}" y="${y}" text-anchor="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900"
    font-size="${fontSize}px"
    letter-spacing="-${Math.max(1, Math.round(size * 0.03))}">
    <tspan fill="#ededed">T</tspan><tspan fill="#e50914">8</tspan>
  </text>
</svg>`;
}

async function generateFavicons() {
  const sizes = [
    { size: 16, name: 'favicon-16x16.png', dir: publicDir },
    { size: 32, name: 'favicon-32x32.png', dir: publicDir },
    { size: 48, name: 'favicon-48x48.png', dir: publicDir },
    { size: 180, name: 'apple-touch-icon.png', dir: publicDir },
    { size: 192, name: 'icon-192.png', dir: publicDir },
    { size: 512, name: 'icon-512.png', dir: publicDir },
  ];

  for (const { size, name, dir } of sizes) {
    const svg = createT8Svg(size);
    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    const outputPath = join(dir, name);
    writeFileSync(outputPath, buffer);
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  // Generate ICO from the PNG versions
  const png16 = await sharp(join(publicDir, 'favicon-16x16.png')).png().toBuffer();
  const png32 = await sharp(join(publicDir, 'favicon-32x32.png')).png().toBuffer();
  const png48 = await sharp(join(publicDir, 'favicon-48x48.png')).png().toBuffer();

  const icoBuffer = createIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
    { size: 48, data: png48 },
  ]);

  writeFileSync(join(srcAppDir, 'favicon.ico'), icoBuffer);
  console.log('Generated: src/app/favicon.ico (16+32+48)');

  console.log('\nAll favicons generated!');
}

function createIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * images.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const dirEntries = Buffer.alloc(dirSize);
  let offset = headerSize + dirSize;

  for (let i = 0; i < images.length; i++) {
    const { size, data } = images[i];
    const entryOffset = i * dirEntrySize;

    dirEntries.writeUInt8(size < 256 ? size : 0, entryOffset);
    dirEntries.writeUInt8(size < 256 ? size : 0, entryOffset + 1);
    dirEntries.writeUInt8(0, entryOffset + 2);
    dirEntries.writeUInt8(0, entryOffset + 3);
    dirEntries.writeUInt16LE(1, entryOffset + 4);
    dirEntries.writeUInt16LE(32, entryOffset + 6);
    dirEntries.writeUInt32LE(data.length, entryOffset + 8);
    dirEntries.writeUInt32LE(offset, entryOffset + 12);

    offset += data.length;
  }

  return Buffer.concat([header, dirEntries, ...images.map(i => i.data)]);
}

generateFavicons().catch(console.error);
