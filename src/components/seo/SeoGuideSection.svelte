<script lang="ts">
  import {
    REFERENCE_TABLE_COLUMNS,
    buildTh19Highlights,
    buildZapQuakeReferenceRows,
  } from '../../data/zapquakeReference';

  interface FaqItem {
    question: string;
    answer: string;
  }

  const referenceRows = buildZapQuakeReferenceRows();
  const th19Highlights = buildTh19Highlights();

  const faqs: FaqItem[] = [
    {
      question: 'How does the CoC ZapQuake calculator work?',
      answer:
        'Select your Attacker Town Hall (or customize Lightning Spell, Earthquake Spell, and Hero Equipment levels) and pick your Target Town Hall. By default it compares TH 19 vs TH 19 max stats, and any custom setup can be copied as a shareable link.',
    },
    {
      question: 'Does Giant Arrow one-shot Air Defense in Clash of Clans?',
      answer:
        'Yes. Giant Arrow deals 2x damage to Air Defenses. At every Town Hall from TH 9 to TH 19, a maxed Giant Arrow for that Town Hall (up to 1,500 x 2 = 3,000 DMG at Lv 18) one-shots a max Air Defense (2,150 HP at TH 19 Lv 17).',
    },
    {
      question: 'Which Hero Equipment (Hero Gear) are supported?',
      answer:
        'This CoC damage calculator supports all direct-damage Hero Equipment (Hero Gear): Spiky Ball (Barbarian King, up to 3,250 DMG), Giant Arrow (Archer Queen, 2x Air Defense), Fireball (Grand Warden, up to 4,100 DMG), Seeking Shield (Royal Champion, up to 2,500 DMG), plus Rocket Backpack and Flame Blower (Dragon Duke).',
    },
    {
      question: 'How is Earthquake Spell damage calculated on defenses?',
      answer:
        "The first Earthquake Spell deals full percentage damage based on the building's max HP (29% at Lv 5+), while subsequent Earthquakes deal diminishing fractions (1/3, 1/5, 1/7 = 9.67%, 5.80%, 4.14% at Lv 5) combined with flat Lightning Spell and Hero Gear damage.",
    },
    {
      question: 'Where do the stats come from and is it synced with Patch v19.32.4?',
      answer:
        'All defense HP, Town Hall caps up to TH 19, Supercharges, spell damage, and Hero Equipment stats are verified against official Supercell Patch v19.32.4 (16 Nov 2026) release notes and community Clash of Clans Wiki data, running 100% client-side and offline.',
    },
  ];
</script>

<section
  aria-labelledby="seo-guide-heading"
  class="rounded-2xl bg-[#16181e]/75 border border-slate-800/80 p-4 sm:p-5 space-y-5 text-slate-300"
>
  <div class="space-y-1.5">
    <h2 id="seo-guide-heading" class="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
      About CoC Damage &amp; ZapQuake Calculator
    </h2>
    <p class="text-xs sm:text-sm leading-relaxed text-slate-400">
      Plan Clash of Clans war and legend attacks with this free <strong class="text-slate-200 font-semibold">CoC Calculator</strong>
      for <strong class="text-slate-200 font-semibold">ZapQuake</strong> (Lightning Spell &amp; Earthquake Spell) and
      <strong class="text-slate-200 font-semibold">Hero Equipment / Hero Gear</strong> combos. Stats are verified against
      Clash of Clans <strong class="text-slate-200 font-semibold">Patch v19.32.4 (16 Nov 2026)</strong> and community CoC Wiki
      tables through Town Hall 19.
    </p>
  </div>

  <!-- Static Quick ZapQuake Reference Table (AEO / Direct Answer) -->
  <div class="space-y-2">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">
        Quick ZapQuake Reference (Same-TH Max Defenses &amp; Spells, No Equipment)
      </h3>
      <span class="text-[11px] text-slate-500">
        Minimum spell slots &bull; EQ tie-breaker for wider splash
      </span>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#12141a]/80">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="border-b border-slate-800/80 bg-[#181b22] text-slate-300">
            <th scope="col" class="py-2 px-3 font-bold whitespace-nowrap">Town Hall</th>
            {#each REFERENCE_TABLE_COLUMNS as col (col.id)}
              <th scope="col" class="py-2 px-3 font-bold whitespace-nowrap">{col.label}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          {#each referenceRows as row (row.th)}
            <tr class="hover:bg-white/[0.02]">
              <th scope="row" class="py-2 px-3 font-bold text-amber-300 whitespace-nowrap">
                TH {row.th}
                <span class="block text-[10px] font-normal text-slate-500">
                  Zap {row.zapLevel} / EQ {row.eqLevel}
                </span>
              </th>
              {#each REFERENCE_TABLE_COLUMNS as col (col.id)}
                {@const cell = row.cells[col.id]}
                <td class="py-2 px-3 whitespace-nowrap">
                  {#if cell}
                    <span class="font-semibold text-slate-200">{cell.comboText}</span>
                    <span class="block text-[10px] text-slate-500">
                      Lv {cell.level} &bull; {cell.hp.toLocaleString('en-US')} HP
                    </span>
                  {:else}
                    <span class="text-slate-600">—</span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if th19Highlights.length > 0}
      <p class="text-[11px] sm:text-xs leading-relaxed text-slate-400">
        <strong class="text-slate-200 font-semibold">TH 19 Key Defenses (Zap 14 / EQ 5):</strong>
        {#each th19Highlights as item, idx (item.id)}
          {idx > 0 ? ' • ' : ' '}{item.name}: <span class="text-slate-200 font-medium">{item.cell.comboText}</span> ({item.cell.hp.toLocaleString('en-US')} HP)
        {/each}
      </p>
    {/if}
  </div>

  <!-- Concise FAQ -->
  <div class="space-y-2">
    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
      Frequently Asked Questions
    </h3>
    <div class="divide-y divide-slate-800/70 rounded-xl border border-slate-800/70 bg-[#12141a]/70">
      {#each faqs as item (item.question)}
        <details class="group px-3.5 py-2.5">
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            <span>{item.question}</span>
            <span
              class="text-slate-500 text-xs transition-transform duration-200 group-open:rotate-180 select-none"
              aria-hidden="true"
            >
              ▾
            </span>
          </summary>
          <p class="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
            {item.answer}
          </p>
        </details>
      {/each}
    </div>
  </div>
</section>
