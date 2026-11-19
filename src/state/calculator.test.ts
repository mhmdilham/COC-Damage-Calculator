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

  it('persists and reloads TH 19 target and attacker levels from localStorage', () => {
    store['coc_calc_prefs_v2'] = JSON.stringify({
      targetThLevel: 19,
      attackerThLevel: 19,
      zapLevel: 14,
      eqLevel: 5,
    });

    calcState.targetThLevel = 16;
    calcState.attackerThLevel = 16;
    calcState.zapLevel = 11;

    calcState.loadFromStorage();

    expect(calcState.targetThLevel).toBe(19);
    expect(calcState.attackerThLevel).toBe(19);
    expect(calcState.zapLevel).toBe(14);
  });

  it('renders Lightning Spell slider with max="14" in DamageSourcesBar', () => {
    calcState.setAttackerTH(19);
    const { body } = render(DamageSourcesBar);
    expect(body).toContain('id="zap-level-input"');
    expect(body).toContain('max="14"');
    expect(body).toContain('TH 19');
  });

  it('renders Spiky Tower and Firecracker Tower under Key Defenses at TH 19', () => {
    calcState.setTargetTH(19);
    calcState.activeCategory = 'key';
    calcState.searchQuery = '';
    const { body } = render(DefenseGrid);
    expect(body).toContain('Firecracker Tower');
    expect(body).toContain('Spiky Tower');
  });
});
