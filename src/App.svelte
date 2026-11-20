<script lang="ts">
  import Header from './components/layout/Header.svelte';
  import DamageSourcesBar from './components/offense/DamageSourcesBar.svelte';
  import DefenseGrid from './components/defense/DefenseGrid.svelte';
  import DefenseModal from './components/modal/DefenseModal.svelte';
</script>

<div class="min-h-screen bg-[#111317] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
  <Header />

  <main class="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 space-y-5">
    <!-- Attacker Damage Sources (ZapQuake & Hero Equipments with Attacker TH Preset) -->
    <DamageSourcesBar />

    <!-- Target Base Defenses & Combos (with Target TH Selector) -->
    <DefenseGrid />
  </main>

  <!-- Detail / Available Combos Modal (Replicating Clashify Modal) -->
  <DefenseModal />

  <footer class="border-t border-slate-800/80 py-3 px-3 sm:px-5 text-center text-[11px] text-slate-500">
    Data synced with <span class="text-slate-300 font-semibold">Clash of Clans — The Clash of Titans (TH 19)</span>
    &bull; Patch <span class="text-amber-400/90 font-semibold">v19.32.4</span> &bull; 16 Nov 2026
  </footer>
</div>
