import fs from 'node:fs';
import path from 'node:path';
import { DEFENSES } from '../src/data/defenses';
import { SPELLS, EQUIPMENTS } from '../src/data/offenses';
import { resolveDefenseImageLevel, getVariantSrc } from '../src/lib/images';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const IMAGES_DIR = path.resolve(PUBLIC_DIR, 'images');

interface UnusedFile {
  path: string;
  absPath: string;
  size: number;
  category: string;
  reason: string;
}

interface MissingFile {
  expectedPath: string;
  referencedBy: string;
}

function getAllFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function runAudit() {
  const allImageFiles = getAllFiles(IMAGES_DIR);
  const registeredImagePaths = new Set<string>();
  const missingFiles: MissingFile[] = [];

  function expectImage(relPath: string, referencedBy: string) {
    const cleanRel = relPath.startsWith('/') ? relPath.slice(1) : relPath;
    const absPath = path.resolve(PUBLIC_DIR, cleanRel);
    registeredImagePaths.add(path.normalize(absPath).toLowerCase());

    if (!fs.existsSync(absPath)) {
      missingFiles.push({ expectedPath: relPath, referencedBy });
    }
  }

  function expectSpriteWithVariants(
    relPath: string,
    referencedBy: string,
    extraSuffixes: Array<'@1x' | '@sm'> = ['@1x']
  ) {
    expectImage(relPath, referencedBy);
    for (const suffix of extraSuffixes) {
      expectImage(getVariantSrc(relPath, suffix), `${referencedBy} (${suffix})`);
    }
  }

  // 1. Spells & Equipments aktif
  for (const [id, spell] of Object.entries(SPELLS)) {
    if (spell.icon) expectSpriteWithVariants(spell.icon, `SPELLS.${id}`);
  }

  for (const [id, eq] of Object.entries(EQUIPMENTS)) {
    if (eq.icon) expectSpriteWithVariants(eq.icon, `EQUIPMENTS.${id}`);
  }

  // 2. Defenses & Heroes
  for (const [defId, def] of Object.entries(DEFENSES)) {
    if (def.icon) {
      expectSpriteWithVariants(def.icon, `DEFENSES.${defId}.icon`);
    }

    if (def.type === 'hero') {
      // Hero hanya memakai icon atau level 1
      expectSpriteWithVariants(`/images/defense/${defId}/1.webp`, `DEFENSES.${defId} (hero)`);
    } else {
      // Building memakai level visual unik (supercharge & spriteLevelMap terdeduplikasi)
      const maxLevel = def.hp.length;
      const expectedLevels = new Set<number>();
      for (let lvl = 1; lvl <= maxLevel; lvl++) {
        expectedLevels.add(resolveDefenseImageLevel(def, lvl));
      }

      for (const imgLvl of expectedLevels) {
        expectSpriteWithVariants(
          `/images/defense/${defId}/${imgLvl}.webp`,
          `DEFENSES.${defId} level ${imgLvl}`
        );
      }
    }
  }

  // 3. Fallback & Static Assets
  expectSpriteWithVariants('/images/other/defense.webp', 'Fallback UI defense icon');

  // Favicon folder (semua asset favicon dipertahankan untuk PWA/meta)
  const faviconDir = path.join(IMAGES_DIR, 'favicon');
  if (fs.existsSync(faviconDir)) {
    const faviconFiles = getAllFiles(faviconDir);
    for (const file of faviconFiles) {
      registeredImagePaths.add(path.normalize(file).toLowerCase());
    }
  }

  // Town Hall levels (TH 1 - 19) + @1x & @sm variants
  for (let th = 1; th <= 19; th++) {
    expectSpriteWithVariants(
      `/images/defense/townhall/${th}.webp`,
      `Town Hall level ${th}`,
      ['@1x', '@sm']
    );
  }

  // 4. Klasifikasi File yang Tidak Terpakai
  const unusedFiles: UnusedFile[] = [];

  for (const file of allImageFiles) {
    const normFile = path.normalize(file).toLowerCase();
    const relToProject = path.relative(process.cwd(), file).replace(/\\/g, '/');

    if (!registeredImagePaths.has(normFile)) {
      const stat = fs.statSync(file);
      const filename = path.basename(file);

      let category = 'Lainnya';
      let reason = 'File tidak terdaftar di data aplikasi';

      if (file.includes('defense')) {
        const parts = relToProject.split('/');
        const defFolder = parts[3];
        if (!DEFENSES[defFolder]) {
          category = 'Unused Defense Folder';
          reason = `Folder defense '${defFolder}' tidak ada di defenses.ts`;
        } else if (filename.endsWith('.webp') && !filename.match(/^\d+\.webp$/)) {
          category = 'Redundant Hero Duplicate';
          reason = `Duplikat redundan (aplikasi sudah memakai 1.webp)`;
        } else {
          category = 'Supercharge / Exceed Max Level';
          reason = `Level duplikat supercharge (UI otomatis memakai level sebelumnya)`;
        }
      } else if (file.includes('offense')) {
        category = 'Unused Offense Item';
        reason = `Item tidak ada di daftar aktif offenses.ts`;
      }

      unusedFiles.push({
        path: relToProject,
        absPath: file,
        size: stat.size,
        category,
        reason
      });
    }
  }

  return {
    unusedFiles,
    missingFiles,
    totalScanned: allImageFiles.length
  };
}

