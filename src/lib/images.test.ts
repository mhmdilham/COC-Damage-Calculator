import { describe, it, expect } from 'vitest';
import { DEFENSES } from '../data/defenses';
import {
  resolveDefenseImageLevel,
  getDefenseImageSrc,
  getVariantSrc,
  getResponsiveSrcSet,
  getTownHallIconSrc,
} from './images';

describe('images helper', () => {
  it('resolves supercharge levels to the previous visual level', () => {
    const mortar = DEFENSES.mortar; // superchargeLevel: 19
    expect(resolveDefenseImageLevel(mortar, 18)).toBe(18);
    expect(resolveDefenseImageLevel(mortar, 19)).toBe(18);
    expect(getDefenseImageSrc(mortar, 19)).toBe('/images/defense/mortar/18.webp');
  });

  it('resolves deduplicated sprite tiers for HP modules', () => {
    const heroBell = DEFENSES.hero_bell;
    expect(resolveDefenseImageLevel(heroBell, 1)).toBe(1);
    expect(resolveDefenseImageLevel(heroBell, 2)).toBe(1);
    expect(resolveDefenseImageLevel(heroBell, 3)).toBe(1);
    expect(resolveDefenseImageLevel(heroBell, 4)).toBe(4);
    expect(resolveDefenseImageLevel(heroBell, 6)).toBe(4);
    expect(resolveDefenseImageLevel(heroBell, 9)).toBe(7);
    expect(resolveDefenseImageLevel(heroBell, 10)).toBe(10);
    expect(getDefenseImageSrc(heroBell, 6)).toBe('/images/defense/hero_bell/4.webp');
  });

  it('always resolves hero defenses to their icon / level 1 sprite', () => {
    const bk = DEFENSES.barbarian_king;
    expect(getDefenseImageSrc(bk, 100)).toBe('/images/defense/barbarian_king/1.webp');
  });

  it('generates variant paths and pixel-density srcset strings', () => {
    expect(getVariantSrc('/images/defense/cannon/21.webp', '@1x')).toBe(
      '/images/defense/cannon/21@1x.webp'
    );
    expect(getVariantSrc('/images/defense/townhall/19.webp', '@sm')).toBe(
      '/images/defense/townhall/19@sm.webp'
    );
    expect(getResponsiveSrcSet('/images/offense/spells/lightning_spell.webp')).toBe(
      '/images/offense/spells/lightning_spell@1x.webp 1x, /images/offense/spells/lightning_spell.webp 2x'
    );
  });

  it('returns compact sm variant for Town Hall selector icons', () => {
    expect(getTownHallIconSrc(19, 'sm')).toBe('/images/defense/townhall/19@sm.webp');
    expect(getTownHallIconSrc(19, 'md')).toBe('/images/defense/townhall/19.webp');
  });
});
