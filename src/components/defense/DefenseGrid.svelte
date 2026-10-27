<script lang="ts">
  import { calcState } from '../../state/calculator.svelte';
  import type { DefenseData, ActiveEquipmentConfig, TownHallLevel } from '../../engine/types';
  import SpellBadge from '../ui/SpellBadge.svelte';
  import EquipmentBadge from '../ui/EquipmentBadge.svelte';

  const thLevelsDescending: TownHallLevel[] = [
    18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
  ];

  let isDefenderDropdownOpen = $state(false);
  let defenderDropdownRef = $state<HTMLElement | null>(null);

  function selectDefenderTH(th: TownHallLevel) {
    calcState.setTargetTH(th);
    isDefenderDropdownOpen = false;
  }

  function handleClickOutside(e: MouseEvent) {
    const targetNode = e.target as Node;
    if (isDefenderDropdownOpen && defenderDropdownRef && !defenderDropdownRef.contains(targetNode)) {
      isDefenderDropdownOpen = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isDefenderDropdownOpen = false;
    }
  }

  const KEY_DEFENSES_ORDER = [
    'townhall',
    'revenge_tower',
    'clan_castle',
    'monolith',
    'eagle_artillery',
    'firespitter',
    'multigear_tower',
    'inferno_tower',
    'air_defense',
  ];
  const KEY_DEFENSES = new Set(KEY_DEFENSES_ORDER);

  interface ComboDefenseItem {
    def: DefenseData;
    level: number;
    displayLevel: number;
    maxHp: number;
    imgSrc: string;
    isSupercharge: boolean;
  }

  interface ComboGroup {
    key: string;
    zapCount: number;
    eqCount: number;
    totalSpellSpace: number;
    equipments: ActiveEquipmentConfig[];
    defenses: ComboDefenseItem[];
  }

  // Normal grid filtered & sorted defenses (for 'all' and 'key' tabs)
  const filteredDefenses = $derived.by(() => {
    let list = calcState.availableDefenses;

    // Filter by search query if any
    if (calcState.searchQuery.trim()) {
      const q = calcState.searchQuery.toLowerCase().trim();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    if (calcState.activeCategory === 'key') {
      list = list.filter((d) => KEY_DEFENSES.has(d.id));
    }

    // Tabs 'all' and 'key': Sort from largest spell count to lowest (descending)
    return [...list].sort((a, b) => {
      const levelA = calcState.defenseLevels[a.id] ?? 1;
      const levelB = calcState.defenseLevels[b.id] ?? 1;
      const bestA = calcState.getBestComboFor(a, levelA);
      const bestB = calcState.getBestComboFor(b, levelB);

      // Defenses with valid combo come before unbreakable/immune
      if (bestA && !bestB) return -1;
      if (!bestA && bestB) return 1;
      if (!bestA && !bestB) {
        const hpA = a.hp[levelA - 1] ?? 0;
        const hpB = b.hp[levelB - 1] ?? 0;
        return hpB - hpA; // Highest HP first among unbreakable
      }

      // 1. Total spell space descending (11 down to 0)
      if (bestB!.totalSpellSpace !== bestA!.totalSpellSpace) {
        return bestB!.totalSpellSpace - bestA!.totalSpellSpace;
      }

      // 2. If spell count is equal, prefer more Quakes (larger area damage)
      if (bestB!.eqCount !== bestA!.eqCount) {
        return bestB!.eqCount - bestA!.eqCount;
      }

      // 3. Tie-breaker: higher HP first
      const hpA = a.hp[levelA - 1] ?? 0;
      const hpB = b.hp[levelB - 1] ?? 0;
      return hpB - hpA;
    });
  });

  // Grouped by combo data (for 'combo' tab)
  const { comboGroups, noComboDefenses } = $derived.by(() => {
    let list = calcState.availableDefenses;

    if (calcState.searchQuery.trim()) {
      const q = calcState.searchQuery.toLowerCase().trim();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    const activeEquips = calcState.enabledEquipments;
    const groupMap: Record<string, ComboGroup> = {};
    const noCombos: ComboDefenseItem[] = [];

    for (const def of list) {
      const level = calcState.defenseLevels[def.id] ?? 1;
      const maxHp = def.hp[level - 1] ?? def.hp[0];
      const best = calcState.getBestComboFor(def, level);
      const isSupercharge = !!(def.superchargeLevel && level === def.superchargeLevel);
      const displayLevel = isSupercharge ? level - 1 : level;
      const imageLevel = def.superchargeLevel && level >= def.superchargeLevel ? def.superchargeLevel - 1 : level;
      const imgSrc = def.type === 'hero' ? (def.icon || `/images/defense/${def.id}/1.webp`) : `/images/defense/${def.id}/${imageLevel}.webp`;

      const item: ComboDefenseItem = {
        def,
        level,
        displayLevel,
        maxHp,
        imgSrc,
        isSupercharge,
      };

      if (!best) {
        noCombos.push(item);
      } else {
        const eqSig = activeEquips.map((e: ActiveEquipmentConfig) => `${e.id}@${e.level}`).join(',');
        const key = `${best.zapCount}_${best.eqCount}_${eqSig}`;

        if (!groupMap[key]) {
          groupMap[key] = {
            key,
            zapCount: best.zapCount,
            eqCount: best.eqCount,
            totalSpellSpace: best.totalSpellSpace,
            equipments: activeEquips,
            defenses: [],
          };
        }
        groupMap[key].defenses.push(item);
      }
    }

    // Sort groups:
    // 1. Highest totalSpellSpace first (e.g. 11, ..., 1, 0)
    // 2. If equal, higher eqCount first
    const sortedGroups = Object.values(groupMap).sort((a, b) => {
      if (b.totalSpellSpace !== a.totalSpellSpace) {
        return b.totalSpellSpace - a.totalSpellSpace;
      }
      return b.eqCount - a.eqCount;
    });

    // Sort defenses inside each group by HP descending
    for (const g of sortedGroups) {
      g.defenses.sort((a, b) => b.maxHp - a.maxHp);
    }

    // Sort noCombos by HP descending
    noCombos.sort((a, b) => b.maxHp - a.maxHp);

    return { comboGroups: sortedGroups, noComboDefenses: noCombos };
  });
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeyDown} />

<div class="space-y-3">
  <!-- Defense Section Header: Target Base & Defender TH Selector -->
  <div class="flex items-center justify-between pb-2.5 border-b border-slate-800/80 gap-3">
    <div class="flex items-center gap-2">
      <span class="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
        <span>🛡️</span> Target Base Defenses
      </span>
      <span class="text-[10px] text-slate-500 hidden sm:inline font-medium">
        (Defenses & Heroes)
      </span>
    </div>

    <!-- Target TH Selector -->
    <div class="flex items-center gap-2">
      <span class="text-[11px] font-medium text-slate-400 hidden xs:inline">
        Enemy Base:
      </span>
      <div class="relative" bind:this={defenderDropdownRef}>
        <button
          type="button"
          onclick={() => (isDefenderDropdownOpen = !isDefenderDropdownOpen)}
          class="flex items-center gap-2 bg-[#181a20] hover:bg-[#22242c] border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
          aria-expanded={isDefenderDropdownOpen}
          title="Atur level maksimal pertahanan & HP sesuai TH musuh"
        >
          <img
            src="/images/defense/townhall/{calcState.targetThLevel}.webp"
            alt="TH {calcState.targetThLevel}"
            width="20"
            height="20"
            class="w-5 h-5 aspect-square object-contain drop-shadow"
          />
          <span class="text-sm font-extrabold text-white tracking-tight leading-none">
            TH {calcState.targetThLevel}
          </span>
          <span class="text-[10px] text-slate-400 font-bold transition-transform duration-150 {isDefenderDropdownOpen ? 'rotate-180' : ''}">
            ▾
          </span>
        </button>

        {#if isDefenderDropdownOpen}
          <div
            class="absolute right-0 top-full mt-1.5 z-50 w-36 max-h-64 overflow-y-auto bg-[#1f2127] border border-white/10 rounded-xl shadow-2xl p-1 space-y-0.5 scrollbar-thin"
          >
            {#each thLevelsDescending as th (th)}
              <button
                type="button"
                onclick={() => selectDefenderTH(th)}
                class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer {calcState.targetThLevel === th
                  ? 'bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#282a32]'}"
              >
                <div class="flex items-center gap-2">
                  <img
                    src="/images/defense/townhall/{th}.webp"
                    alt="TH {th}"
                    width="20"
                    height="20"
                    class="w-5 h-5 aspect-square object-contain drop-shadow shrink-0"
                  />
                  <span class="text-xs font-bold">
                    Town Hall {th}
                  </span>
                </div>
                {#if calcState.targetThLevel === th}
                  <span class="text-xs text-sky-400 font-bold">✓</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Filter & Search Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
    <!-- 3 Category Tabs: All, Key Defenses, Group By Combo -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'all')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'all'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        All
      </button>

      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'key')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'key'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        ⭐ Key Defenses
      </button>

      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'combo')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'combo'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        📑 Group By Combo
      </button>
    </div>

    <!-- Search Box -->
    <div class="relative w-full sm:w-56">
      <label for="defense-search-input" class="sr-only">Search building or hero name</label>
      <input
        id="defense-search-input"
        name="defense-search"
        type="search"
        autocomplete="off"
        bind:value={calcState.searchQuery}
        placeholder="Search building or hero..."
        class="w-full text-xs bg-[#181a20] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
      />
      {#if calcState.searchQuery}
        <button
          type="button"
          onclick={() => (calcState.searchQuery = '')}
          class="absolute right-3 top-2 text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          ✕
        </button>
      {/if}
    </div>
  </div>

  {#if calcState.activeCategory === 'combo'}
    <!-- Group By Combo View (Clashify Style) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {#each comboGroups as group (group.key)}
        <div class="bg-[#181a20] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all min-h-[160px]">
          <!-- Combo Recipe Header -->
          <div class="flex items-center justify-center gap-2 flex-wrap pb-3.5 border-b border-slate-800/70 min-h-[58px]">
            {#if group.zapCount > 0}
              <SpellBadge
                spellId="lightning_spell"
                count={group.zapCount}
                level={calcState.zapLevel}
                size="md"
              />
            {/if}

            {#if group.eqCount > 0}
              <SpellBadge
                spellId="earthquake_spell"
                count={group.eqCount}
                level={calcState.eqLevel}
                size="md"
              />
            {/if}

            {#each group.equipments as eq (eq.id)}
              <EquipmentBadge
                equipmentId={eq.id}
                level={eq.level}
                size="md"
              />
            {/each}
          </div>

          <!-- Target Buildings in this Combo (Uniform Square Tiles matching Clashify) -->
          <div class="pt-3.5 flex items-center justify-center gap-2 flex-wrap flex-1 content-center">
            {#each group.defenses as item (item.def.id)}
              <button
                type="button"
                onclick={() => calcState.openModal(item.def.id)}
                class="group relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#24262d] hover:bg-[#2d3039] border border-slate-700/60 hover:border-orange-500/50 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 shrink-0"
                title="{item.def.name} • Lv {item.displayLevel}{item.isSupercharge ? ' ⚡⚡' : ''} • {item.maxHp.toLocaleString()} HP"
                aria-label="{item.def.name} Level {item.displayLevel}{item.isSupercharge ? ' Supercharged' : ''}"
              >
                <img
                  src={item.imgSrc}
                  alt="{item.def.name} Level {item.displayLevel}"
                  width="40"
                  height="40"
                  class="w-9 h-9 sm:w-10 sm:h-10 aspect-square object-contain drop-shadow transition-transform group-hover:scale-110"
                  decoding="async"
                  onerror={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.src.endsWith('/1.webp')) {
                      img.src = `/images/defense/${item.def.id}/1.webp`;
                    } else {
                      img.onerror = null;
                      img.src = '/images/other/defense.webp';
                    }
                  }}
                />
              </button>
            {/each}
          </div>
        </div>
      {/each}

      <!-- No Combo Available Card -->
      {#if noComboDefenses.length > 0}
        <div class="bg-[#15161b] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm col-span-full">
          <div class="text-center pb-3 border-b border-slate-800/60">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              No combo available
            </span>
            <p class="text-[11px] text-slate-500 mt-0.5">
              Requires &gt;11 spell slots with the current setup
            </p>
          </div>

          <div class="pt-3.5 flex items-center justify-center gap-2 flex-wrap">
            {#each noComboDefenses as item (item.def.id)}
              <button
                type="button"
                onclick={() => calcState.openModal(item.def.id)}
                class="group relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#24262d]/50 hover:bg-[#2d3039] border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center cursor-pointer opacity-75 hover:opacity-100 shadow-sm hover:scale-105 shrink-0"
                title="{item.def.name} • Lv {item.displayLevel}{item.isSupercharge ? ' ⚡⚡' : ''} • {item.maxHp.toLocaleString()} HP • >11 Slots"
                aria-label="{item.def.name} Level {item.displayLevel}{item.isSupercharge ? ' Supercharged' : ''}"
              >
                <img
                  src={item.imgSrc}
                  alt="{item.def.name} Level {item.displayLevel}"
                  width="40"
                  height="40"
                  class="w-9 h-9 sm:w-10 sm:h-10 aspect-square object-contain grayscale-[25%] group-hover:grayscale-0 drop-shadow transition-transform group-hover:scale-110"
                  decoding="async"
                  onerror={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.src.endsWith('/1.webp')) {
                      img.src = `/images/defense/${item.def.id}/1.webp`;
                    } else {
                      img.onerror = null;
                      img.src = '/images/other/defense.webp';
                    }
                  }}
                />
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- All & Key Defenses Grid View -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {#each filteredDefenses as def (def.id)}
        {@const level = calcState.defenseLevels[def.id] ?? 1}
        {@const maxHp = def.hp[level - 1] ?? def.hp[0]}
        {@const best = calcState.getBestComboFor(def, level)}
        {@const isSupercharge = def.superchargeLevel && level === def.superchargeLevel}
        {@const displayLevel = isSupercharge ? level - 1 : level}
        {@const imageLevel = def.superchargeLevel && level >= def.superchargeLevel ? def.superchargeLevel - 1 : level}
        {@const imgSrc = def.type === 'hero' ? (def.icon || `/images/defense/${def.id}/1.webp`) : `/images/defense/${def.id}/${imageLevel}.webp`}

        <button
          type="button"
          onclick={() => calcState.openModal(def.id)}
          class="bg-[#181a20] hover:bg-[#1f222a] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between items-center text-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 group min-h-[175px]"
        >
          <!-- Top: Best Combo Preview -->
          <div class="w-full flex items-center justify-center min-h-[50px] pb-2">
            {#if best}
              <div class="flex items-center gap-1.5 justify-center flex-wrap">
                {#if best.zapCount > 0}
                  <SpellBadge
                    spellId="lightning_spell"
                    count={best.zapCount}
                    level={calcState.zapLevel}
                    size="sm"
                  />
                {/if}

                {#if best.eqCount > 0}
                  <SpellBadge
                    spellId="earthquake_spell"
                    count={best.eqCount}
                    level={calcState.eqLevel}
                    size="sm"
                  />
                {/if}

                {#each calcState.enabledEquipments as eq (eq.id)}
                  <EquipmentBadge
                    equipmentId={eq.id}
                    level={eq.level}
                    size="sm"
                  />
                {/each}
              </div>
            {:else}
              <span class="text-[10px] text-slate-500 font-medium px-2 py-1 rounded bg-slate-900/60 border border-slate-800/80">
                🛡️ &gt;11 Slots
              </span>
            {/if}
          </div>

          <!-- Middle: Building Image -->
          <div class="w-14 h-14 flex items-center justify-center my-1">
            <img
              src={imgSrc}
              alt="{def.name} Level {displayLevel}"
              width="56"
              height="56"
              class="w-14 h-14 aspect-square object-contain drop-shadow transition-transform group-hover:scale-105"
              decoding="async"
              onerror={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.endsWith('/1.webp')) {
                  img.src = `/images/defense/${def.id}/1.webp`;
                } else {
                  img.onerror = null;
                  img.src = '/images/other/defense.webp';
                }
              }}
            />
          </div>

          <!-- Bottom: Name, Level & HP -->
          <div class="w-full pt-1">
            <div class="text-xs font-bold text-white truncate leading-tight">
              {def.name}
            </div>
            <div class="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span class="font-semibold text-slate-300 flex items-center gap-0.5">
                Lv {displayLevel}
                {#if isSupercharge}
                  <span class="text-amber-400 font-bold" title="Supercharged (⚡⚡)">⚡⚡</span>
                {/if}
              </span>
              <span>&bull;</span>
              <span class="text-rose-400 font-medium">{maxHp.toLocaleString()} HP</span>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
