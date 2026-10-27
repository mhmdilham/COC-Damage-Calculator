<script lang="ts">
  import { calcState } from '../../state/calculator.svelte';
  import SpellBadge from '../ui/SpellBadge.svelte';

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

  const filteredDefenses = $derived.by(() => {
    let list = calcState.availableDefenses;

    // Filter by tab
    if (calcState.activeCategory === 'key') {
      list = list
        .filter((d) => KEY_DEFENSES.has(d.id))
        .sort((a, b) => KEY_DEFENSES_ORDER.indexOf(a.id) - KEY_DEFENSES_ORDER.indexOf(b.id));
    } else if (calcState.activeCategory === 'standard') {
      list = list.filter((d) => d.type === 'building' && !KEY_DEFENSES.has(d.id));
    } else if (calcState.activeCategory === 'heroes') {
      list = list.filter((d) => d.type === 'hero');
    }

    // Filter by search query
    if (calcState.searchQuery.trim()) {
      const q = calcState.searchQuery.toLowerCase().trim();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    return list;
  });
</script>

<div class="space-y-3">
  <!-- Filter & Search Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
    <!-- Category Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'all')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'all'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        Semua ({calcState.availableDefenses.length})
      </button>

      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'key')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'key'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        ⭐ Utama ({calcState.availableDefenses.filter((d) => KEY_DEFENSES.has(d.id)).length})
      </button>

      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'standard')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'standard'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        🛡️ Standar
      </button>

      <button
        type="button"
        onclick={() => (calcState.activeCategory = 'heroes')}
        class="px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer {calcState.activeCategory === 'heroes'
          ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
          : 'bg-[#181a20] border border-slate-800 text-slate-300 hover:bg-slate-800'}"
      >
        👑 Hero
      </button>
    </div>

    <!-- Search Box -->
    <div class="relative w-full sm:w-56">
      <label for="defense-search-input" class="sr-only">Cari nama bangunan</label>
      <input
        id="defense-search-input"
        name="defense-search"
        type="search"
        autocomplete="off"
        bind:value={calcState.searchQuery}
        placeholder="Cari nama bangunan..."
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

  <!-- Cards Grid (Clashify Style) -->
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {#each filteredDefenses as def (def.id)}
      {@const level = calcState.defenseLevels[def.id] ?? 1}
      {@const maxHp = def.hp[level - 1] ?? def.hp[0]}
      {@const best = calcState.getBestComboFor(def, level)}
      {@const isSupercharge = def.superchargeLevel && level === def.superchargeLevel}
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
            {#if best.totalSpellSpace === 0}
              <span class="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                💥 0 Spell (Equipment)
              </span>
            {:else}
              <div class="flex items-center gap-1.5 justify-center">
                {#if best.zapCount > 0}
                  <SpellBadge
                    spellId="lightning_spell"
                    count={best.zapCount}
                    level={calcState.zapLevel}
                    size="sm"
                  />
                {/if}

                {#if best.zapCount > 0 && best.eqCount > 0}
                  <span class="text-slate-500 font-bold text-sm">+</span>
                {/if}

                {#if best.eqCount > 0}
                  <SpellBadge
                    spellId="earthquake_spell"
                    count={best.eqCount}
                    level={calcState.eqLevel}
                    size="sm"
                  />
                {/if}
              </div>
            {/if}
          {:else}
            {#if def.immune.includes('lightning_spell')}
              <span class="text-[10px] text-amber-400 font-semibold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                ⚡ Kebal Zap
              </span>
            {:else}
              <span class="text-[10px] text-slate-500 font-medium px-2 py-1 rounded bg-slate-900/60 border border-slate-800/80">
                🛡️ Kebal / &gt;11 Slot
              </span>
            {/if}
          {/if}
        </div>

        <!-- Middle: Building Image -->
        <div class="w-14 h-14 flex items-center justify-center my-1">
          <img
            src={imgSrc}
            alt="{def.name} Level {level}"
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
              Lv {level}
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
</div>
