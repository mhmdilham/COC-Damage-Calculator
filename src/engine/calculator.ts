import type { DefenseData, ComboResult, ActiveEquipmentConfig } from './types';
import { SPELLS, EQUIPMENTS } from '../data/offenses';

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export interface CalculationInput {
  defense: DefenseData;
  defenseLevel: number; // 1-based (1, 2, ...)
  zapLevel: number;     // 1 to 13 (0 if disabled)
  eqLevel: number;      // 1 to 5 (0 if disabled)
  equipments: ActiveEquipmentConfig[];
  maxSpellSpace?: number; // default 11
  bootsFirst?: boolean;   // whether boots hit before EQ spell, default true
}

export function calculateCombos(input: CalculationInput): ComboResult[] {
  const {
    defense,
    defenseLevel,
    zapLevel,
    eqLevel,
    equipments,
    maxSpellSpace = 11,
    bootsFirst = true,
  } = input;

  const maxHp = defense.hp[defenseLevel - 1] ?? defense.hp[defense.hp.length - 1];
  const zapSpell = SPELLS.lightning_spell;
  const eqSpell = SPELLS.earthquake_spell;

  const zapDamage = zapLevel > 0 ? (zapSpell.damage[zapLevel] ?? 0) : 0;
  const eqPercent = eqLevel > 0 ? (eqSpell.damage[eqLevel] ?? 0) : 0;

  const isImmuneToEQ = defense.immune.includes('earthquake_spell');
  const isImmuneToBoots = defense.immune.includes('earthquake_boots');
  const isImmuneToZap = defense.immune.includes('lightning_spell');

  // 1. Calculate non-EQ hero equipment direct damage
  let directEquipmentDamage = 0;
  let bootsActiveConfig: ActiveEquipmentConfig | null = null;

  for (const eqConfig of equipments) {
    if (!eqConfig.enabled || eqConfig.level <= 0) continue;

    const eqData = EQUIPMENTS[eqConfig.id];
    if (!eqData) continue;

    if (eqData.damageType === 'earthquake') {
      if (eqConfig.id === 'earthquake_boots') {
        bootsActiveConfig = eqConfig;
      }
    } else {
      // Direct damage
      const baseDamage = eqData.damage[eqConfig.level] ?? 0;
      const multiplier = eqData.targetMultiplier?.[defense.id] ?? 1;
      directEquipmentDamage += round2(baseDamage * multiplier);
    }
  }

  // Check if direct equipment alone destroyed the defense
  if (directEquipmentDamage >= maxHp) {
    return [
      {
        eqCount: 0,
        zapCount: 0,
        totalSpellSpace: 0,
        remainingHp: 0,
        isDestroyed: true,
        damageBreakdown: {
          heroEquipmentDamage: directEquipmentDamage,
          earthquakeDamage: 0,
          lightningDamage: 0,
          totalDamageDealt: directEquipmentDamage,
        },
      },
    ];
  }

  const results: ComboResult[] = [];

  // Helper function to calculate EQ sequence damage given eqCount and boots
  function computeEqDamage(
    numEqSpells: number,
    hasBoots: boolean,
    isBootsFirst: boolean
  ): { totalEqDamage: number; bootsDamage: number; spellEqDamage: number } {
    let eqHitIndex = 0;
    let bootsDmg = 0;
    let spellDmg = 0;

    const applyBoots = () => {
      if (hasBoots && !isImmuneToBoots && bootsActiveConfig) {
        const bootsData = EQUIPMENTS[bootsActiveConfig.id];
        if (bootsData) {
          const bootsPercent = bootsData.damage[bootsActiveConfig.level] ?? 0;
          const multiplier = 1 / (2 * eqHitIndex + 1);
          const dmg = round2((maxHp * (bootsPercent / 100)) * multiplier);
          bootsDmg += dmg;
          eqHitIndex++;
        }
      }
    };

    const applySpells = () => {
      if (numEqSpells > 0 && !isImmuneToEQ && eqPercent > 0) {
        for (let i = 0; i < numEqSpells; i++) {
          const multiplier = 1 / (2 * eqHitIndex + 1);
          const dmg = round2((maxHp * (eqPercent / 100)) * multiplier);
          spellDmg += dmg;
          eqHitIndex++;
        }
      }
    };

    if (isBootsFirst) {
      applyBoots();
      applySpells();
    } else {
      applySpells();
      applyBoots();
    }

    return {
      totalEqDamage: round2(bootsDmg + spellDmg),
      bootsDamage: bootsDmg,
      spellEqDamage: spellDmg,
    };
  }

  const hasBoots = bootsActiveConfig !== null && !isImmuneToBoots;

  // Check if equipment (direct + boots) destroys target without any spells
  const eqOnlyCheck = computeEqDamage(0, hasBoots, bootsFirst);
  const totalEquipDamage = round2(directEquipmentDamage + eqOnlyCheck.bootsDamage);
  if (totalEquipDamage >= maxHp) {
    return [
      {
        eqCount: 0,
        zapCount: 0,
        totalSpellSpace: 0,
        remainingHp: 0,
        isDestroyed: true,
        damageBreakdown: {
          heroEquipmentDamage: totalEquipDamage,
          earthquakeDamage: eqOnlyCheck.bootsDamage,
          lightningDamage: 0,
          totalDamageDealt: totalEquipDamage,
        },
      },
    ];
  }

  // Iterate through possible EQ spell counts (from 0 up to maxSpellSpace)
  const maxEqToTry = isImmuneToEQ || eqPercent === 0 ? 0 : Math.min(5, maxSpellSpace);

  for (let numEq = 0; numEq <= maxEqToTry; numEq++) {
    const eqResult = computeEqDamage(numEq, hasBoots, bootsFirst);
    const damageBeforeZap = round2(directEquipmentDamage + eqResult.totalEqDamage);
    const hpAfterEq = Math.max(0, round2(maxHp - damageBeforeZap));

    if (hpAfterEq <= 0) {
      // Destroyed by EQ spells alone (+ equipment)
      results.push({
        eqCount: numEq,
        zapCount: 0,
        totalSpellSpace: numEq,
        remainingHp: 0,
        isDestroyed: true,
        damageBreakdown: {
          heroEquipmentDamage: round2(directEquipmentDamage + eqResult.bootsDamage),
          earthquakeDamage: eqResult.spellEqDamage,
          lightningDamage: 0,
          totalDamageDealt: damageBeforeZap,
        },
      });
      break; // No need to test higher EQ counts since this one destroyed it
    }

    if (zapDamage > 0 && !isImmuneToZap) {
      const neededZap = Math.ceil(hpAfterEq / zapDamage);
      const totalSpace = numEq + neededZap;

      if (totalSpace <= maxSpellSpace) {
        const totalZapDamage = neededZap * zapDamage;
        const totalDealt = round2(damageBeforeZap + totalZapDamage);
        const finalHp = Math.max(0, round2(maxHp - totalDealt));

        results.push({
          eqCount: numEq,
          zapCount: neededZap,
          totalSpellSpace: totalSpace,
          remainingHp: finalHp,
          isDestroyed: true,
          damageBreakdown: {
            heroEquipmentDamage: round2(directEquipmentDamage + eqResult.bootsDamage),
            earthquakeDamage: eqResult.spellEqDamage,
            lightningDamage: totalZapDamage,
            totalDamageDealt: totalDealt,
          },
        });
      }
    }
  }

  // Sort: First by totalSpellSpace ascending (fewest total spells)
  // When totalSpellSpace is equal, prioritize Earthquake (higher eqCount) due to larger AoE
  results.sort((a, b) => {
    if (a.totalSpellSpace !== b.totalSpellSpace) {
      return a.totalSpellSpace - b.totalSpellSpace;
    }
    return b.eqCount - a.eqCount;
  });

  return results;
}
