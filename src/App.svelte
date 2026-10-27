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

  <footer class="border-t border-slate-800/80 bg-[#121316] py-5 px-4 text-xs text-slate-500 mt-8">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
      <p>
        ⚡ CoC ZapQuake Calculator &bull; 100% Client-Side &bull; Svelte 5 + Vite + PWA
      </p>

      <!-- GitHub Link -->
      <a
        href="https://github.com/mhmdilham/COC-Damage-Calculator"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700"
      >
        <svg class="w-4 h-4 fill-current text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        <span class="font-medium text-slate-300 group-hover:text-white">mhmdilham/COC-Damage-Calculator</span>
      </a>

      <p class="text-[11px] text-slate-600">
        Clash of Clans is a trademark of Supercell.
      </p>
    </div>
  </footer>
</div>
