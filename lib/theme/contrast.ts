function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function luminance(r: number, g: number, b: number): number {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const int = parseInt(h, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function contrastRatio(hex1: string, hex2: string): number | null {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  if (!a || !b) return null;
  const L1 = luminance(a.r, a.g, a.b) + 0.05;
  const L2 = luminance(b.r, b.g, b.b) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

export function hasAaContrast(fg: string, bg: string, large = false): boolean {
  const ratio = contrastRatio(fg, bg);
  if (ratio == null) return false;
  return ratio >= (large ? 3 : 4.5);
}

