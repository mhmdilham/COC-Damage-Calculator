# ⚡ Clash of Clans Damage Calculator

A modern, fast, and offline-ready web application designed to calculate the optimal combination of **Lightning Spells (Zap)**, **Earthquake Spells (Quake)**, and **Hero Equipments** required to destroy any defense building or defending hero in **Clash of Clans**.

🌐 **Live Web:** [https://coccalculator.netlify.app/](https://coccalculator.netlify.app/)

[![Live App](https://img.shields.io/badge/Live_Web-coccalculator.netlify.app-10b981?style=flat&logo=netlify&logoColor=white)](https://coccalculator.netlify.app/)
[![CoC Patch](https://img.shields.io/badge/CoC_Patch-v19.32.4_(16_Nov_2026)-f59e0b?style=flat)](https://coccalculator.netlify.app/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Svelte](https://img.shields.io/badge/Svelte-5-orange?logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📦 Game Data & Patch Info

| Field | Details |
| :--- | :--- |
| **Update Title** | Clash of Clans — *The Clash of Titans* |
| **Official Patch Version** | `v19.32.4` (`19.32`) |
| **Official Release Date** | **16 November 2026** |
| **Live Web App** | [coccalculator.netlify.app](https://coccalculator.netlify.app/) |

> Includes full support for latest update stats: **Town Hall 19**, **Spiky Tower**, **Firecracker Tower**, **Clan Castle Lv 15**, **Air Defense Lv 17**, **Lightning Spell Lv 14**, updated permanent defense levels, and all **6 Defending Heroes**.

---

## 🌟 Key Features

- **⚡ ZapQuake Math Engine**: Accurately calculates flat Lightning spell damage and diminishing returns for percentage-based Earthquake spells, prioritizing fewer total spell slots (and higher Earthquake count on ties for wider AoE).
- **🔘 Clickable ON/OFF Spells & Hero Equipments**:
  - Toggle **Lightning (Zap)**, **Earthquake (Quake)**, and **Hero Equipments** (*Spiky Ball*, *Giant Arrow* with 2× Air Defense multiplier, *Fireball*, *Seeking Shield*, *Rocket Backpack*, *Flame Blower*) individually ON or OFF while preserving their configured levels.
- **🛡️ Auto-Scaled Town Hall Presets**:
  - **Enemy Base Preset** automatically scales every building, defense (including active **Supercharge** tiers), and defending hero to max level for the chosen Town Hall.
  - **Attacker Loadout Preset** calibrates maximum spell and equipment levels automatically, with full manual override via sliders.
- **🎯 Interactive Combo Views & Detail Modal**:
  - Browse by **All**, **Key Defenses**, or **Group By Combo** (Clashify-style recipe grouping).
  - Click any defense card to inspect all alternative combos and fine-tune individual target levels.
- **📱 PWA & 100% Offline Capable**: Pure client-side calculations with persistent `localStorage` preferences and precached WebP assets. Installable on iOS, Android, and Desktop directly from [coccalculator.netlify.app](https://coccalculator.netlify.app/).
- **⚡ Built on Svelte 5**: Powered by Svelte 5 Runes (`$state`, `$derived`) for instant reactive recalculations and a lightweight bundle.

---

## 🎮 How It Works

1. **Configure Attacker Loadout**:
   - Choose your **Attacker Town Hall** preset (or adjust manually).
   - Click **Lightning (Zap)** or **Earthquake (Quake)** cards to toggle them **ON/OFF**, then adjust their level sliders.
   - Click any **Hero Equipment** card to combine its burst damage with your spells.
2. **Select Enemy Base**:
   - Choose the **Enemy Base Town Hall** to set all target HP values to their max levels.
   - Use search or switch between **All**, **Key Defenses**, and **Group By Combo**.
3. **Inspect Combos**:
   - Each card displays the optimal minimum spell slot recipe (e.g., `1× Quake + 2× Zap`).
   - Click any building or hero card to open the **Detail Modal** for full combo alternatives and custom target level sliders.

---

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (Runes `$state`, `$derived`)
- **Language**: [TypeScript 6](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linter & Code Quality**: [ESLint](https://eslint.org/) + [`eslint-plugin-svelte`](https://github.com/sveltejs/eslint-plugin-svelte)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/mhmdilham/COC-Damage-Calculator.git
cd COC-Damage-Calculator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Verification & Build Commands

```bash
npm test         # Run Vitest unit & UI integration tests
npm run check    # Run svelte-check & TypeScript typecheck
npm run lint     # Run ESLint
npm run build    # Build production bundle & PWA service worker
npm run preview  # Preview production build locally
```

---

## 📖 Acknowledgements & Credits

- **Inspiration**: Inspired by the original concept by [Kienlabadao/COC-Damage-Calculator](https://github.com/Kienlabadao/COC-Damage-Calculator).
- **Game Data & Assets**: Defense stats, HP tables, spell ratios, equipment damage values, and building sprites are sourced from the community-maintained [Clash of Clans Wiki on Fandom](https://clashofclans.fandom.com/wiki/Clash_of_Clans_Wiki) and official Supercell release notes.

---

## ⚖️ Disclaimer

This project is not affiliated with, endorsed, sponsored, or specifically approved by **Supercell**. Supercell is not responsible for the operation or content of this site/project. For more information, see [Supercell's Fan Content Policy](https://supercell.com/en/fan-content-policy/).

---

## 📄 License

Distributed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
