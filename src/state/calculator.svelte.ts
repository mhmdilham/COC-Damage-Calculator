import { DEFENSES } from '../data/defenses';
import { SPELLS } from '../data/offenses';
import { getMaxBuildingLevel } from '../data/thBuildingMaxLevels';
import { TH_ATTACKER_MAX_LEVELS } from '../data/thAttackerMaxLevels';
import { calculateCombos } from '../engine/calculator';
import type { TownHallLevel, ActiveEquipmentConfig, ComboResult, DefenseData } from '../engine/types';

const STORAGE_SCHEMA_VERSION = 3;
const TH19_PROMOTED_FROM_SUPERCHARGE = [
  'ricochet_cannon',
  'multiarcher_tower',
  'multigear_tower',
  'builders_hut',
  'xbow',
  'hidden_tesla',
] as const;

class CalculatorState {
  // Target Village Town Hall Level (sets all defenses to max for this TH)
  targetThLevel = $state<TownHallLevel>(16);

  // Attacker Town Hall Level (sets spells & equipment to max for this TH)
  attackerThLevel = $state<TownHallLevel>(19);

  // Modal inspection: which defense is currently opened in modal
  selectedDefenseId = $state<string | null>(null);

  // Attacker Spell Levels (unrestricted by target TH, default max)
  zapLevel = $state<number>(14);
  eqLevel = $state<number>(5);

  // Attacker Hero Equipments (all unlocked and default max levels)
  equipments = $state<Record<string, { level: number; enabled: boolean }>>({
    spiky_ball: { level: 27, enabled: false },
    giant_arrow: { level: 18, enabled: false },
    fireball: { level: 27, enabled: false },
    seeking_shield: { level: 18, enabled: false },
    rocket_backpack: { level: 27, enabled: false },
    flame_blower: { level: 18, enabled: false },
  });

  // Current level of each defense building (defaults to max level of target TH)
  defenseLevels = $state<Record<string, number>>({});

  // Search & Category filter for defense grid
  searchQuery = $state<string>('');
  activeCategory = $state<'all' | 'key' | 'combo'>('all');

  constructor() {
    this.initDefenseLevels(this.targetThLevel);
    this.loadFromStorage();
  }

  // Initialize or re-apply all defense levels to max of selected target TH
  initDefenseLevels(th: TownHallLevel) {
    const levels: Record<string, number> = {};
    for (const id of Object.keys(DEFENSES)) {
      const maxForTh = getMaxBuildingLevel(id, th);
      // If unlocked at this TH, set to max for this TH; otherwise set to 1
      levels[id] = maxForTh > 0 ? maxForTh : 1;
    }
    this.defenseLevels = levels;
  }

  // Set Target Town Hall: immediately updates all buildings to their respective max levels at that TH
  setTargetTH(th: TownHallLevel) {
    this.targetThLevel = th;
    this.initDefenseLevels(th);
    this.saveToStorage();
  }

  // Set Attacker Town Hall: immediately sets Zap, Quake, and Hero Equipment to their max levels at that TH
  setAttackerTH(th: TownHallLevel) {
    this.attackerThLevel = th;
    const maxData = TH_ATTACKER_MAX_LEVELS[th];
    if (maxData) {
      this.zapLevel = maxData.zapLevel;
      this.eqLevel = maxData.eqLevel;
      for (const [eqId, maxLv] of Object.entries(maxData.equipments)) {
        if (this.equipments[eqId]) {
          if (maxLv > 0) {
            this.equipments[eqId].level = maxLv;
          } else {
            // Not unlocked at this TH
            this.equipments[eqId].level = 1;
            this.equipments[eqId].enabled = false;
          }
        }
      }
    }
    this.saveToStorage();
  }

  // Update specific defense level (e.g. from modal slider)
  setDefenseLevel(defenseId: string, level: number) {
    const def = DEFENSES[defenseId];
    if (def) {
      const clamped = Math.max(1, Math.min(level, def.hp.length));
      this.defenseLevels[defenseId] = clamped;
      this.saveToStorage();
    }
  }

  // Open modal for a specific defense
  openModal(defenseId: string) {
    this.selectedDefenseId = defenseId;
  }

  // Close modal
  closeModal() {
    this.selectedDefenseId = null;
  }

  // List of defenses available at current Target TH
  availableDefenses = $derived(
    Object.values(DEFENSES).filter((d) => d.unlockedAtTH <= this.targetThLevel)
  );

