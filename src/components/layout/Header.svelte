<script lang="ts">
  import { calcState } from '../../state/calculator.svelte';

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyShareLink() {
    const shareUrl = calcState.getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      // Fallback if Clipboard API is unavailable
      window.history.replaceState(null, '', shareUrl);
    }
  }
</script>

<header class="bg-[#121316]/95 backdrop-blur border-b border-slate-800 sticky top-0 z-30 shadow-md">
  <div class="max-w-6xl w-full mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
    <!-- Brand -->
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg shadow-sm shrink-0">
        ⚡
      </div>
      <div class="flex flex-col min-w-0">
        <div class="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
          <h1 class="text-base font-extrabold tracking-tight text-white truncate leading-tight">
            COC Damage Calculator
          </h1>
          <span
            class="inline-flex items-center gap-1 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 tracking-tight whitespace-nowrap"
            title="Clash of Clans: The Clash of Titans (Town Hall 19) — Official Supercell Patch v19.32.4 (16 November 2026)"
          >
            <span>TH 19</span>
            <span class="text-amber-500/70">&bull;</span>
            <span>v19.32.4</span>
            <span class="hidden md:inline text-amber-400/80 font-medium">(16 Nov 2026)</span>
          </span>
        </div>
        <p class="hidden sm:block text-[11px] text-slate-400 truncate leading-tight mt-0.5">
          ZapQuake (Lightning &amp; Earthquake) &amp; Hero Equipment / Gear
        </p>
      </div>
    </div>

    <!-- Actions: Share Preset + GitHub -->
    <div class="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onclick={copyShareLink}
        class="h-9 px-2.5 sm:px-3 rounded-xl bg-[#1c1e24] hover:bg-[#252831] border border-white/10 hover:border-white/20 flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
        title="Copy shareable preset URL"
        aria-label="Copy shareable preset URL"
      >
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span class="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
      </button>

      <a
        href="https://github.com/mhmdilham/COC-Damage-Calculator"
        target="_blank"
        rel="noopener noreferrer"
        class="w-9 h-9 rounded-xl bg-[#1c1e24] hover:bg-[#252831] border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 group cursor-pointer"
        title="GitHub Repository"
        aria-label="GitHub Repository"
      >
        <svg class="w-5 h-5 fill-current text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </a>
    </div>
  </div>
</header>
