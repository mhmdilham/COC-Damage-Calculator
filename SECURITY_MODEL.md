# Security Model: COC-Damage-Calculator

_This file describes how the app is built and where its security boundaries are. Statements marked **Maintainer-confirmed** come from the maintainer; the rest describes the code as of commit 2ee7b1f. Security scans use this file as their starting point, so please keep it current when the architecture changes._

## System overview
A static, client-only single-page app (Svelte 5 + TypeScript, built with Vite 8, Tailwind v4 and `vite-plugin-pwa`). It works out Clash of Clans spell and hero-equipment damage combos. It is deployed as static files to Netlify at `https://coccalculator.netlify.app/` (per the `og:url` in `index.html`). It has no backend, API, accounts, authentication, cookies or secrets. All computation happens in the visitor's browser (`src/engine/calculator.ts`).

### Trust boundaries
1. **Internet → visitor's browser**: anyone can load the site. The app reads no URL parameters, does no `fetch` and uses no `postMessage`.
2. **localStorage → app state**: `src/state/calculator.svelte.ts` `loadFromStorage()` parses `coc_calc_prefs_v2` and merges it into reactive state. Only same-origin script (or the user themselves) can write it.
3. **npm registry → build output**: every dependency is a devDependency bundled at build time (`package.json`, `package-lock.json`).
4. **GitHub repo / Netlify account → deployed site**: whoever can push to the repo or change the Netlify deploy controls what visitors run. The service worker (`registerType: 'autoUpdate'`, `vite.config.ts`) caches and updates the build automatically.

## Components
- **UI**: `src/App.svelte`, `src/components/**`. Renders state and handles user interaction. There is no `{@html}` or `innerHTML`; the one external link is in `Header.svelte` (`target="_blank"`).
- **State & persistence**: `src/state/calculator.svelte.ts`, which holds reactive state and the localStorage save/load.
- **Calc engine**: `src/engine/**`, the pure damage math (plus its tests).
- **Game data**: `src/data/**`, static tables of defenses, offenses and TH max levels.
- **Build & PWA**: `vite.config.ts`, `index.html`, `package.json`/`package-lock.json`, `public/` (including the Google Search Console verification file `public/googlea78b13417dc62462.html`), the service worker and manifest from `vite-plugin-pwa`, and tooling config (`eslint.config.js`, `svelte.config.js`, `tsconfig*.json`).
- **Hosting**: Netlify with default settings. The repo has no `netlify.toml`, `_headers` or `_redirects`, so it sets no security headers.

## Entry points
- Page load of the static bundle (public).
- User interaction: sliders, toggles and modal level inputs (only numeric game parameters).
- localStorage `coc_calc_prefs_v2` (same origin only).
- Service worker install and update (comes from the deployed build).

## Assets
**Maintainer-confirmed:** visitors' browsers, the integrity of the deployed site and build pipeline, and the correctness of the damage numbers all matter equally.
- Visitors' browsers and the integrity of the script running on the site's origin. The origin holds no credentials or personal data, so the realistic impact of injected script is defacement, redirects, crypto-mining or phishing on a trusted-looking domain.
- Integrity of the build and deploy pipeline (dependencies, the repository, the Netlify account).
- Correctness of the calculated results (a reputational and functional concern, not a security one).
- No user data is collected. localStorage holds only calculator preferences.

## Attacker profiles
**Maintainer-confirmed:** all of the profiles below are in scope: anonymous internet visitors, a compromised npm dependency, and someone with access to the GitHub repo or Netlify account.
- An anonymous internet visitor, or someone sending a crafted link. There is little attack surface, since the app has no URL-driven input.
- A malicious or compromised npm package (supply chain), which reaches visitors through the build.
- An attacker with write access to the GitHub repo or Netlify account. This is out of the app's control; repo and account hygiene apply.
- A local user tampering with their own localStorage, which only affects themselves.

## Existing controls
- Svelte escapes interpolated text by default, and no raw-HTML sinks are used.
- `loadFromStorage()` range-checks TH levels and type-checks most fields, and wraps parsing in try/catch. `defenseLevels` is spread without per-key validation, but the result is only used as numeric lookups.
- A lockfile pins the dependency tree. The site is a static deploy with no server-side code.

## Out of scope / accepted risk
- **Maintainer-confirmed:** nothing is out of scope or accepted risk. Report everything, including dev-only tooling, missing Netlify security headers and localStorage tampering.

## Open questions
- Infrastructure: no infrastructure repository or Netlify config was found; presumably Netlify's UI defaults are used (unconfirmed).
