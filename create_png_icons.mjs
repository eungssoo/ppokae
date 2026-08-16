import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to create an uncompressed RGBA PNG
function createPng(width, height, drawFn) {
  const buffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // Raw image data with scanline filter byte 0
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // Filter None
    buffer.copy(rawData, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

// CRC-32 table calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Icon generator (Indigo to Pink rounded gradient with golden planet)
function drawIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  // Background Gradient (Deep Indigo #312e81 to Pink #ec4899)
  let r = Math.round(49 + (236 - 49) * (nx * 0.5 + ny * 0.5));
  let g = Math.round(46 + (72 - 46) * (nx * 0.5 + ny * 0.5));
  let b = Math.round(129 + (153 - 129) * (nx * 0.5 + ny * 0.5));

  // Golden Planet Core in Center
  const planetR = w * 0.28;
  if (dist < planetR) {
    const factor = 1 - dist / planetR;
    r = Math.min(255, Math.round(250 * factor + r * (1 - factor)));
    g = Math.min(255, Math.round(204 * factor + g * (1 - factor)));
    b = Math.min(255, Math.round(21 * factor + b * (1 - factor)));
  }

  // Planet Ring
  const dx = (x - cx);
  const dy = (y - cy) * 2.2;
  const ringDist = Math.sqrt(dx ** 2 + dy ** 2);
  if (ringDist > w * 0.32 && ringDist < w * 0.42) {
    r = 251;
    g = 191;
    b = 36;
  }

  return [r, g, b, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192, drawIcon));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512, drawIcon));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(192, 192, drawIcon));

console.log('✅ PWA Icons successfully generated!');
