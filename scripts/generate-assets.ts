/**
 * Brand asset generator — sv.cafe, ASCII theme.
 *
 * Renders the OpenGraph / Twitter share cards and the multi-size favicon
 * from the same design tokens as the app (midday-style dark monochrome),
 * with an ASCII coffee cup as the brand mark. Pure SVG → PNG via sharp.
 *
 * Idempotent: bun run assets:generate
 *
 * Outputs:
 *   public/og.png             1200×630  (OpenGraph)
 *   public/og-twitter.png     1200×600  (Twitter summary_large_image)
 *   public/favicon.ico        16/32/48  multi-size ICO
 *   app/favicon.ico           copy — the one Next.js serves
 *   app/opengraph-image.png   copy — auto-wired by the App Router
 *   app/twitter-image.png     copy — auto-wired by the App Router
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Tokens from app/globals.css `.dark` — keep in sync by hand.
const BG = "#0d0d0d";
const FG = "#fafafa";
const MUTED = "#8f8f8f";
const BORDER = "#242424";
const DIM = "#4f4f4f";
const MONO = "'Menlo', 'Consolas', 'DejaVu Sans Mono', monospace";

// Score-tier accents (lib/ratings.ts TIER_COLORS) — the only color splash.
const TIER_COLORS = ["#16a34a", "#d97706", "#dc2626", "#a8a29e"];

// The brand mark: a coffee cup, in ASCII.
const CUP = [
  String.raw`       ) )`,
  String.raw`      ( (`,
  String.raw`       ) )`,
  String.raw`   .----------.`,
  String.raw`   |          |---.`,
  String.raw`   |          |   |`,
  String.raw`   |          |---'`,
  String.raw`    \        /`,
  String.raw`     '------'`,
  String.raw`   ____________`,
];

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function asciiBlock(
  lines: string[],
  x: number,
  top: number,
  fontSize: number,
  lineHeight: number,
  fill: string,
): string {
  return lines
    .map((line, i) => {
      if (!line.trim()) return "";
      const y = top + (i + 1) * lineHeight;
      return `<text x="${x}" y="${y}" font-family=${JSON.stringify(MONO)} font-size="${fontSize}" fill="${fill}" xml:space="preserve">${escapeXml(line)}</text>`;
    })
    .filter(Boolean)
    .join("\n  ");
}

function ogSvg(width: number, height: number): string {
  const cupFont = 30;
  const cupLine = 36;
  const cupWidth = Math.max(...CUP.map((l) => l.length)) * cupFont * 0.6;
  const cupX = width - 120 - cupWidth;
  const cupTop = (height - CUP.length * cupLine) / 2 - 10;

  const midY = height / 2;
  const squares = TIER_COLORS.map(
    (color, i) =>
      `<rect x="${104 + i * 30}" y="${midY + 64}" width="14" height="14" fill="${color}"/>`,
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BG}"/>
  <rect x="32.5" y="32.5" width="${width - 65}" height="${height - 65}" fill="none" stroke="${BORDER}"/>
  ${asciiBlock(CUP, cupX, cupTop, cupFont, cupLine, DIM)}
  <text x="104" y="${midY - 48}" font-family=${JSON.stringify(MONO)} font-size="80" font-weight="600" fill="${FG}">sv.cafe</text>
  <text x="104" y="${midY + 12}" font-family=${JSON.stringify(MONO)} font-size="27" fill="${MUTED}">Work-friendly caf&#233;s in El Salvador.</text>
  ${squares}
  <text x="${104 + TIER_COLORS.length * 30 + 12}" y="${midY + 77}" font-family=${JSON.stringify(MONO)} font-size="17" fill="${DIM}" xml:space="preserve">wifi &#183; coffee &#183; outlets &#183; meetings</text>
  <text x="104" y="${height - 78}" font-family=${JSON.stringify(MONO)} font-size="18" fill="${DIM}" xml:space="preserve">$ rate --wifi --pass-reveal ─&gt; on the map</text>
</svg>`;
}

// Pixel-art coffee cup (rect grid) — crisp at 16px where ASCII text can't be.
function faviconSvg(size: number): string {
  // 12×12 grid: steam (s), cup body (b), handle (h), saucer (p)
  const grid = [
    "            ",
    "   s   s    ",
    "    s   s   ",
    "   s   s    ",
    "            ",
    "  bbbbbbb   ",
    "  bbbbbbbhh ",
    "  bbbbbbbh  ",
    "  bbbbbbbhh ",
    "   bbbbb    ",
    "  ppppppppp ",
    "            ",
  ];
  const cell = size / 12;
  const fills: Record<string, string> = {
    s: MUTED,
    b: FG,
    h: FG,
    p: DIM,
  };
  const rects = grid
    .flatMap((row, y) =>
      [...row].map((ch, x) =>
        fills[ch]
          ? `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fills[ch]}"/>`
          : "",
      ),
    )
    .filter(Boolean)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>${rects}</svg>`;
}

// ICO container with PNG-encoded entries (valid in all modern browsers).
function packIco(pngs: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  const entries: Buffer[] = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function renderPng(svg: string, width: number, height: number) {
  return sharp(Buffer.from(svg), { density: 96 })
    .resize(width, height)
    .png()
    .toBuffer();
}

const publicDir = join(ROOT, "public");
const appDir = join(ROOT, "app");
await mkdir(publicDir, { recursive: true });

const og = await renderPng(ogSvg(1200, 630), 1200, 630);
const ogTwitter = await renderPng(ogSvg(1200, 600), 1200, 600);
await writeFile(join(publicDir, "og.png"), og);
await writeFile(join(publicDir, "og-twitter.png"), ogTwitter);
// App Router file conventions — what Next.js actually serves as meta tags.
await writeFile(join(appDir, "opengraph-image.png"), og);
await writeFile(join(appDir, "twitter-image.png"), ogTwitter);

const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map(async (size) => ({
    size,
    data: await renderPng(faviconSvg(size), size, size),
  })),
);
const ico = packIco(icoPngs);
await writeFile(join(publicDir, "favicon.ico"), ico);
await writeFile(join(appDir, "favicon.ico"), ico);

console.log("✓ og.png, og-twitter.png, opengraph-image.png, twitter-image.png, favicon.ico");
