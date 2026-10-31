const fs = require('fs');

// Simple PNG decoder for RGBA PNG
// Read chunks
const buf = fs.readFileSync('assets/images/emblem-transparent.png');
console.log('Total splash-icon length:', buf.length);
console.log('PNG Signature:', buf.toString('ascii', 1, 4));

const zlib = require('zlib');

let pos = 8;
const idatChunks = [];
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
    bitDepth = buf.readUInt8(pos + 16);
    colorType = buf.readUInt8(pos + 17);
    console.log({ width, height, bitDepth, colorType });
  } else if (type === 'IDAT') {
    idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
  } else if (type === 'IEND') {
    break;
  }
  pos += 12 + len;
}

const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);
console.log('Decompressed length:', decompressed.length);
// Row size: 1 byte filter + width * 4 bytes
const rowSize = 1 + width * 4;
console.log('Expected decompressed:', rowSize * height);

// Check corner pixel (row 0, pixel 0)
console.log('Corner pixel filter byte:', decompressed[0]);
console.log('Corner pixel RGBA:', [
  decompressed[1],
  decompressed[2],
  decompressed[3],
  decompressed[4]
]);

// Check middle pixel (row height/2, col width/2)
const midOffset = Math.floor(height / 2) * rowSize + 1 + Math.floor(width / 2) * 4;
console.log('Center pixel RGBA:', [
  decompressed[midOffset],
  decompressed[midOffset + 1],
  decompressed[midOffset + 2],
  decompressed[midOffset + 3]
]);
