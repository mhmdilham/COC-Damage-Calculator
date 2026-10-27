<script lang="ts">
  import { calcState } from '../../state/calculator.svelte';
  import { DEFENSES } from '../../data/defenses';
  import SpellBadge from '../ui/SpellBadge.svelte';
  import EquipmentBadge from '../ui/EquipmentBadge.svelte';

  const defenseId = $derived(calcState.selectedDefenseId);
  const defense = $derived(defenseId ? DEFENSES[defenseId] : null);

  const currentLevel = $derived(
    defense ? calcState.defenseLevels[defense.id] ?? 1 : 1
  );

  const maxLevel = $derived(defense ? defense.hp.length : 1);

  const currentHp = $derived(
    defense ? defense.hp[currentLevel - 1] ?? defense.hp[0] : 0
  );

  const combos = $derived(
    defense ? calcState.getCombosFor(defense, currentLevel) : []
  );

  const isSupercharge = $derived(
    !!(defense && defense.superchargeLevel && currentLevel === defense.superchargeLevel)
  );

  const displayLevel = $derived(
    isSupercharge ? currentLevel - 1 : currentLevel
  );

  const displayMaxLevel = $derived(
    defense?.superchargeLevel && maxLevel === defense.superchargeLevel
      ? maxLevel - 1
      : maxLevel
  );

  const imageLevel = $derived(
    defense && defense.superchargeLevel && currentLevel >= defense.superchargeLevel
      ? defense.superchargeLevel - 1
      : currentLevel
  );

  const heroOrBuildingImg = $derived(
    defense?.type === 'hero'
      ? (defense.icon || `/images/defense/${defense.id}/1.webp`)
      : `/images/defense/${defense?.id}/${imageLevel}.webp`
  );

  function handleLevelChange(e: Event) {
    if (!defense) return;
    const target = e.target as HTMLInputElement;
    calcState.setDefenseLevel(defense.id, Number(target.value));
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      calcState.closeModal();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      calcState.closeModal();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if defense}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={handleBackdropClick}
    class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
  >
    <!-- Modal Card -->
    <div class="bg-[#1c1e24] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Modal Header -->
      <div class="px-5 pt-4 pb-2 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight">
            {defense.name}
          </h2>
          <p class="text-xs text-slate-400 font-medium">Available combos</p>
        </div>

        <button
          type="button"
          onclick={() => calcState.closeModal()}
          class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-base leading-none"
          title="Close"
        >
          ✕
        </button>
      </div>

      <!-- Target Building Header Box with Slider & HP -->
      <div class="px-5 py-2">
        <div class="bg-[#16171b] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <!-- Thumbnail & Name -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 bg-slate-900 rounded-lg border border-slate-800 p-1 flex items-center justify-center shrink-0">
                <img
                  src={heroOrBuildingImg}
                  alt="{defense.name} Level {displayLevel}"
                  width="48"
                  height="48"
                  class="w-full h-full aspect-square object-contain drop-shadow"
                  onerror={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.src.endsWith('/1.webp')) {
                      img.src = `/images/defense/${defense.id}/1.webp`;
                    } else {
                      img.onerror = null;
                      img.src = '/images/other/defense.webp';
                    }
                  }}
                />
              </div>

              <div class="truncate">
                <div class="text-sm font-bold text-white truncate">
                  {defense.name}
                </div>
                <div class="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Level {displayLevel}</span>
                  {#if isSupercharge}
                    <span class="text-amber-400 font-bold tracking-tight" title="Supercharge (⚡⚡)">⚡⚡</span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- HP Badge with Heart -->
            <div class="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0">
              <span class="text-rose-500 text-xs">❤️</span>
              <span class="text-xs font-bold text-white tracking-tight">
                {currentHp.toLocaleString()}
              </span>
            </div>
          </div>

          <!-- Level Slider with Orange Accent (Exact like Clashify) -->
          <div class="pt-1">
            <label for="defense-level-slider" class="sr-only">Level {defense.name}</label>
            <input
              id="defense-level-slider"
              name="defense-level-slider"
              type="range"
              min="1"
              max={maxLevel}
              value={currentLevel}
              oninput={handleLevelChange}
              class="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div class="flex justify-between text-[10px] text-slate-500 pt-1 font-semibold">
              <span>Lv 1</span>
              <span>Slide to adjust level</span>
              <span class="flex items-center gap-0.5">
                Lv {displayMaxLevel}
                {#if defense.superchargeLevel && maxLevel === defense.superchargeLevel}
                  <span class="text-amber-400">⚡⚡</span>
                {/if}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Combos List -->
      <div class="px-5 pb-5 pt-1 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
        {#if combos.length > 0}
          {#each combos as combo, idx (idx)}
            <div class="bg-[#24262d] border border-slate-800/90 rounded-xl p-3 flex items-center justify-center gap-3 transition-colors hover:border-slate-700 flex-wrap">
              {#if combo.totalSpellSpace === 0}
                <div class="flex items-center justify-center gap-2 flex-wrap py-1">
                  {#each calcState.enabledEquipments as eq (eq.id)}
                    <EquipmentBadge
                      equipmentId={eq.id}
                      level={eq.level}
                      size="md"
                    />
                  {/each}
                  <span class="text-emerald-400 font-bold text-xs ml-1">
                    💥 Destroyed entirely by Hero Equipment!
                  </span>
                </div>
              {:else}
                <!-- Spell Badges -->
                {#if combo.zapCount > 0}
                  <SpellBadge
                    spellId="lightning_spell"
                    count={combo.zapCount}
                    level={calcState.zapLevel}
                    size="md"
                  />
                {/if}

                {#if combo.zapCount > 0 && combo.eqCount > 0}
                  <span class="text-slate-400 font-bold text-lg select-none">+</span>
                {/if}

                {#if combo.eqCount > 0}
                  <SpellBadge
                    spellId="earthquake_spell"
                    count={combo.eqCount}
                    level={calcState.eqLevel}
                    size="md"
                  />
                {/if}

                {#if (combo.zapCount > 0 || combo.eqCount > 0) && calcState.enabledEquipments.length > 0}
                  <span class="text-slate-400 font-bold text-lg select-none">+</span>
                {/if}

                {#each calcState.enabledEquipments as eq (eq.id)}
                  <EquipmentBadge
                    equipmentId={eq.id}
                    level={eq.level}
                    size="md"
                  />
                {/each}

                <!-- Spell space badge on right -->
                <span class="ml-2 text-[10px] bg-slate-900 border border-slate-700/60 text-slate-400 font-semibold px-2 py-1 rounded-md shrink-0">
                  {combo.totalSpellSpace} Slot{combo.totalSpellSpace > 1 ? 's' : ''}
                </span>
              {/if}
            </div>
          {/each}
        {:else}
          <div class="bg-[#16171b] border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500 italic space-y-1">
            <p>🛡️ Cannot be destroyed with the current spell setup.</p>
            <p class="text-[11px] text-slate-600">Requires more than 11 spell slots. Try enabling Hero Equipment or increasing spell levels.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
