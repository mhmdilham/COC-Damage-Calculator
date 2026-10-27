<script lang="ts">
  import Header from './components/layout/Header.svelte';
  import DamageSourcesBar from './components/offense/DamageSourcesBar.svelte';
  import DefenseGrid from './components/defense/DefenseGrid.svelte';
  import DefenseModal from './components/modal/DefenseModal.svelte';
</script>

<div class="min-h-screen bg-[#111317] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
  <Header />

  <main class="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 space-y-4">
    <!-- Top: Target Town Hall & Attacker Damage Sources -->
    <DamageSourcesBar />

    <!-- Defense Grid (Clashify Style) -->
    <DefenseGrid />
  </main>

  <!-- Detail / Available Combos Modal (Replicating Clashify Modal) -->
  <DefenseModal />

  <footer class="border-t border-slate-800/80 bg-[#121316] py-4 px-4 text-center text-xs text-slate-500 mt-8">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>
        ⚡ CoC ZapQuake Calculator &bull; 100% Client-Side &bull; Svelte 5 + Vite + PWA
      </p>
      <p class="text-[11px] text-slate-600">
        Clash of Clans is a trademark of Supercell.
      </p>
    </div>
  </footer>
</div>