  // Active equipments list (all configs)
  activeEquipmentsList = $derived<ActiveEquipmentConfig[]>(
    Object.entries(this.equipments).map(([id, conf]) => ({
      id,
      level: conf.level,
      enabled: conf.enabled,
    }))
  );

  // Enabled equipments list (only enabled with level > 0)
  get enabledEquipments(): ActiveEquipmentConfig[] {
    return Object.entries(this.equipments)
      .filter(([, conf]) => conf.enabled && conf.level > 0)
      .map(([id, conf]) => ({
        id,
        level: conf.level,
        enabled: true,
      }));
  }

  // Calculate all combos for a given defense
  getCombosFor(defense: DefenseData, level?: number): ComboResult[] {
    const currentLevel = level ?? this.defenseLevels[defense.id] ?? 1;
    return calculateCombos({
      defense,
      defenseLevel: currentLevel,
      zapLevel: this.zapLevel,
      eqLevel: this.eqLevel,
      equipments: this.activeEquipmentsList,
      maxSpellSpace: 11, // Standard maximum spell capacity (army camp + CC)
    });
  }

  // Get best optimal combo for a given defense
  getBestComboFor(defense: DefenseData, level?: number): ComboResult | null {
    const combos = this.getCombosFor(defense, level);
    return combos.length > 0 ? combos[0] : null;
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        targetThLevel: this.targetThLevel,
        attackerThLevel: this.attackerThLevel,
        zapLevel: this.zapLevel,
        eqLevel: this.eqLevel,
        equipments: this.equipments,
        defenseLevels: this.defenseLevels,
      };
      localStorage.setItem('coc_calc_prefs_v2', JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('coc_calc_prefs_v2');
      if (!raw) return;
      const data = JSON.parse(raw);
      const schemaVersion = typeof data.schemaVersion === 'number' ? data.schemaVersion : 2;

      if (
        typeof data.targetThLevel === 'number' &&
        Number.isInteger(data.targetThLevel) &&
        data.targetThLevel >= 1 &&
        data.targetThLevel <= 19
      ) {
        this.targetThLevel = data.targetThLevel as TownHallLevel;
        this.initDefenseLevels(this.targetThLevel);
      }
      if (
        typeof data.attackerThLevel === 'number' &&
        Number.isInteger(data.attackerThLevel) &&
        data.attackerThLevel >= 1 &&
        data.attackerThLevel <= 19
      ) {
        this.attackerThLevel = data.attackerThLevel as TownHallLevel;
      }
      if (typeof data.zapLevel === 'number' && Number.isFinite(data.zapLevel)) {
        this.zapLevel = Math.max(0, Math.min(Math.round(data.zapLevel), SPELLS.lightning_spell.maxLevel));
      }
      if (typeof data.eqLevel === 'number' && Number.isFinite(data.eqLevel)) {
        this.eqLevel = Math.max(0, Math.min(Math.round(data.eqLevel), 5));
      }
      if (data.equipments && typeof data.equipments === 'object') {
        for (const [k, v] of Object.entries(data.equipments)) {
          if (k in this.equipments && typeof v === 'object' && v !== null) {
            this.equipments[k] = v as { level: number; enabled: boolean };
          }
        }
      }
      if (data.defenseLevels && typeof data.defenseLevels === 'object') {
        const merged = { ...this.defenseLevels };
        for (const [id, rawLevel] of Object.entries(data.defenseLevels)) {
          const def = DEFENSES[id];
          if (def && typeof rawLevel === 'number' && Number.isFinite(rawLevel)) {
            merged[id] = Math.max(1, Math.min(Math.round(rawLevel), def.hp.length));
          }
        }
        this.defenseLevels = merged;
      }

      // Migrate pre-TH19 storage: promoted buildings no longer have TH 18 supercharges
      if (schemaVersion < STORAGE_SCHEMA_VERSION) {
        if (this.targetThLevel <= 18) {
          for (const id of TH19_PROMOTED_FROM_SUPERCHARGE) {
            const maxForTh = getMaxBuildingLevel(id, this.targetThLevel);
            if (maxForTh > 0 && (this.defenseLevels[id] ?? 1) > maxForTh) {
              this.defenseLevels[id] = maxForTh;
            }
          }
        }
        this.saveToStorage();
      }
    } catch {
      // ignore
    }
  }
}

export const calcState = new CalculatorState();
