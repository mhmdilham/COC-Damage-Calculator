<script lang="ts">
  import { SPELLS } from '../../data/offenses';

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

  const countTextClasses = $derived(
    size === 'sm'
      ? 'text-[11px] font-black'
      : size === 'lg'
      ? 'text-sm font-black'
      : 'text-xs font-black'
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
    alt={spell.name}
    width="48"
    height="48"
    class="w-full h-full aspect-square object-cover p-1 scale-105"
    decoding="async"
  />

  <!-- Count Overlay (Top: e.g. x5, x2) -->
  <div class="absolute top-0.5 inset-x-0 flex justify-center pointer-events-none">
    <span class="{countTextClasses} text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)] tracking-tight">
      x{count}
    </span>
  </div>

  <!-- Level Overlay (Bottom-left/center: e.g. 13, 5) -->
  <div class="absolute bottom-1 left-1 pointer-events-none">
    <span class="{levelBadgeClasses} font-extrabold bg-slate-950/90 text-amber-300 rounded border border-slate-700/80 shadow-sm leading-none">
      {level}
    </span>
  </div>
</div>
