<script lang="ts">
  import { EQUIPMENTS } from '../../data/offenses';

  interface Props {
    equipmentId: string;
    level: number;
    size?: 'sm' | 'md' | 'lg';
  }

  let { equipmentId, level, size = 'md' }: Props = $props();

  const eq = $derived(EQUIPMENTS[equipmentId]);

  const dimClasses = $derived(
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'lg'
      ? 'w-14 h-14'
      : 'w-11 h-11'
  );

  const levelBadgeClasses = $derived(
    size === 'sm'
      ? 'text-[8px] px-1 py-0'
      : size === 'lg'
      ? 'text-[10px] px-1.5 py-0.5'
      : 'text-[9px] px-1 py-0.2'
  );
</script>

{#if eq}
  <div
    class="relative {dimClasses} bg-slate-900 border {eq.rarity === 'epic' ? 'border-purple-500/70' : 'border-slate-700/80'} rounded-xl overflow-hidden shadow-md flex items-center justify-center shrink-0 select-none group"
    title="{eq.name} (Lv {level})"
  >
    <!-- Equipment Icon -->
    <img
      src={eq.icon}
      alt={eq.name}
      width="44"
      height="44"
      class="w-full h-full aspect-square object-contain p-1"
      decoding="async"
    />

    <!-- Level Overlay (Bottom-center: e.g. 18, 27) -->
    <div class="absolute bottom-0.5 inset-x-0 flex justify-center pointer-events-none">
      <span class="{levelBadgeClasses} font-extrabold bg-slate-950/95 text-amber-300 rounded border border-slate-700/80 shadow-sm leading-none">
        {level}
      </span>
    </div>
  </div>
{/if}
