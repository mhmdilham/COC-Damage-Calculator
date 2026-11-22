import { createHash } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const ssrOutDir = resolve(rootDir, 'node_modules/.tmp/ssr');
const indexPath = resolve(distDir, 'index.html');
const swPath = resolve(distDir, 'sw.js');

async function prerender() {
  try {
    await build({
      root: rootDir,
      configFile: false,
      logLevel: 'silent',
      plugins: [svelte()],
      build: {
        ssr: resolve(rootDir, 'src/entry-server.ts'),
        outDir: ssrOutDir,
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: 'entry-server.mjs',
            format: 'es',
          },
        },
      },
    });

    const entryUrl = pathToFileURL(resolve(ssrOutDir, 'entry-server.mjs')).href;
    const { renderApp } = await import(entryUrl);
    const { body } = renderApp();

    const html = await readFile(indexPath, 'utf8');
    const appContainerRegex = /<div id="app"><\/div>/;
    if (!appContainerRegex.test(html)) {
      throw new Error('Could not find empty <div id="app"></div> placeholder in dist/index.html');
    }

    const prerenderedHtml = html.replace(appContainerRegex, `<div id="app">${body}</div>`);
    await writeFile(indexPath, prerenderedHtml, 'utf8');

    // Keep Workbox precache revision for index.html in sync with the prerendered file
    try {
      const swContent = await readFile(swPath, 'utf8');
      const newRevision = createHash('md5').update(prerenderedHtml).digest('hex');
      const updatedSw = swContent.replace(
        /(\{url:"index\.html",revision:")([a-f0-9]+)("\})/,
        `$1${newRevision}$3`
      );
      if (updatedSw !== swContent) {
        await writeFile(swPath, updatedSw, 'utf8');
      }
    } catch {
      // sw.js may not exist if PWA is disabled
    }

    console.log('[prerender] Injected static HTML into dist/index.html');
  } finally {
    await rm(ssrOutDir, { recursive: true, force: true });
  }
}

prerender().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exit(1);
});
