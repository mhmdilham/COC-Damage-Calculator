# ⚡ Clash of Clans Damage Calculator

A modern, fast, and offline-ready web application designed to calculate the optimal combination of **Lightning Spells (Zap)**, **Earthquake Spells (Quake)**, and **Hero Equipments** required to take down any defense building or defending hero in **Clash of Clans (Town Hall 1 – 18)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Svelte](https://img.shields.io/badge/Svelte-5-orange?logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Key Features

- **⚡ ZapQuake Math Engine**: Accurately calculates flat Lightning spell damage and diminishing returns for percentage-based Earthquake spells.
- **👑 Hero Equipment Integration**: Combine spell damage with high-impact Hero Equipments (Spiky Ball, Giant Arrow, Fireball, Seeking Shield, Rocket Backpack, Flame Blower) to save valuable spell housing slots.
- **🛡️ Full Town Hall Support (TH 1 – 18)**:
  - Defenses automatically scale to the selected Enemy Town Hall level (including **Supercharge** tiers).
  - Attacker presets dynamically calibrate maximum allowed spell and equipment levels according to Attacker Town Hall level.
- **🎯 Interactive Combo Breakdown Modal**: Inspect individual damage steps, sequence of execution, leftover HP, and all alternative spell combinations for every defense.
- **📱 PWA & 100% Offline Capable**: Pure client-side calculations with local caching. Installable as a Progressive Web App (PWA) on iOS, Android, and Desktop.
- **⚡ Built on Svelte 5**: Powered by the latest Svelte 5 Runes for fine-grained reactivity, lightning-fast rendering, and lightweight bundle footprint.

---

## 🎮 How It Works

1. **Configure Attacker Loadout**:
   - Set your **Attacker Town Hall** (sets default maximum spell and equipment levels).
   - Adjust **Lightning (Zap)** and **Earthquake (Quake)** spell levels.
   - Click any **Hero Equipment** card to enable it and fine-tune its level with the slider.
2. **Select Enemy Base**:
   - Set the **Enemy Base Town Hall** to automatically adjust all building HP to max levels for that TH.
   - Filter by **All**, **Key Defenses**, or **Group By Combo**.
3. **View Optimal Combinations**:
   - Each card displays the minimum total spell slots required (e.g. `2x Zap + 1x Quake = 3 slots`).
   - Click on any defense card to open the **Detail Modal** to see alternative combos and adjust custom individual building levels.

---

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (with Runes `$state`, `$derived`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linter & Code Quality**: [ESLint](https://eslint.org/) with [`eslint-plugin-svelte`](https://github.com/sveltejs/eslint-plugin-svelte)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mhmdilham/COC-Damage-Calculator.git
   cd COC-Damage-Calculator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run test suite:**
   ```bash
   npm test
   ```

6. **Run linter & type checker:**
   ```bash
   npm run lint
   npm run check
   ```

---

## 📖 Acknowledgements & Credits

- **Inspiration**: Heavily inspired by the original concept and work by [Kienlabadao/COC-Damage-Calculator](https://github.com/Kienlabadao/COC-Damage-Calculator).
- **Game Data & Assets**: All defense statistics, HP numbers, spell ratios, and equipment damage data are sourced from the community-driven [Clash of Clans Wiki on Fandom](https://clashofclans.fandom.com/wiki/Clash_of_Clans_Wiki).

---

## ⚖️ Disclaimer

This project is not affiliated with, endorsed, sponsored, or specifically approved by **Supercell**. Supercell is not responsible for the operation or content of this site/project. For more information about Supercell's policies, visit [Supercell's Fan Content Policy](https://supercell.com/en/fan-content-policy/).

---

## 📄 License

Distributed under the [MIT License](LICENSE).
