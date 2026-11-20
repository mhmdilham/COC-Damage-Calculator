import type { DefenseData } from '../engine/types';

export type ImageVariantSuffix = '@1x' | '@sm';

const WEBP_EXT_RE = /\.webp$/i;

/**
 * Resolves the canonical sprite level for a defense, accounting for
 * supercharge levels (which reuse the previous visual level) and
 * deduplicated multi-level tier sprites (e.g. HP modules).
 */
export function resolveDefenseImageLevel(def: DefenseData, level: number): number {
  const clamped = Math.max(1, level);
  const baseLevel =
    def.superchargeLevel && clamped >= def.superchargeLevel
      ? def.superchargeLevel - 1
      : clamped;

  return def.spriteLevelMap?.[baseLevel] ?? baseLevel;
}

/**
 * Returns the canonical (2x Retina) WebP path for a defense or hero at a given level.
 */
export function getDefenseImageSrc(def: DefenseData, level: number): string {
  if (def.type === 'hero') {
    return def.icon || `/images/defense/${def.id}/1.webp`;
  }
  const imageLevel = resolveDefenseImageLevel(def, level);
  return `/images/defense/${def.id}/${imageLevel}.webp`;
}

/**
 * Converts a canonical `.webp` asset path into a responsive variant path
 * (e.g., `/images/defense/cannon/21.webp` -> `/images/defense/cannon/21@1x.webp`).
 */
export function getVariantSrc(src: string, suffix: ImageVariantSuffix = '@1x'): string {
  if (!WEBP_EXT_RE.test(src)) return src;
  return src.replace(WEBP_EXT_RE, `${suffix}.webp`);
}

/**
 * Builds a pixel-density `srcset` pairing the 1x variant with the 2x canonical sprite.
 */
export function getResponsiveSrcSet(src: string, lowSuffix: ImageVariantSuffix = '@1x'): string {
  if (!WEBP_EXT_RE.test(src)) return src;
  return `${getVariantSrc(src, lowSuffix)} 1x, ${src} 2x`;
}

/**
 * Returns the optimal Town Hall icon path for compact selectors (`sm`: 48px)
 * or full cards (`md`: 128px canonical).
 */
export function getTownHallIconSrc(th: number, size: 'sm' | 'md' = 'md'): string {
  const base = `/images/defense/townhall/${th}.webp`;
  return size === 'sm' ? getVariantSrc(base, '@sm') : base;
}

/**
 * Safe `onerror` handler for defense sprites that clears/updates both `src` and `srcset`
 * so the browser does not keep retrying a failed srcset candidate.
 */
export function handleDefenseImageError(e: Event, defenseId: string): void {
  const img = e.currentTarget as HTMLImageElement | null;
  if (!img) return;

  const fallback1 = `/images/defense/${defenseId}/1.webp`;
  const currentPath = img.getAttribute('src') ?? '';

  if (currentPath !== fallback1 && !currentPath.endsWith('/1.webp')) {
    img.srcset = getResponsiveSrcSet(fallback1);
    img.src = fallback1;
  } else {
    img.onerror = null;
    const genericFallback = '/images/other/defense.webp';
    img.srcset = getResponsiveSrcSet(genericFallback);
    img.src = genericFallback;
  }
}

/**
 * Safe `onerror` handler for Town Hall icons.
 */
export function handleTownHallImageError(e: Event, size: 'sm' | 'md' = 'sm'): void {
  const img = e.currentTarget as HTMLImageElement | null;
  if (!img) return;
  img.onerror = null;
  img.srcset = '';
  img.src = getTownHallIconSrc(18, size);
}
