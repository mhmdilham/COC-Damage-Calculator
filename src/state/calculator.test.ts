import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'svelte/server';
import { calcState } from './calculator.svelte';
import { DEFENSES } from '../data/defenses';
import DamageSourcesBar from '../components/offense/DamageSourcesBar.svelte';
import DefenseGrid from '../components/defense/DefenseGrid.svelte';
import Header from '../components/layout/Header.svelte';

describe('CalculatorState and TH 19 UI integration', () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockStorage = {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    } as Storage;

    Object.defineProperty(globalThis, 'window', {
      value: globalThis,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    });

    // Reset singleton state before each test so tests are isolated
    calcState.setTargetTH(16);
    calcState.setAttackerTH(18);
    calcState.zapEnabled = true;
    calcState.eqEnabled = true;
    calcState.activeCategory = 'all';
    calcState.searchQuery = '';
    store = {};
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  it('sets TH 19 target defenses and attacker zap level 14', () => {
    calcState.setTargetTH(19);
    expect(calcState.targetThLevel).toBe(19);
    expect(calcState.defenseLevels.townhall).toBe(19);
    expect(calcState.defenseLevels.spiky_tower).toBe(2);
    expect(calcState.defenseLevels.firecracker_tower).toBe(2);

    calcState.setAttackerTH(19);
    expect(calcState.attackerThLevel).toBe(19);
    expect(calcState.zapLevel).toBe(14);
  });

  it('persists and reloads TH 19 target and attacker levels from localStorage and initializes missing TH 19 defense levels', () => {
    store['coc_calc_prefs_v2'] = JSON.stringify({
      schemaVersion: 3,
      targetThLevel: 19,
      attackerThLevel: 19,
      zapLevel: 14,
      eqLevel: 5,
    });

    calcState.loadFromStorage();

    expect(calcState.targetThLevel).toBe(19);
    expect(calcState.attackerThLevel).toBe(19);
    expect(calcState.zapLevel).toBe(14);
    // Missing defenseLevels must be initialized for the loaded targetThLevel (19), not default 16
    expect(calcState.defenseLevels.spiky_tower).toBe(2);
    expect(calcState.defenseLevels.firecracker_tower).toBe(2);
    expect(calcState.defenseLevels.townhall).toBe(19);
  });

  it('migrates pre-TH19 localStorage TH 18 promoted supercharge defense levels back to permanent TH 18 max', () => {
    store['coc_calc_prefs_v2'] = JSON.stringify({
      targetThLevel: 18,
      attackerThLevel: 18,
      zapLevel: 13,
      eqLevel: 5,
      defenseLevels: {
        ricochet_cannon: 5,
        multiarcher_tower: 5,
        multigear_tower: 4,
        builders_hut: 9,
        xbow: 14,
        hidden_tesla: 18,
        monolith: 6, // Still supercharged at TH 18
      },
    });

    calcState.loadFromStorage();

    expect(calcState.targetThLevel).toBe(18);
    expect(calcState.defenseLevels.ricochet_cannon).toBe(4);
    expect(calcState.defenseLevels.multiarcher_tower).toBe(4);
    expect(calcState.defenseLevels.multigear_tower).toBe(3);
    expect(calcState.defenseLevels.builders_hut).toBe(8);
    expect(calcState.defenseLevels.xbow).toBe(13);
    expect(calcState.defenseLevels.hidden_tesla).toBe(17);
    expect(calcState.defenseLevels.monolith).toBe(6);

    // Persists schemaVersion: 3 so subsequent loads won't re-run migration
    const migrated = JSON.parse(store['coc_calc_prefs_v2']);
    expect(migrated.schemaVersion).toBe(3);
  });

  it('clamps out-of-range numeric values and ignores non-integer TH levels in localStorage', () => {
    store['coc_calc_prefs_v2'] = JSON.stringify({
      schemaVersion: 3,
      targetThLevel: 18.5,
      attackerThLevel: 99,
      zapLevel: 999,
      eqLevel: -5,
      defenseLevels: {
        air_defense: 999,
        cannon: 0,
      },
    });

    calcState.loadFromStorage();

    expect(calcState.targetThLevel).toBe(16); // invalid float ignored
    expect(calcState.attackerThLevel).toBe(18); // out-of-range ignored
    expect(calcState.zapLevel).toBe(14); // clamped to Lightning maxLevel
    expect(calcState.eqLevel).toBe(1); // clamped to >= 1
    expect(calcState.eqEnabled).toBe(false); // legacy <= 0 disables spell
    expect(calcState.defenseLevels.air_defense).toBe(17); // clamped to hp.length
    expect(calcState.defenseLevels.cannon).toBe(1); // clamped to >= 1
  });

  it('toggles Lightning and Earthquake spells on/off while preserving their levels', () => {
    calcState.setAttackerTH(19);
    calcState.zapEnabled = true;
    calcState.eqEnabled = false;

    const airDefense = DEFENSES.air_defense;
    // With EQ disabled, every combo for Air Defense Lv 17 must have eqCount === 0
    const zapOnlyCombos = calcState.getCombosFor(airDefense, 17);
    expect(zapOnlyCombos.length).toBeGreaterThan(0);
    for (const combo of zapOnlyCombos) {
      expect(combo.eqCount).toBe(0);
      expect(combo.zapCount).toBeGreaterThan(0);
    }
    expect(calcState.eqLevel).toBe(5); // Level preserved when toggled off

    // With Zap disabled and no equipment, Air Defense cannot be destroyed by EQ alone
    calcState.zapEnabled = false;
    calcState.eqEnabled = true;
    const eqOnlyCombos = calcState.getCombosFor(airDefense, 17);
    expect(eqOnlyCombos).toEqual([]);
    expect(calcState.zapLevel).toBe(14); // Level preserved when toggled off
  });

  it('persists and reloads zapEnabled and eqEnabled in localStorage', () => {
    calcState.setAttackerTH(19);
    calcState.zapEnabled = false;
    calcState.eqEnabled = true;
    calcState.saveToStorage();

    calcState.zapEnabled = true;
    calcState.eqEnabled = false;
    calcState.loadFromStorage();

    expect(calcState.zapEnabled).toBe(false);
    expect(calcState.eqEnabled).toBe(true);
    expect(calcState.zapLevel).toBe(14);
  });

  it('renders clickable on/off spell cards in DamageSourcesBar and hides slider when disabled', () => {
    calcState.setAttackerTH(19);
    calcState.zapEnabled = true;
    calcState.eqEnabled = false;

    const { body } = render(DamageSourcesBar);
    expect(body).toContain('1 active');
    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('aria-pressed="false"');
    expect(body).toContain('id="zap-level-input"');
    expect(body).not.toContain('id="eq-level-input"');
  });

  it('renders Lightning Spell slider with max="14" and compact Town Hall icon fallback in DamageSourcesBar', () => {
    calcState.setAttackerTH(19);
    const { body } = render(DamageSourcesBar);
    expect(body).toContain('id="zap-level-input"');
    expect(body).toContain('max="14"');
    expect(body).toContain('TH 19');
    expect(body).toMatch(/<img[^>]*src="\/images\/defense\/townhall\/19@sm\.webp"[^>]*onerror=/);
    expect(body).toContain('src="/images/offense/spells/lightning_spell@1x.webp"');
  });

  it('renders Spiky Tower, Firecracker Tower under Key Defenses with srcset, lazy loading, and Town Hall icon fallback in DefenseGrid', () => {
    calcState.setTargetTH(19);
    calcState.activeCategory = 'key';
    calcState.searchQuery = '';
    const { body } = render(DefenseGrid);
    expect(body).toContain('Firecracker Tower');
    expect(body).toContain('Spiky Tower');
    expect(body).toMatch(/<img[^>]*alt="TH 19"[^>]*onerror=/);
    expect(body).toContain('@1x.webp 1x');
    expect(body).toContain('loading="eager"');
    expect(body).toContain('loading="lazy"');
  });

  it('displays official Supercell TH 19 patch version and release date in Header', () => {
    const { body } = render(Header);
    expect(body).toContain('v19.32.4');
    expect(body).toContain('16 Nov 2026');
  });
});
