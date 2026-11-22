import { DEFENSES } from './defenses';
import { TH_ATTACKER_MAX_LEVELS } from './thAttackerMaxLevels';
import { getMaxBuildingLevel } from './thBuildingMaxLevels';
import { calculateCombos } from '../engine/calculator';
import type { TownHallLevel } from '../engine/types';

export interface ReferenceCell {
  comboText: string;
  hp: number;
  level: number;
}

export interface ZapQuakeReferenceRow {
  th: TownHallLevel;
  zapLevel: number;
  eqLevel: number;
  cells: Record<string, ReferenceCell | null>;
}

export interface ReferenceDefenseColumn {
  id: string;
  label: string;
}

export const REFERENCE_TH_LEVELS: readonly TownHallLevel[] = [19, 18, 17, 16, 15, 14, 13, 12];

export const REFERENCE_TABLE_COLUMNS: readonly ReferenceDefenseColumn[] = [
  { id: 'air_defense', label: 'Air Defense' },
  { id: 'inferno_tower', label: 'Inferno Tower' },
  { id: 'eagle_artillery', label: 'Eagle Artillery' },
  { id: 'scattershot', label: 'Scattershot' },
  { id: 'monolith', label: 'Monolith' },
  { id: 'firespitter', label: 'Firespitter' },
];

export const TH19_EXTRA_DEFENSE_IDS = [
  'spiky_tower',
  'firecracker_tower',
  'ricochet_cannon',
  'multiarcher_tower',
] as const;

function computeReferenceCell(
  defenseId: string,
  th: TownHallLevel,
  zapLevel: number,
  eqLevel: number
): ReferenceCell | null {
  const level = getMaxBuildingLevel(defenseId, th);
  const def = DEFENSES[defenseId];
  if (!def || level <= 0) return null;

  const hp = def.hp[level - 1] ?? def.hp[def.hp.length - 1];
  const combos = calculateCombos({
    defense: def,
    defenseLevel: level,
    zapLevel,
    eqLevel,
    equipments: [],
  });
  const best = combos[0];
  if (!best) {
    return { comboText: '>11 slots', hp, level };
  }

  const parts: string[] = [];
  if (best.zapCount > 0) parts.push(`${best.zapCount} Zap`);
  if (best.eqCount > 0) parts.push(`${best.eqCount} Quake`);
  return {
    comboText: parts.join(' + '),
    hp,
    level,
  };
}

export function buildZapQuakeReferenceRows(): ZapQuakeReferenceRow[] {
  return REFERENCE_TH_LEVELS.map((th) => {
    const attacker = TH_ATTACKER_MAX_LEVELS[th];
    const cells: Record<string, ReferenceCell | null> = {};
    for (const col of REFERENCE_TABLE_COLUMNS) {
      cells[col.id] = computeReferenceCell(col.id, th, attacker.zapLevel, attacker.eqLevel);
    }
    return {
      th,
      zapLevel: attacker.zapLevel,
      eqLevel: attacker.eqLevel,
      cells,
    };
  });
}

export function buildTh19Highlights(): Array<{ id: string; name: string; cell: ReferenceCell }> {
  const attacker = TH_ATTACKER_MAX_LEVELS[19];
  const items: Array<{ id: string; name: string; cell: ReferenceCell }> = [];
  for (const id of TH19_EXTRA_DEFENSE_IDS) {
    const cell = computeReferenceCell(id, 19, attacker.zapLevel, attacker.eqLevel);
    const def = DEFENSES[id];
    if (cell && def) {
      items.push({ id, name: def.name, cell });
    }
  }
  return items;
}
