import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const IMAGES_DIR = path.resolve(PUBLIC_DIR, 'images');

const WEBP_OPTIONS: sharp.WebpOptions = {
  quality: 86,
  alphaQuality: 95,
  effort: 6,
  smartSubsample: true,
};

interface CategoryProfile {
  canonicalMaxDim: number;
  variants: Array<{ suffix: '@1x' | '@sm'; maxDim: number }>;
}

function getProfile(relPath: string): CategoryProfile | null {
  const norm = relPath.replace(/\\/g, '/');

  // Skip favicons (exact declared manifest/OG dimensions) and already-generated variants
  if (norm.startsWith('favicon/')) return null;
  if (/@(?:1x|sm)\.webp$/i.test(norm)) return null;
  if (!norm.endsWith('.webp')) return null;

  if (norm.startsWith('defense/townhall/')) {
    return {
      canonicalMaxDim: 128,
      variants: [
        { suffix: '@1x', maxDim: 64 },
        { suffix: '@sm', maxDim: 48 },
      ],
    };
  }

  if (norm.startsWith('offense/')) {
    return {
      canonicalMaxDim: 96,
      variants: [{ suffix: '@1x', maxDim: 48 }],
    };
  }

  if (norm.startsWith('defense/') || norm.startsWith('other/')) {
    return {
      canonicalMaxDim: 128,
      variants: [{ suffix: '@1x', maxDim: 64 }],
    };
  }

  return null;
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function hasExtraMetadataChunks(buf: Buffer): boolean {
  if (buf.length < 30) return false;
  if (buf.toString('ascii', 12, 16) !== 'VP8X') return false;
  let off = 30;
  while (off + 8 <= buf.length) {
    const chunk = buf.toString('ascii', off, off + 4);
    const sz = buf.readUInt32LE(off + 4);
    if (chunk === 'ICCP' || chunk === 'EXIF' || chunk === 'XMP ') {
      return true;
    }
    off += 8 + sz + (sz % 2);
  }
  return false;
}

async function encodeSprite(inputBuf: Buffer, maxDim: number): Promise<Buffer> {
  return sharp(inputBuf)
    .resize({
      width: maxDim,
      height: maxDim,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .webp(WEBP_OPTIONS)
    .toBuffer();
}

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const allFiles = walkFiles(IMAGES_DIR);

  let processedCount = 0;
  let canonicalUpdated = 0;
  let variantsWritten = 0;
  let totalOrigCanonicalBytes = 0;
  let totalNewCanonicalBytes = 0;
  let totalVariantBytes = 0;

  for (const filePath of allFiles) {
    const relPath = path.relative(IMAGES_DIR, filePath);
    const profile = getProfile(relPath);
    if (!profile) continue;

    processedCount++;
    const origBuf = fs.readFileSync(filePath);
    const meta = await sharp(origBuf).metadata();
    const origMaxDim = Math.max(meta.width ?? 0, meta.height ?? 0);
    const needsResize = origMaxDim > profile.canonicalMaxDim;
    const hasMeta = hasExtraMetadataChunks(origBuf);

    totalOrigCanonicalBytes += origBuf.length;

    // 1. Canonical (2x Retina) sprite — resize/re-encode from original buffer
    const newCanonicalBuf = await encodeSprite(origBuf, profile.canonicalMaxDim);
    // Keep original if already within maxDim, no metadata waste, and re-encoding isn't smaller
    const shouldReplaceCanonical =
      needsResize || hasMeta || newCanonicalBuf.length < origBuf.length;

    const finalCanonicalBuf = shouldReplaceCanonical ? newCanonicalBuf : origBuf;
    totalNewCanonicalBytes += finalCanonicalBuf.length;

    if (shouldReplaceCanonical) {
      canonicalUpdated++;
      if (!dryRun) {
        fs.writeFileSync(filePath, finalCanonicalBuf);
      }
    }

    // 2. Responsive variants (@1x / @sm) — always downscale from the original input buffer
    //    for maximum Lanczos3 precision (never double-compress from canonical!)
    for (const variant of profile.variants) {
      const variantPath = filePath.replace(/\.webp$/i, `${variant.suffix}.webp`);
      const variantBuf = await encodeSprite(origBuf, variant.maxDim);
      // Never produce a variant larger than the final canonical sprite
      const chosenBuf =
        variantBuf.length < finalCanonicalBuf.length ? variantBuf : finalCanonicalBuf;

      totalVariantBytes += chosenBuf.length;
      variantsWritten++;
      if (!dryRun) {
        fs.writeFileSync(variantPath, chosenBuf);
      }
    }
  }

  const savedBytes = totalOrigCanonicalBytes - totalNewCanonicalBytes;
  const savedPct =
    totalOrigCanonicalBytes > 0
      ? ((savedBytes / totalOrigCanonicalBytes) * 100).toFixed(1)
      : '0.0';

  console.log('\n============================================================');
  console.log(`   COC IMAGE OPTIMIZER ${dryRun ? '(DRY RUN)' : '(APPLIED)'}`);
  console.log('============================================================');
  console.log(`Base sprites processed : ${processedCount}`);
  console.log(`Canonical 2x updated   : ${canonicalUpdated}`);
  console.log(`Variants generated     : ${variantsWritten} (@1x / @sm)`);
  console.log(`Canonical before       : ${formatKB(totalOrigCanonicalBytes)}`);
  console.log(`Canonical after (2x)   : ${formatKB(totalNewCanonicalBytes)} (-${savedPct}%, saved ${formatKB(savedBytes)})`);
  console.log(`Variants total (1x/sm) : ${formatKB(totalVariantBytes)}`);
  console.log('============================================================\n');
}

main().catch((err) => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
