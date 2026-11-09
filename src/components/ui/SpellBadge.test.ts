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
