export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

export const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

export const rgbToCmyk = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
};

export const getLuminance = (r: number, g: number, b: number) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const getContrastRatio = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getWcagLevel = (ratio: number) => {
  if (ratio >= 7) return { level: "AAA", color: "bg-green-500" };
  if (ratio >= 4.5) return { level: "AA", color: "bg-yellow-500" };
  if (ratio >= 3) return { level: "AA Large", color: "bg-orange-500" };
  return { level: "Échec", color: "bg-red-500" };
};

export const generatePaletteColors = (hsl: { h: number; s: number; l: number }) => ({
  monochromatic: [-40, -20, 0, 20, 40].map(offset => {
    const l = Math.max(0, Math.min(100, hsl.l + offset));
    const { r, g, b } = hslToRgb(hsl.h, hsl.s, l);
    return rgbToHex(r, g, b);
  }),
  complementary: (() => {
    const { r, g, b } = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
    return rgbToHex(r, g, b);
  })(),
  triadic: [0, 120, 240].map(offset => {
    const { r, g, b } = hslToRgb((hsl.h + offset) % 360, hsl.s, hsl.l);
    return rgbToHex(r, g, b);
  }),
  analogous: [-30, -15, 0, 15, 30].map(offset => {
    const { r, g, b } = hslToRgb((hsl.h + offset + 360) % 360, hsl.s, hsl.l);
    return rgbToHex(r, g, b);
  }),
  splitComplementary: [0, 150, 210].map(offset => {
    const { r, g, b } = hslToRgb((hsl.h + offset) % 360, hsl.s, hsl.l);
    return rgbToHex(r, g, b);
  }),
  tetradic: [0, 90, 180, 270].map(offset => {
    const { r, g, b } = hslToRgb((hsl.h + offset) % 360, hsl.s, hsl.l);
    return rgbToHex(r, g, b);
  }),
});
