import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'svelte/server';
import { calcState } from './calculator.svelte';
import DamageSourcesBar from '../components/offense/DamageSourcesBar.svelte';
import DefenseGrid from '../components/defense/DefenseGrid.svelte';

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
    expect(calcState.eqLevel).toBe(0); // clamped to >= 0
    expect(calcState.defenseLevels.air_defense).toBe(17); // clamped to hp.length
    expect(calcState.defenseLevels.cannon).toBe(1); // clamped to >= 1
  });

  it('renders Lightning Spell slider with max="14" and Town Hall icon fallback in DamageSourcesBar', () => {
    calcState.setAttackerTH(19);
    const { body } = render(DamageSourcesBar);
    expect(body).toContain('id="zap-level-input"');
    expect(body).toContain('max="14"');
    expect(body).toContain('TH 19');
    expect(body).toMatch(/<img[^>]*src="\/images\/defense\/townhall\/19\.webp"[^>]*onerror=/);
  });

  it('renders Spiky Tower, Firecracker Tower under Key Defenses and Town Hall icon fallback in DefenseGrid', () => {
    calcState.setTargetTH(19);
    calcState.activeCategory = 'key';
    calcState.searchQuery = '';
    const { body } = render(DefenseGrid);
    expect(body).toContain('Firecracker Tower');
    expect(body).toContain('Spiky Tower');
    expect(body).toMatch(/<img[^>]*alt="TH 19"[^>]*onerror=/);
  });
});
