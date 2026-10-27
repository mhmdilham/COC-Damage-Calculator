<script lang="ts">
  import { calcState } from '../../state/calculator.svelte';
  import { SPELLS, EQUIPMENTS } from '../../data/offenses';

  const activeEquipCount = $derived(
    Object.values(calcState.equipments).filter((e) => e.enabled).length
  );
</script>

<div class="bg-[#181a20] border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
  <!-- 1. Attacker Spells (Zap & Quake) -->
  <div>
    <div class="flex items-center justify-between pb-2 gap-2">
      <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
        <span>⚡</span> ZapQuake
      </span>
      <span class="text-[11px] text-slate-500">
        Spell Damage
      </span>
    </div>

    <!-- Attacker Spells Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Lightning Spell -->
      <div class="bg-[#131418] border border-slate-800/90 rounded-xl p-3 flex items-center gap-3">
        <img
          src={SPELLS.lightning_spell.icon}
          alt="Zap"
          width="40"
          height="40"
          class="w-10 h-10 aspect-square object-contain rounded-lg shrink-0 drop-shadow"
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between text-xs">
            <label for="zap-level-input" class="font-bold text-white truncate cursor-pointer">Lightning (Zap)</label>
            <span class="font-bold text-amber-400">
              Lv {calcState.zapLevel} ({SPELLS.lightning_spell.damage[calcState.zapLevel] ?? 0} DMG)
            </span>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              id="zap-level-input"
              name="zap-level"
              type="range"
              min="0"
              max="13"
              bind:value={calcState.zapLevel}
              class="w-full accent-amber-500 cursor-pointer h-2 bg-slate-850 rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- Earthquake Spell -->
      <div class="bg-[#131418] border border-slate-800/90 rounded-xl p-3 flex items-center gap-3">
        <img
          src={SPELLS.earthquake_spell.icon}
          alt="Quake"
          width="40"
          height="40"
          class="w-10 h-10 aspect-square object-contain rounded-lg shrink-0 drop-shadow"
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between text-xs">
            <label for="eq-level-input" class="font-bold text-white truncate cursor-pointer">Earthquake (Quake)</label>
            <span class="font-bold text-amber-400">
              Lv {calcState.eqLevel} ({SPELLS.earthquake_spell.damage[calcState.eqLevel] ?? 0}% HP)
            </span>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              id="eq-level-input"
              name="eq-level"
              type="range"
              min="0"
              max="5"
              bind:value={calcState.eqLevel}
              class="w-full accent-amber-500 cursor-pointer h-2 bg-slate-850 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. Attacker Hero Equipments (Grid) -->
  <div class="pt-3 border-t border-slate-800/80 space-y-2">
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
          <span>👑</span> Gear/Equipment
        </span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md border {activeEquipCount > 0 ? 'bg-purple-900/40 border-purple-700/60 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'}">
          {activeEquipCount} active
        </span>
      </div>

      {#if activeEquipCount > 0}
        <button
          type="button"
          onclick={() => {
            for (const key of Object.keys(calcState.equipments)) {
              calcState.equipments[key].enabled = false;
            }
          }}
          class="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer transition-colors"
        >
          Disable All
        </button>
      {:else}
        <span class="text-[11px] text-slate-500 hidden sm:inline">
          Enable equipment to combine damage (0 Spell Slots)
        </span>
      {/if}
    </div>

    <!-- Equipment Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
      {#each Object.values(EQUIPMENTS) as eq (eq.id)}
        {@const config = calcState.equipments[eq.id]}
        {@const dmg = config?.level ? eq.damage[config.level] ?? 0 : 0}

        <div
          class="p-2.5 rounded-xl border transition-all {config?.enabled
            ? 'bg-purple-950/25 border-purple-500/50 text-white'
            : 'bg-[#131418] border-slate-800 text-slate-400'}"
        >
          <!-- Checkbox & Info -->
          <div class="flex items-center justify-between gap-2">
            <label class="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
              <input
                id="equip-{eq.id}"
                name="equip-{eq.id}"
                type="checkbox"
                bind:checked={calcState.equipments[eq.id].enabled}
                class="accent-purple-500 rounded cursor-pointer w-4 h-4 shrink-0"
              />
              <img
                src={eq.icon}
                alt={eq.name}
                width="24"
                height="24"
                class="w-6 h-6 aspect-square object-contain rounded shrink-0 drop-shadow"
              />
              <span class="text-xs font-semibold truncate">
                {eq.name}
              </span>
            </label>

            <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 {eq.rarity === 'epic' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/60' : 'bg-slate-800 text-slate-400'}">
              {eq.rarity}
            </span>
          </div>

          <!-- Level slider if enabled -->
          <div class="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">
              Lv {config?.level ?? eq.maxLevel}
            </span>
            <div class="flex items-center gap-1.5 font-bold {config?.enabled ? 'text-amber-400' : 'text-slate-500'}">
              {#if eq.targetMultiplier?.['air_defense']}
                <span class="text-[9px] text-sky-400 font-semibold px-1 py-0.5 rounded bg-sky-500/10 border border-sky-500/20" title="Deals 2x damage against Air Defense">2x Air Def</span>
              {/if}
              <span>+{dmg} DMG</span>
            </div>
          </div>

          {#if config?.enabled}
            <div class="pt-1">
              <label for="equip-level-{eq.id}" class="sr-only">Level {eq.name}</label>
              <input
                id="equip-level-{eq.id}"
                name="equip-level-{eq.id}"
                type="range"
                min="1"
                max={eq.maxLevel}
                bind:value={calcState.equipments[eq.id].level}
                class="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
