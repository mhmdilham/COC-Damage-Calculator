<script lang="ts">
  import Header from './components/layout/Header.svelte';
  import DamageSourcesBar from './components/offense/DamageSourcesBar.svelte';
  import DefenseGrid from './components/defense/DefenseGrid.svelte';
  import DefenseModal from './components/modal/DefenseModal.svelte';
</script>

<div class="min-h-screen bg-[#111317] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
  <Header />

  <main class="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 space-y-4">
    <!-- Attacker Damage Sources (ZapQuake & Hero Equipments with Attacker TH Preset) -->
    <DamageSourcesBar />

    <!-- Target Base Defenses & Combos (with Target TH Selector) -->
    <DefenseGrid />
  </main>

  <!-- Detail / Available Combos Modal (Replicating Clashify Modal) -->
  <DefenseModal />
</div>
