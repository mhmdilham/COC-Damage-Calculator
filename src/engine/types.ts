export type TownHallLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

export type DefenseType = 'building' | 'hero';

export interface DefenseData {
  id: string;
  name: string;
  type: DefenseType;
  unlockedAtTH: TownHallLevel;
  hp: number[]; // index 0 = level 1, index 1 = level 2, etc.
  immune: string[]; // e.g. ["earthquake_spell", "earthquake_boots"]
  icon: string;
  // Map of TH -> max level available at that TH
  thMaxLevel?: Partial<Record<TownHallLevel, number>>;
  superchargeLevel?: number;
}

export interface SpellData {
  id: string;
  name: string;
  damageType: 'direct' | 'earthquake';
  housingSpace: number;
  unlockedAtTH: TownHallLevel;
  icon: string;
  // damage values indexed by level (level 0 = 0)
  damage: Record<number, number>;
  maxLevel: number;
}

export type EquipmentRarity = 'common' | 'epic';

export interface EquipmentData {
  id: string;
  name: string;
  hero: 'barbarian_king' | 'archer_queen' | 'grand_warden' | 'royal_champion' | 'minion_prince' | 'dragon_duke';
  rarity: EquipmentRarity;
  damageType: 'direct' | 'earthquake';
  unlockedAtTH: TownHallLevel;
  icon: string;
  // level -> damage (flat damage or base EQ percentage)
  damage: Record<number, number>;
  maxLevel: number;
  // Optional target multipliers (e.g. Giant Arrow vs Air Defense)
  targetMultiplier?: Record<string, number>;
}

export interface ComboResult {
  eqCount: number;
  zapCount: number;
  totalSpellSpace: number; // 1 space per zap, 1 space per quake
  remainingHp: number;
  isDestroyed: boolean;
  damageBreakdown: {
    heroEquipmentDamage: number;
    earthquakeDamage: number;
    lightningDamage: number;
    totalDamageDealt: number;
  };
}

export interface ActiveEquipmentConfig {
  id: string;
  level: number;
  enabled: boolean;
}
