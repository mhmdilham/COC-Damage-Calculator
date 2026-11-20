<script lang="ts">
  import { SPELLS } from '../../data/offenses';
  import { getResponsiveSrcSet } from '../../lib/images';

  interface Props {
    spellId: 'lightning_spell' | 'earthquake_spell';
    count: number;
    level: number;
    size?: 'sm' | 'md' | 'lg';
  }

  let { spellId, count, level, size = 'md' }: Props = $props();

  const spell = $derived(SPELLS[spellId]);

  const dimClasses = $derived(
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'lg'
      ? 'w-14 h-14'
      : 'w-12 h-12'
  );

  const imgPx = $derived(size === 'sm' ? 40 : size === 'lg' ? 56 : 48);

  const countBadgeClasses = $derived(
    size === 'sm'
      ? 'text-[8.5px] px-1 py-0.2 min-w-[13px] h-[12px]'
      : size === 'lg'
      ? 'text-xs px-2 py-0.5 min-w-[18px] h-[16px]'
      : 'text-[9.5px] px-1.5 py-0.5 min-w-[15px] h-[14px]'
  );

  const levelBadgeClasses = $derived(
    size === 'sm'
      ? 'text-[8px] px-1 py-0'
      : size === 'lg'
      ? 'text-[10px] px-1.5 py-0.5'
      : 'text-[9px] px-1 py-0.2'
  );
</script>

<div class="relative {dimClasses} bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-md flex items-center justify-center shrink-0 select-none group">
  <!-- Spell Icon -->
  <img
    src={spell.icon}
    srcset={getResponsiveSrcSet(spell.icon)}
    alt={spell.name}
    width={imgPx}
    height={imgPx}
    class="w-full h-full aspect-square object-cover p-1 scale-105"
    decoding="async"
  />

  <!-- Count Overlay (Top-Right: e.g. x1, x5) - Option A Dark Slate Pill -->
  <div class="absolute top-0.5 right-0.5 pointer-events-none z-10">
    <span class="{countBadgeClasses} font-black bg-slate-950/92 text-white rounded-full border border-slate-600/80 shadow-sm leading-none tracking-tight flex items-center justify-center">
      x{count}
    </span>
  </div>

  <!-- Level Overlay (Bottom-Center: e.g. 13, 5) - Identical to EquipmentBadge -->
  <div class="absolute bottom-0.5 inset-x-0 flex justify-center pointer-events-none">
    <span class="{levelBadgeClasses} font-extrabold bg-slate-950/95 text-amber-300 rounded border border-slate-700/80 shadow-sm leading-none">
      {level}
    </span>
  </div>
</div>
