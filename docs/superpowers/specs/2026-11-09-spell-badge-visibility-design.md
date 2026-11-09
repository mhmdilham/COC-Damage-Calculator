# Design Doc: Peningkatan Visibilitas Badge Jumlah & Level Spell

## Intent & Why
Teks jumlah spell (`x1`) pada [SpellBadge.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/ui/SpellBadge.svelte) sebelumnya berupa teks putih biasa dengan drop-shadow tipis di posisi tengah atas. Akibatnya, pada ikon seperti **Lightning Spell (Zap)** yang memiliki kilatan petir putih/cyan terang di bagian atas, teks `x1` tenggelam dan sulit dibaca. Selain itu, tata letak badge level spell (sebelumnya di pojok kiri bawah) perlu diselaraskan dengan badge level equipment (di tengah bawah).

## Goals, Non-Goals, Anti-Goals
- **Goals:**
  - Menempatkan badge level spell di **tengah bawah** dengan style dan kelas yang identik dengan [EquipmentBadge.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/ui/EquipmentBadge.svelte).
  - Menempatkan badge jumlah spell (`x{count}`) di **kanan atas** menggunakan kapsul gelap (Opsi A: Dark Slate & White).
  - Memastikan angka `x1` terlihat 100% kontras dan tajam pada semua jenis icon spell (baik Lightning Spell maupun Earthquake Spell) di semua varian ukuran (`sm`, `md`, `lg`).
- **Non-Goals:**
  - Mengubah logika perhitungan damage spell atau state kalkulator.
  - Mengubah tampilan [EquipmentBadge.svelte](file:///c:/Users/Ilham/Documents/code/coc_damage_calculator_rebuild/src/components/ui/EquipmentBadge.svelte).
- **Anti-Goals:**
  - Menutupi terlalu banyak area artwork spell atau membuat badge keluar dari batas rounded border kartu.

## Approaches Considered
1. **Opsi A (Dipilih): Dark Slate & White Pill di Kanan Atas**
   - Kapsul gelap `bg-slate-950/92` dengan border slate/silver dan teks putih tebal `font-black`.
   - *Alasan dipilih*: Kontras maksimal di atas artwork petir putih tanpa bentrok dengan warna spell apa pun, bersih, netral, dan disetujui pengguna.
2. **Opsi B: Golden Amber Accent**
   - Kapsul gelap dengan border dan teks emas/amber.
   - *Trade-off*: Kurang membedakan antara informasi jumlah spell dan informasi level spell.
3. **Opsi C: Electric Cyan Accent**
   - Kapsul navy dengan aksen border dan teks cyan sihir.
   - *Trade-off*: Kurang netral pada spell yang tidak bertema petir/es.
4. **Opsi D: Crimson Red Badge**
   - Badge notifikasi merah solid ala Supercell.
   - *Trade-off*: Terlalu kontras/mencolok dibanding elemen UI lainnya.

## Detailed Design
Komponen yang diubah: `src/components/ui/SpellBadge.svelte`.

### 1. Level Spell (Bawah Tengah)
- **Container**: `absolute bottom-0.5 inset-x-0 flex justify-center pointer-events-none`
- **Class**: `font-extrabold bg-slate-950/95 text-amber-300 rounded border border-slate-700/80 shadow-sm leading-none`
- **Ukuran Badge**:
  - `sm`: `text-[8px] px-1 py-0`
  - `md`: `text-[9px] px-1 py-0.2`
  - `lg`: `text-[10px] px-1.5 py-0.5`

### 2. Jumlah Spell (Kanan Atas)
- **Container**: `absolute top-0.5 right-0.5 pointer-events-none z-10`
- **Class**: `font-black bg-slate-950/92 text-white rounded-full border border-slate-600/80 shadow-sm leading-none tracking-tight flex items-center justify-center`
- **Ukuran Badge**:
  - `sm`: `text-[8.5px] px-1 py-0.2 min-w-[13px] h-[12px]`
  - `md`: `text-[9.5px] px-1.5 py-0.5 min-w-[15px] h-[14px]`
  - `lg`: `text-xs px-2 py-0.5 min-w-[18px] h-[16px]`

## What's Left to the Builder
- Menguji tampilan pada `DefenseGrid.svelte` (tampilan kombinasi dan tampilan per-defense) serta `DefenseModal.svelte`.
- Memastikan tidak ada regresi visual pada ukuran kartu `sm`, `md`, maupun `lg`.