const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete') || args.includes('--clean');

const result = runAudit();

console.log('\n============================================================');
console.log('       COC DAMAGE CALCULATOR - IMAGE AUDIT REPORT           ');
console.log('============================================================\n');

console.log(`Total gambar discan : ${result.totalScanned}`);
console.log(`Gambar aktif dipakai : ${result.totalScanned - result.unusedFiles.length}`);
console.log(`Gambar tidak terpakai: ${result.unusedFiles.length}`);
console.log(`Gambar hilang/kurang : ${result.missingFiles.length}`);

if (result.unusedFiles.length > 0) {
  const totalWastedBytes = result.unusedFiles.reduce((acc, f) => acc + f.size, 0);
  console.log(`\n[!] DITEMUKAN ${result.unusedFiles.length} GAMBAR TIDAK TERPAKAI (Hemat: ${formatBytes(totalWastedBytes)}):`);
  console.log('------------------------------------------------------------');

  // Kelompokkan per kategori
  const groupedByCategory: Record<string, UnusedFile[]> = {};
  for (const item of result.unusedFiles) {
    if (!groupedByCategory[item.category]) groupedByCategory[item.category] = [];
    groupedByCategory[item.category].push(item);
  }

  for (const [category, items] of Object.entries(groupedByCategory)) {
    const catBytes = items.reduce((acc, i) => acc + i.size, 0);
    console.log(`\n📌 ${category.toUpperCase()} (${items.length} file - ${formatBytes(catBytes)}):`);
    for (const item of items) {
      console.log(`   • ${item.path} (${formatBytes(item.size)})`);
      console.log(`     └─ Alasan: ${item.reason}`);
    }
  }

  if (shouldDelete) {
    console.log('\n------------------------------------------------------------');
    console.log(`🗑️  Menghapus ${result.unusedFiles.length} file gambar tidak terpakai...`);
    let deletedCount = 0;
    for (const item of result.unusedFiles) {
      try {
        fs.unlinkSync(item.absPath);
        deletedCount++;
      } catch (err) {
        console.error(`Gagal menghapus ${item.path}:`, err);
      }
    }
    console.log(`✅ Berhasil menghapus ${deletedCount} file! Menghemat ruang ${formatBytes(totalWastedBytes)}.`);

    // Bersihkan folder kosong di public/images/defense jika ada
    const defenseDir = path.join(IMAGES_DIR, 'defense');
    if (fs.existsSync(defenseDir)) {
      for (const sub of fs.readdirSync(defenseDir)) {
        const subPath = path.join(defenseDir, sub);
        if (fs.statSync(subPath).isDirectory() && fs.readdirSync(subPath).length === 0) {
          fs.rmdirSync(subPath);
          console.log(`📁 Menghapus folder kosong: public/images/defense/${sub}`);
        }
      }
    }
  } else {
    console.log('\n------------------------------------------------------------');
    console.log('💡 Tips: Untuk menghapus semua gambar tidak terpakai ini secara otomatis,');
    console.log('   jalankan perintah:');
    console.log('   npm run audit:images -- --delete');
  }
} else {
  console.log('\n✅ SEMPURNA! Tidak ada gambar yang menganggur di proyek Anda.');
}

if (result.missingFiles.length > 0) {
  console.log(`\n[X] PERINGATAN: ${result.missingFiles.length} GAMBAR DIHARAPKAN TAPI TIDAK DITEMUKAN:`);
  console.log('------------------------------------------------------------');
  for (const item of result.missingFiles) {
    console.log(`   • ${item.expectedPath} (Dibutuhkan oleh: ${item.referencedBy})`);
  }
}

console.log('\n============================================================\n');
