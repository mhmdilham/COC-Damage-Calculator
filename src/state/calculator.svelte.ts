import { DEFENSES } from '../data/defenses';
import { SPELLS, EQUIPMENTS } from '../data/offenses';
import { getMaxBuildingLevel } from '../data/thBuildingMaxLevels';
import { TH_ATTACKER_MAX_LEVELS } from '../data/thAttackerMaxLevels';
import { calculateCombos } from '../engine/calculator';
import type { TownHallLevel, ActiveEquipmentConfig, ComboResult, DefenseData } from '../engine/types';

class CalculatorState {
  // Target Village Town Hall Level (sets all defenses to max for this TH)
  targetThLevel = $state<TownHallLevel>(16);

  // Attacker Town Hall Level (sets spells & equipment to max for this TH)
  attackerThLevel = $state<TownHallLevel>(18);

  // Modal inspection: which defense is currently opened in modal
  selectedDefenseId = $state<string | null>(null);

  // Attacker Spell Levels (unrestricted by target TH, default max)
  zapLevel = $state<number>(13);
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
  activeCategory = $state<'all' | 'key' | 'standard' | 'heroes'>('all');

  constructor() {
    this.initDefenseLevels(this.targetThLevel);
    this.loadFromStorage();
  }

  // Initialize or re-apply all defense levels to max of selected target TH
  initDefenseLevels(th: TownHallLevel) {
    const levels: Record<string, number> = {};
    for (const [id, def] of Object.entries(DEFENSES)) {
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

  // Active equipments list
  activeEquipmentsList = $derived<ActiveEquipmentConfig[]>(
    Object.entries(this.equipments).map(([id, conf]) => ({
      id,
      level: conf.level,
      enabled: conf.enabled,
    }))
  );

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
      if (data.targetThLevel && data.targetThLevel >= 1 && data.targetThLevel <= 18) {
        this.targetThLevel = data.targetThLevel;
      }
      if (data.attackerThLevel && data.attackerThLevel >= 1 && data.attackerThLevel <= 18) {
        this.attackerThLevel = data.attackerThLevel;
      }
      if (typeof data.zapLevel === 'number') this.zapLevel = data.zapLevel;
      if (typeof data.eqLevel === 'number') this.eqLevel = data.eqLevel;
      if (data.equipments && typeof data.equipments === 'object') {
        for (const [k, v] of Object.entries(data.equipments)) {
          if (k in this.equipments) {
            this.equipments[k] = v as any;
          }
        }
      }
      if (data.defenseLevels && typeof data.defenseLevels === 'object') {
        this.defenseLevels = { ...this.defenseLevels, ...data.defenseLevels };
      }
    } catch {
      // ignore
    }
  }
}

export const calcState = new CalculatorState();
