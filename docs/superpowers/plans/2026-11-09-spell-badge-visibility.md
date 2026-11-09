# Spell Badge Visibility & Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tingkatkan visibilitas jumlah spell (`x{count}`) dengan menempatkannya di sudut kanan atas dalam kapsul gelap (Opsi A) dan selaraskan posisi serta gaya badge level spell ke tengah bawah seperti halnya badge level equipment.

**Architecture:** Memperbarui satu komponen presentasional [SpellBadge.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/ui/SpellBadge.svelte). Komponen ini digunakan di seluruh grid kombinasi pertahanan ([DefenseGrid.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/defense/DefenseGrid.svelte)) dan modal rincian kalkulasi ([DefenseModal.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/modal/DefenseModal.svelte)), sehingga pembaruan otomatis berlaku di semua tampilan tanpa mengubah logika kalkulasi backend.

**Tech Stack:** Svelte 5 (Runes), Tailwind CSS v4, TypeScript, Vitest (`svelte/server` render for testing).

**Spec:** [`docs/superpowers/specs/2026-11-09-spell-badge-visibility-design.md`](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/docs/superpowers/specs/2026-11-09-spell-badge-visibility-design.md)

## Global Constraints

- Komponen harus tetap mendukung tiga varian ukuran: `sm` (40px), `md` (48px), dan `lg` (56px).
- Svelte 5 Runes (`$props()`, `$derived()`) harus tetap digunakan secara konsisten.
- Style level badge harus identik dengan [EquipmentBadge.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/ui/EquipmentBadge.svelte) (`bg-slate-950/95 text-amber-300`).
- Build dan typecheck (`npm run check` & `npm run build`) harus bebas error dan warning.

## Review Focus

1. **Lightning Spell (Zap) artwork overlap:** Kilatan putih/cyan pada ikon Zap tidak boleh lagi menenggelamkan teks `x1`; kapsul `bg-slate-950/92` harus memberikan kontras pekat di sekeliling teks.
2. **Earthquake Spell background:** Badge di kanan atas harus tetap terlihat serasi dan tidak menutupi leher botol spell secara berlebihan.
3. **Ukuran kecil (`sm` 40px):** Pada tampilan kartu defense kompak, badge kanan atas (`x1`) dan badge level tengah bawah (`13`) tidak boleh saling menumpuk.
4. **Ukuran sedang (`md` 48px):** Pada tampilan kartu combo Clashify, proporsi font dan padding badge harus seimbang.
5. **Integritas layout grid:** Perubahan posisi absolut tidak boleh menyebabkan layout shift pada elemen tetangga di [DefenseGrid.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/defense/DefenseGrid.svelte).

---

### Task 1: TDD Implementation of SpellBadge Count & Level Overlays

**Files:**
- Create: `src/components/ui/SpellBadge.test.ts`
- Modify: `src/components/ui/SpellBadge.svelte:23-64`

**Interfaces:**
- Consumes: `Props` (`spellId: 'lightning_spell' | 'earthquake_spell'`, `count: number`, `level: number`, `size?: 'sm' | 'md' | 'lg'`)
- Produces: Updated DOM structure with top-right count pill and bottom-center level pill.

- [ ] **Step 1: Write the failing unit test**

Create `src/components/ui/SpellBadge.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import SpellBadge from './SpellBadge.svelte';

describe('SpellBadge component', () => {
  it('renders count in top-right with dark pill classes', () => {
    const { body } = render(SpellBadge, {
      props: { spellId: 'lightning_spell', count: 1, level: 13, size: 'sm' }
    });

    // Check count text and top-right positioning
    expect(body).toContain('x1');
    expect(body).toContain('top-0.5 right-0.5');
    expect(body).toContain('bg-slate-950/92');
    expect(body).toContain('text-white');
    expect(body).toContain('rounded-full');
  });

  it('renders level at bottom-center identical to EquipmentBadge', () => {
    const { body } = render(SpellBadge, {
      props: { spellId: 'lightning_spell', count: 2, level: 13, size: 'md' }
    });

    // Check level text and bottom-center positioning
    expect(body).toContain('13');
    expect(body).toContain('bottom-0.5 inset-x-0 flex justify-center');
    expect(body).toContain('bg-slate-950/95');
    expect(body).toContain('text-amber-300');
  });

  it('adjusts sizing classes for sm, md, and lg', () => {
    const sm = render(SpellBadge, {
      props: { spellId: 'earthquake_spell', count: 1, level: 5, size: 'sm' }
    });
    expect(sm.body).toContain('w-10 h-10');
    expect(sm.body).toContain('text-[8.5px]');

    const md = render(SpellBadge, {
      props: { spellId: 'earthquake_spell', count: 1, level: 5, size: 'md' }
    });
    expect(md.body).toContain('w-12 h-12');
    expect(md.body).toContain('text-[9.5px]');

    const lg = render(SpellBadge, {
      props: { spellId: 'earthquake_spell', count: 1, level: 5, size: 'lg' }
    });
    expect(lg.body).toContain('w-14 h-14');
    expect(lg.body).toContain('text-xs');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/SpellBadge.test.ts`
Expected: FAIL (assertion fails because current code has `top-0.5 inset-x-0` and `bottom-1 left-1`).

- [ ] **Step 3: Update `src/components/ui/SpellBadge.svelte`**

Update the derived classes and markup:
```svelte
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
    alt={spell.name}
    width="48"
    height="48"
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
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `npx vitest run src/components/ui/SpellBadge.test.ts`
Expected: PASS (all 3 tests pass).

- [ ] **Step 5: Run full test suite & typecheck**

Run: `npm test && npm run check`
Expected: PASS with 0 errors and 0 warnings.

- [ ] **Step 6: Commit changes**

```bash
git add src/components/ui/SpellBadge.svelte src/components/ui/SpellBadge.test.ts
git commit -m "feat(ui): update spell badge count to top-right pill and level to bottom-center"
```

---

### Task 2: Build & Production Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-11-09-spell-badge-visibility.md` (check off completed items)

- [ ] **Step 1: Run production build verification**

Run: `npm run build`
Expected: Built cleanly in `dist/` with no packaging or bundling errors.

- [ ] **Step 2: Clean up brainstorm companion session**

Remove temporary brainstorm directory `.superpowers/brainstorm/session-1/` or stop background server task.

- [ ] **Step 3: Final Commit & Summary**

```bash
git commit --allow-empty -m "chore: complete spell badge visibility improvements"
```
