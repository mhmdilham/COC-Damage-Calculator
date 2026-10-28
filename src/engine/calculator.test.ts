import { describe, it, expect } from 'vitest';
import { calculateCombos } from './calculator';
import type { TownHallLevel } from './types';
import { DEFENSES } from '../data/defenses';

describe('CoC Damage Calculator Engine', () => {
  it('correctly calculates Zap only scenario for Air Defense', () => {
    const airDefense = DEFENSES.air_defense;
    // Air Defense Level 9: HP = 1300 (hp index 8)
    expect(airDefense.hp[8]).toBe(1300);

    // Zap Level 9: 560 damage
    const results = calculateCombos({
      defense: airDefense,
      defenseLevel: 9,
      zapLevel: 9,
      eqLevel: 0, // No EQ
      equipments: [],
      maxSpellSpace: 11,
    });

    expect(results.length).toBeGreaterThan(0);
    const best = results[0];
    expect(best.eqCount).toBe(0);
    expect(best.zapCount).toBe(3); // 3 * 560 = 1680 >= 1300
    expect(best.totalSpellSpace).toBe(3);
    expect(best.isDestroyed).toBe(true);
  });

  it('correctly calculates Zap + Quake combination with diminishing returns', () => {
    const airDefense = DEFENSES.air_defense;
    // Air Defense Level 11: HP = 1500 (hp index 10)
    expect(airDefense.hp[10]).toBe(1500);

    // Zap Level 9 = 560 damage, EQ Level 5 = 29%
    // 1st EQ: 29% of 1500 = 435. Remaining HP = 1065.
    // 2 Zaps: 2 * 560 = 1120 >= 1065.
    // Total: 1 EQ + 2 Zap = 3 spell space.
    const results = calculateCombos({
      defense: airDefense,
      defenseLevel: 11,
      zapLevel: 9,
      eqLevel: 5,
      equipments: [],
      maxSpellSpace: 11,
    });

    const oneEqCombo = results.find((c) => c.eqCount === 1);
    expect(oneEqCombo).toBeDefined();
    expect(oneEqCombo?.zapCount).toBe(2);
    expect(oneEqCombo?.totalSpellSpace).toBe(3);
    expect(oneEqCombo?.damageBreakdown.earthquakeDamage).toBe(435);
  });

  it('prioritizes Earthquake combinations when total spell space is tied (larger AoE)', () => {
    const airDefense = DEFENSES.air_defense;
    // Air Defense Level 11: HP = 1500
    // Zap Level 9 (560), EQ Level 5 (29%)
    // Both 1 EQ + 2 Zap and 0 EQ + 3 Zap take 3 spell space
    const results = calculateCombos({
      defense: airDefense,
      defenseLevel: 11,
      zapLevel: 9,
      eqLevel: 5,
      equipments: [],
      maxSpellSpace: 11,
    });

    const space3Combos = results.filter((c) => c.totalSpellSpace === 3);
    expect(space3Combos.length).toBeGreaterThanOrEqual(2);
    // 1 EQ + 2 Zap should precede 0 EQ + 3 Zap because EQ has wider AoE
    expect(space3Combos[0].eqCount).toBe(1);
    expect(space3Combos[0].zapCount).toBe(2);
    expect(space3Combos[1].eqCount).toBe(0);
    expect(space3Combos[1].zapCount).toBe(3);
  });

  it('correctly accounts for direct Hero Equipment (Fireball)', () => {
    const inferno = DEFENSES.inferno_tower;
    // Inferno Tower Level 10: HP = 4200 (index 9)
    const results = calculateCombos({
      defense: inferno,
      defenseLevel: 10,
      zapLevel: 11, // 640 damage
      eqLevel: 0,
      equipments: [
        {
          id: 'fireball',
          level: 27, // 4100 damage
          enabled: true,
        },
      ],
      maxSpellSpace: 11,
    });

    expect(results.length).toBeGreaterThan(0);
    const best = results[0];
    // Remaining HP after Fireball: 4200 - 4100 = 100
    // 1 Zap (640 dmg) is sufficient
    expect(best.zapCount).toBe(1);
    expect(best.totalSpellSpace).toBe(1);
    expect(best.damageBreakdown.heroEquipmentDamage).toBe(4100);
  });

  it('correctly accounts for Dragon Duke Flame Blower direct damage', () => {
    const ad = DEFENSES.air_defense;
    // Air Defense Level 15: HP = 2050
    const results = calculateCombos({
      defense: ad,
      defenseLevel: 15,
      zapLevel: 10,
      eqLevel: 5,
      equipments: [
        {
          id: 'flame_blower',
          level: 18, // 2500 damage >= 2050 HP
          enabled: true,
        },
      ],
      maxSpellSpace: 11,
    });

    expect(results.length).toBeGreaterThan(0);
    const best = results[0];
    // Destroyed with 0 spells purely by Flame Blower
    expect(best.totalSpellSpace).toBe(0);
    expect(best.zapCount).toBe(0);
    expect(best.eqCount).toBe(0);
    expect(best.damageBreakdown.heroEquipmentDamage).toBe(2500);
  });

  it('respects Earthquake immunity on Hero targets (Archer Queen)', () => {
    const queen = DEFENSES.archer_queen;
    expect(queen.immune).toContain('earthquake_spell');
    expect(queen.immune).toContain('earthquake_boots');

    const results = calculateCombos({
      defense: queen,
      defenseLevel: 1, // HP = 725
      zapLevel: 9, // 560
      eqLevel: 5, // 29% - should have NO effect due to immunity
      equipments: [],
      maxSpellSpace: 11,
    });

    // All valid combos should have eqCount === 0 because EQ does 0 damage to Queen
    for (const combo of results) {
      expect(combo.damageBreakdown.earthquakeDamage).toBe(0);
    }
  });

  it('respects Lightning/Zap immunity on Town Hall and Clan Castle', () => {
    const th = DEFENSES.townhall;
    const cc = DEFENSES.clan_castle;

    expect(th.immune).toContain('lightning_spell');
    expect(cc.immune).toContain('lightning_spell');

    // Without equipment, TH cannot be destroyed by Zap
    const thResults = calculateCombos({
      defense: th,
      defenseLevel: 1, // HP = 400
      zapLevel: 10,
      eqLevel: 5,
      equipments: [],
      maxSpellSpace: 11,
    });

    // None of the combos should have zapCount > 0
    for (const combo of thResults) {
      expect(combo.zapCount).toBe(0);
      expect(combo.damageBreakdown.lightningDamage).toBe(0);
    }

    // CC with high damage equipment (Giant Arrow Lv 18 = 1500 DMG) destroys CC Lv 1 (600 HP), zap must remain 0
    const ccResults = calculateCombos({
      defense: cc,
      defenseLevel: 1, // HP = 600
      zapLevel: 10,
      eqLevel: 5,
      equipments: [{ id: 'giant_arrow', level: 18, enabled: true }],
      maxSpellSpace: 11,
    });

    expect(ccResults.length).toBeGreaterThan(0);
    for (const combo of ccResults) {
      expect(combo.zapCount).toBe(0);
      expect(combo.damageBreakdown.lightningDamage).toBe(0);
    }
  });

  it('correctly applies 2x damage multiplier for Giant Arrow against Air Defense', () => {
    const ad = DEFENSES.air_defense;
    const cannon = DEFENSES.cannon;

    // Giant Arrow Lv 18 has base damage 1500
    // Against Cannon Lv 20 (HP 2150): Deals 1500 DMG (multiplier 1.0)
    const cannonResults = calculateCombos({
      defense: cannon,
      defenseLevel: 20, // 2150 HP
      zapLevel: 10, // 600 DMG
      eqLevel: 0,
      equipments: [{ id: 'giant_arrow', level: 18, enabled: true }],
      maxSpellSpace: 11,
    });
    expect(cannonResults[0].damageBreakdown.heroEquipmentDamage).toBe(1500);
    // Remaining HP = 2150 - 1500 = 650. Takes 2 zaps (600 dmg each)
    expect(cannonResults[0].totalSpellSpace).toBe(2);
    expect(cannonResults[0].zapCount).toBe(2);

    // Against Air Defense Lv 15 (HP 2050): Deals 1500 * 2.0 = 3000 DMG!
    const adResults = calculateCombos({
      defense: ad,
      defenseLevel: 15, // 2050 HP
      zapLevel: 10,
      eqLevel: 0,
      equipments: [{ id: 'giant_arrow', level: 18, enabled: true }],
      maxSpellSpace: 11,
    });
    expect(adResults[0].damageBreakdown.heroEquipmentDamage).toBe(3000);
    expect(adResults[0].totalSpellSpace).toBe(0); // 0 spell needed!
  });

  it('validates HP Modules (Hero Bell, Light Beam, Bomb Hive) availability from TH 11 to TH 18', async () => {
    const { getMaxBuildingLevel } = await import('../data/thBuildingMaxLevels');
    const modules = ['hero_bell', 'light_beam', 'bomb_hive'] as const;

    for (const modId of modules) {
      const def = DEFENSES[modId];
      expect(def).toBeDefined();
      expect(def.unlockedAtTH).toBe(11);
      expect(def.hp.length).toBe(10);

      // TH 1 to 10: should be locked (return 0)
      for (let th = 1; th <= 10; th++) {
        expect(getMaxBuildingLevel(modId, th as TownHallLevel)).toBe(0);
      }

      // TH 11 to 18: max levels per Town Hall
      const expectedMax: Record<number, number> = {
        11: 1,
        12: 2,
        13: 3,
        14: 4,
        15: 5,
        16: 6,
        17: 7,
        18: 10,
      };

      for (const [th, maxLv] of Object.entries(expectedMax)) {
        expect(getMaxBuildingLevel(modId, Number(th) as TownHallLevel)).toBe(maxLv);
      }
    }
  });

  it('validates all 6 Defending Heroes unlock TH and initial max level', async () => {
    const { getMaxBuildingLevel } = await import('../data/thBuildingMaxLevels');

    const heroSpecs = [
      { id: 'barbarian_king', unlockedAtTH: 7, initialMax: 10 },
      { id: 'archer_queen', unlockedAtTH: 8, initialMax: 10 },
      { id: 'minion_prince', unlockedAtTH: 9, initialMax: 10 },
      { id: 'grand_warden', unlockedAtTH: 11, initialMax: 20 },
      { id: 'royal_champion', unlockedAtTH: 13, initialMax: 25 },
      { id: 'dragon_duke', unlockedAtTH: 15, initialMax: 10 },
    ] as const;

    for (const spec of heroSpecs) {
      const hero = DEFENSES[spec.id];
      expect(hero).toBeDefined();
      expect(hero.type).toBe('hero');
      expect(hero.unlockedAtTH).toBe(spec.unlockedAtTH);

      // Below unlockedAtTH, must return 0
      for (let th = 1; th < spec.unlockedAtTH; th++) {
        expect(getMaxBuildingLevel(spec.id, th as TownHallLevel)).toBe(0);
      }

      // At unlockedAtTH, max level must match initialMax
      expect(getMaxBuildingLevel(spec.id, spec.unlockedAtTH as TownHallLevel)).toBe(spec.initialMax);

      // At TH 18, all heroes should have their highest level
      expect(getMaxBuildingLevel(spec.id, 18 as TownHallLevel)).toBe(hero.hp.length);
    }
  });

  it('validates Builder\'s Hut and Monolith level progression matching official data', async () => {
    const { getMaxBuildingLevel } = await import('../data/thBuildingMaxLevels');

    // Builder's Hut
    expect(getMaxBuildingLevel('builders_hut', 10 as TownHallLevel)).toBe(1);
    expect(getMaxBuildingLevel('builders_hut', 13 as TownHallLevel)).toBe(1);
    expect(getMaxBuildingLevel('builders_hut', 14 as TownHallLevel)).toBe(4);
    expect(getMaxBuildingLevel('builders_hut', 15 as TownHallLevel)).toBe(5);
    expect(getMaxBuildingLevel('builders_hut', 16 as TownHallLevel)).toBe(6);
    expect(getMaxBuildingLevel('builders_hut', 17 as TownHallLevel)).toBe(7);
    expect(getMaxBuildingLevel('builders_hut', 18 as TownHallLevel)).toBe(9); // 8 + Supercharge

    // Monolith
    expect(getMaxBuildingLevel('monolith', 14 as TownHallLevel)).toBe(0);
    expect(getMaxBuildingLevel('monolith', 15 as TownHallLevel)).toBe(2);
    expect(getMaxBuildingLevel('monolith', 16 as TownHallLevel)).toBe(3);
    expect(getMaxBuildingLevel('monolith', 17 as TownHallLevel)).toBe(4);
    expect(getMaxBuildingLevel('monolith', 18 as TownHallLevel)).toBe(6); // 5 + Supercharge
  });

  it('validates Attacker max levels per Town Hall (Spells and Equipment from Fandom data)', async () => {
    const { TH_ATTACKER_MAX_LEVELS } = await import('../data/thAttackerMaxLevels');

    // TH 8: Blacksmith Lv 1
    const th8 = TH_ATTACKER_MAX_LEVELS[8];
    expect(th8.zapLevel).toBe(5);
    expect(th8.eqLevel).toBe(2);
    expect(th8.equipments.spiky_ball).toBe(12);
    expect(th8.equipments.giant_arrow).toBe(0);
    expect(th8.equipments.fireball).toBe(0);

    // TH 9: Blacksmith Lv 2 (Giant Arrow unlocked)
    const th9 = TH_ATTACKER_MAX_LEVELS[9];
    expect(th9.zapLevel).toBe(6);
    expect(th9.eqLevel).toBe(3);
    expect(th9.equipments.giant_arrow).toBe(9);

    // TH 11: Grand Warden & Fireball unlocked
    const th11 = TH_ATTACKER_MAX_LEVELS[11];
    expect(th11.zapLevel).toBe(8);
    expect(th11.eqLevel).toBe(5);
    expect(th11.equipments.fireball).toBe(15);
    expect(th11.equipments.seeking_shield).toBe(0);

    // TH 13: Royal Champion & Seeking Shield unlocked
    const th13 = TH_ATTACKER_MAX_LEVELS[13];
    expect(th13.zapLevel).toBe(9);
    expect(th13.eqLevel).toBe(5);
    expect(th13.equipments.seeking_shield).toBe(15);

    // TH 15: Dragon Duke, Rocket Backpack, and Flame Blower unlocked
    const th15 = TH_ATTACKER_MAX_LEVELS[15];
    expect(th15.zapLevel).toBe(10);
    expect(th15.equipments.rocket_backpack).toBe(24);
    expect(th15.equipments.flame_blower).toBe(18);

    // TH 16: Blacksmith Lv 9 maxes out Epic equipment (Lv 27)
    const th16 = TH_ATTACKER_MAX_LEVELS[16];
    expect(th16.zapLevel).toBe(11);
    expect(th16.equipments.spiky_ball).toBe(27);
    expect(th16.equipments.fireball).toBe(27);
    expect(th16.equipments.rocket_backpack).toBe(27);
    expect(th16.equipments.giant_arrow).toBe(18);

    // TH 18: Everything maxed
    const th18 = TH_ATTACKER_MAX_LEVELS[18];
    expect(th18.zapLevel).toBe(13);
    expect(th18.eqLevel).toBe(5);
    expect(th18.equipments.spiky_ball).toBe(27);
    expect(th18.equipments.giant_arrow).toBe(18);
    expect(th18.equipments.fireball).toBe(27);
    expect(th18.equipments.seeking_shield).toBe(18);
    expect(th18.equipments.rocket_backpack).toBe(27);
    expect(th18.equipments.flame_blower).toBe(18);
  });
});
