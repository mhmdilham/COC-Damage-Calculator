<script lang="ts">
  import { calcState } from '../../state/calculator.svelte';
  import type { TownHallLevel } from '../../engine/types';

  const thLevelsDescending: TownHallLevel[] = [
    18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
  ];

  let isAttackerOpen = $state(false);
  let isDefenderOpen = $state(false);

  let attackerDropdownRef = $state<HTMLElement | null>(null);
  let defenderDropdownRef = $state<HTMLElement | null>(null);

  function selectAttackerTH(th: TownHallLevel) {
    calcState.setAttackerTH(th);
    isAttackerOpen = false;
  }

  function selectDefenderTH(th: TownHallLevel) {
    calcState.setTargetTH(th);
    isDefenderOpen = false;
  }

  function handleClickOutside(e: MouseEvent) {
    const targetNode = e.target as Node;
    if (isAttackerOpen && attackerDropdownRef && !attackerDropdownRef.contains(targetNode)) {
      isAttackerOpen = false;
    }
    if (isDefenderOpen && defenderDropdownRef && !defenderDropdownRef.contains(targetNode)) {
      isDefenderOpen = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isAttackerOpen = false;
      isDefenderOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeyDown} />

<div class="bg-[#181a20] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md relative">
  <!-- Section Title -->
  <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
    <div class="flex items-center gap-2">
      <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
        <span>⚔️</span> Attack Matchup
      </span>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
        TH {calcState.attackerThLevel} vs TH {calcState.targetThLevel}
      </span>
    </div>
    <span class="text-[11px] text-slate-500 hidden sm:inline">
      Pilih level Town Hall penyerang dan target pertahanan
    </span>
  </div>

  <!-- 2 Column Matchup Cards with Central VS Badge -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative items-center">
    <!-- 1. Attacker (You) Side -->
    <div class="bg-[#131418] border border-slate-800/90 rounded-xl p-3 relative flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>🗡️</span> Attacker (You)
        </span>
        <span class="text-[10px] text-slate-400 font-medium">
          Spells & Equipments
        </span>
      </div>

      <!-- Attacker TH Dropdown -->
      <div class="relative" bind:this={attackerDropdownRef}>
        <button
          type="button"
          onclick={() => {
            isAttackerOpen = !isAttackerOpen;
            isDefenderOpen = false;
          }}
          class="w-full flex items-center justify-between bg-[#24262c] hover:bg-[#2c2f37] border border-white/10 px-3 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          aria-expanded={isAttackerOpen}
          title="Atur level maksimal spell & hero equipment sesuai TH ini"
        >
          <div class="flex items-center gap-2.5">
            <img
              src="/images/defense/townhall/{calcState.attackerThLevel}.webp"
              alt="TH {calcState.attackerThLevel}"
              width="32"
              height="32"
              class="w-8 h-8 aspect-square object-contain drop-shadow"
            />
            <div class="text-left">
              <div class="text-[10px] text-slate-400 font-medium uppercase leading-none">Town Hall</div>
              <div class="text-base font-extrabold text-white tracking-tight leading-none mt-1">
                Level {calcState.attackerThLevel}
              </div>
            </div>
          </div>
          <span class="text-xs text-slate-400 font-bold transition-transform duration-150 {isAttackerOpen ? 'rotate-180' : ''}">
            ▾
          </span>
        </button>

        {#if isAttackerOpen}
          <div
            class="absolute left-0 top-full mt-1.5 z-50 w-full max-h-64 overflow-y-auto bg-[#1f2127] border border-white/10 rounded-xl shadow-2xl p-1 space-y-0.5 scrollbar-thin"
          >
            {#each thLevelsDescending as th (th)}
              <button
                type="button"
                onclick={() => selectAttackerTH(th)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer {calcState.attackerThLevel === th
                  ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#282a32]'}"
              >
                <div class="flex items-center gap-2.5">
                  <img
                    src="/images/defense/townhall/{th}.webp"
                    alt="TH {th}"
                    width="24"
                    height="24"
                    class="w-6 h-6 aspect-square object-contain drop-shadow shrink-0"
                  />
                  <span class="text-sm font-bold">
                    Town Hall {th}
                  </span>
                </div>
                {#if calcState.attackerThLevel === th}
                  <span class="text-xs text-amber-400 font-bold">Active</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-2 text-[10px] text-slate-500">
        Otomatis set batas level Zap, Quake, dan Equipment ke TH {calcState.attackerThLevel}
      </div>
    </div>

    <!-- Mobile VS Divider -->
    <div class="flex sm:hidden items-center justify-center my-[-2px] relative z-10">
      <span class="px-2.5 py-0.5 rounded-full bg-[#1e2027] border border-slate-700/80 text-[10px] font-black text-orange-400 shadow">
        ⚔️ VS
      </span>
    </div>

    <!-- Desktop Centered VS Badge (Absolute) -->
    <div class="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none items-center justify-center w-8 h-8 rounded-full bg-[#181a20] border border-slate-700/80 shadow-lg text-[11px] font-black text-orange-400">
      VS
    </div>

    <!-- 2. Defender (Enemy Base) Side -->
    <div class="bg-[#131418] border border-slate-800/90 rounded-xl p-3 relative flex flex-col justify-between">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>🛡️</span> Defender (Enemy Base)
        </span>
        <span class="text-[10px] text-slate-400 font-medium">
          Defenses & HP
        </span>
      </div>

      <!-- Defender TH Dropdown -->
      <div class="relative" bind:this={defenderDropdownRef}>
        <button
          type="button"
          onclick={() => {
            isDefenderOpen = !isDefenderOpen;
            isAttackerOpen = false;
          }}
          class="w-full flex items-center justify-between bg-[#24262c] hover:bg-[#2c2f37] border border-white/10 px-3 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          aria-expanded={isDefenderOpen}
          title="Atur level maksimal pertahanan musuh sesuai TH ini"
        >
          <div class="flex items-center gap-2.5">
            <img
              src="/images/defense/townhall/{calcState.targetThLevel}.webp"
              alt="TH {calcState.targetThLevel}"
              width="32"
              height="32"
              class="w-8 h-8 aspect-square object-contain drop-shadow"
            />
            <div class="text-left">
              <div class="text-[10px] text-slate-400 font-medium uppercase leading-none">Town Hall</div>
              <div class="text-base font-extrabold text-white tracking-tight leading-none mt-1">
                Level {calcState.targetThLevel}
              </div>
            </div>
          </div>
          <span class="text-xs text-slate-400 font-bold transition-transform duration-150 {isDefenderOpen ? 'rotate-180' : ''}">
            ▾
          </span>
        </button>

        {#if isDefenderOpen}
          <div
            class="absolute left-0 top-full mt-1.5 z-50 w-full max-h-64 overflow-y-auto bg-[#1f2127] border border-white/10 rounded-xl shadow-2xl p-1 space-y-0.5 scrollbar-thin"
          >
            {#each thLevelsDescending as th (th)}
              <button
                type="button"
                onclick={() => selectDefenderTH(th)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer {calcState.targetThLevel === th
                  ? 'bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#282a32]'}"
              >
                <div class="flex items-center gap-2.5">
                  <img
                    src="/images/defense/townhall/{th}.webp"
                    alt="TH {th}"
                    width="24"
                    height="24"
                    class="w-6 h-6 aspect-square object-contain drop-shadow shrink-0"
                  />
                  <span class="text-sm font-bold">
                    Town Hall {th}
                  </span>
                </div>
                {#if calcState.targetThLevel === th}
                  <span class="text-xs text-sky-400 font-bold">Active</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-2 text-[10px] text-slate-500">
        Otomatis set seluruh gedung pertahanan & HP ke max TH {calcState.targetThLevel}
      </div>
    </div>
  </div>
</div>
