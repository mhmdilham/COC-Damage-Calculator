import type { TownHallLevel } from '../engine/types';

export interface THCapability {
  th: TownHallLevel;
  maxSpellHousingSpace: number;
  maxSpellLevels: {
    lightning_spell: number;
    earthquake_spell: number;
  };
  maxEquipmentLevels: {
    common: number;
    epic: number;
  };
}

export const TH_CAPS: Record<TownHallLevel, THCapability> = {
  1: {
    th: 1,
    maxSpellHousingSpace: 0,
    maxSpellLevels: { lightning_spell: 0, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  2: {
    th: 2,
    maxSpellHousingSpace: 0,
    maxSpellLevels: { lightning_spell: 0, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  3: {
    th: 3,
    maxSpellHousingSpace: 0,
    maxSpellLevels: { lightning_spell: 0, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  4: {
    th: 4,
    maxSpellHousingSpace: 0,
    maxSpellLevels: { lightning_spell: 0, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  5: {
    th: 5,
    maxSpellHousingSpace: 2,
    maxSpellLevels: { lightning_spell: 4, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  6: {
    th: 6,
    maxSpellHousingSpace: 4,
    maxSpellLevels: { lightning_spell: 4, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  7: {
    th: 7,
    maxSpellHousingSpace: 6,
    maxSpellLevels: { lightning_spell: 4, earthquake_spell: 0 },
    maxEquipmentLevels: { common: 0, epic: 0 },
  },
  8: {
    th: 8,
    maxSpellHousingSpace: 8,
    maxSpellLevels: { lightning_spell: 5, earthquake_spell: 2 },
    maxEquipmentLevels: { common: 9, epic: 12 },
  },
  9: {
    th: 9,
    maxSpellHousingSpace: 9, // 8 army + 1 CC
    maxSpellLevels: { lightning_spell: 6, earthquake_spell: 3 },
    maxEquipmentLevels: { common: 9, epic: 12 },
  },
  10: {
    th: 10,
    maxSpellHousingSpace: 11, // 9 army + 2 CC
    maxSpellLevels: { lightning_spell: 7, earthquake_spell: 4 },
    maxEquipmentLevels: { common: 12, epic: 15 },
  },
  11: {
    th: 11,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 8, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 12, epic: 15 },
  },
  12: {
    th: 12,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 9, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 15, epic: 18 },
  },
  13: {
    th: 13,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 9, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 15, epic: 18 },
  },
  14: {
    th: 14,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 10, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 18, epic: 21 },
  },
  15: {
    th: 15,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 11, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 18, epic: 24 },
  },
  16: {
    th: 16,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 12, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 18, epic: 27 },
  },
  17: {
    th: 17,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 13, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 18, epic: 27 },
  },
  18: {
    th: 18,
    maxSpellHousingSpace: 11,
    maxSpellLevels: { lightning_spell: 13, earthquake_spell: 5 },
    maxEquipmentLevels: { common: 18, epic: 27 },
  },
};
