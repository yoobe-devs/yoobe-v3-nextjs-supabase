export type ImageInfo = { width: number; height: number; type: 'png' | 'jpeg' | 'jpg' | 'gif' | 'webp' | 'unknown' };

export function getImageSizeFromBuffer(buf: Buffer): ImageInfo | null {
  if (buf.length < 24) return null;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height, type: 'png' };
  }
  // JPEG
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xFF) { offset++; continue; }
      const marker = buf[offset + 1];
      // SOFn markers where n in [0xC0..0xC3, 0xC5..0xC7, 0xC9..0xCB, 0xCD..0xCF]
      if (
        (marker >= 0xC0 && marker <= 0xC3) ||
        (marker >= 0xC5 && marker <= 0xC7) ||
        (marker >= 0xC9 && marker <= 0xCB) ||
        (marker >= 0xCD && marker <= 0xCF)
      ) {
        const blockLength = buf.readUInt16BE(offset + 2);
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { width, height, type: 'jpeg' };
      } else {
        const blockLength = buf.readUInt16BE(offset + 2);
        offset += 2 + blockLength;
      }
    }
    return null;
  }
  // GIF
  if (buf.slice(0, 3).toString() === 'GIF') {
    const width = buf.readUInt16LE(6);
    const height = buf.readUInt16LE(8);
    return { width, height, type: 'gif' };
  }
  // WEBP (RIFF)
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
    // Simple VP8/VP8L/VP8X parsing omitted; dimensions not trivial without full parse
    return { width: 0, height: 0, type: 'webp' };
  }
  return { width: 0, height: 0, type: 'unknown' };
}

