<script lang="ts">
  interface FaqItem {
    question: string;
    answer: string;
  }

  const faqs: FaqItem[] = [
    {
      question: 'How does the CoC ZapQuake calculator work?',
      answer:
        'Select your Attacker Town Hall (or customize Lightning Spell, Earthquake Spell, and Hero Equipment levels) and pick your Target Town Hall. The calculator instantly shows the exact ZapQuake and Hero Gear combinations needed to destroy every defense.',
    },
    {
      question: 'Which Hero Equipment (Hero Gear) are supported?',
      answer:
        'This CoC damage calculator supports all direct-damage Hero Equipment (Hero Gear): Spiky Ball (Barbarian King), Giant Arrow (Archer Queen), Fireball (Grand Warden), Seeking Shield (Royal Champion), plus Rocket Backpack and Flame Blower (Dragon Duke).',
    },
    {
      question: 'How is Earthquake Spell damage calculated on defenses?',
      answer:
        "The first Earthquake Spell deals full percentage damage based on the building's max HP, while each subsequent Earthquake deals diminishing percentage damage (1/3, 1/5, 1/7, and so on) combined with flat damage from Lightning Spells and Hero Equipment.",
    },
    {
      question: 'Is the calculator synced with the latest Clash of Clans patch?',
      answer:
        'Yes. All defense hitpoints, Town Hall caps up to TH 19, Supercharges, spell damage, and Hero Equipment stats are synced with Clash of Clans Patch v19.32.4 (16 Nov 2026) and work completely client-side and offline.',
    },
  ];
</script>

<section
  aria-labelledby="seo-guide-heading"
  class="rounded-2xl bg-[#16181e]/75 border border-slate-800/80 p-4 sm:p-5 space-y-4 text-slate-300"
>
  <div class="space-y-1.5">
    <h2 id="seo-guide-heading" class="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
      About CoC Damage &amp; ZapQuake Calculator
    </h2>
    <p class="text-xs sm:text-sm leading-relaxed text-slate-400">
      Plan Clash of Clans attacks faster with this free <strong class="text-slate-200 font-semibold">CoC Calculator</strong>
      for <strong class="text-slate-200 font-semibold">ZapQuake</strong> (Lightning Spell &amp; Earthquake Spell) and
      <strong class="text-slate-200 font-semibold">Hero Equipment / Hero Gear</strong> damage. Toggle combinations of
      Zap, Quake, Spiky Ball, Giant Arrow, Fireball, Seeking Shield, Rocket Backpack, and Flame Blower to see exact
      spell counts against key defenses and buildings through Town Hall 19 (Patch v19.32.4).
    </p>
  </div>

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
