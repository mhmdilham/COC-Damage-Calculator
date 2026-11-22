import { hydrate, mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { hasCalculatorUrlParams } from './state/calculator.svelte';

const target = document.getElementById('app')!;

function getHasSavedPrefs(): boolean {
  try {
    return Boolean(localStorage.getItem('coc_calc_prefs_v2'));
  } catch {
    return false;
  }
}

const hasSavedPrefs = getHasSavedPrefs();
const hasUrlParams = hasCalculatorUrlParams(window.location.search);

const isPrerendered = target.hasChildNodes();

let app: ReturnType<typeof mount>;
if (isPrerendered && !hasSavedPrefs && !hasUrlParams) {
  app = hydrate(App, { target });
} else {
  if (isPrerendered) {
    target.innerHTML = '';
  }
  app = mount(App, { target });
}

export default app;
