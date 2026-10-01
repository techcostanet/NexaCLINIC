/**
 * themeManager.js — Gerenciador Oficial de Temas do Nex-Ai CLINIC (v5.0.1)
 * 
 * Suporta 3 Modos Visuais:
 * - 'light'      : Modo Claro (Padrão Hospitalar Diurno)
 * - 'dark-dim'   : Modo Noturno Nível 1 (Dark Suave / Slate - Conforto para Plantões)
 * - 'dark-black' : Modo Noturno Nível 2 (Preto OLED / Pitch Black - Contraste Máximo)
 */

export const THEME_MODES = {
  LIGHT: 'light',
  DARK_DIM: 'dark-dim',
  DARK_BLACK: 'dark-black'
};

export const THEME_STORAGE_KEY = 'nexaclinic_theme_mode';

export const THEMES = [
  {
    id: THEME_MODES.LIGHT,
    label: 'Claro',
    subLabel: 'Padrão',
    description: 'Interface clara hospitalar tradicional de alta luminosidade.',
    iconName: 'Sun',
    accentColor: '#f59e0b',
    surfaceBg: '#ffffff',
    mainBg: '#f8fafc'
  },
  {
    id: THEME_MODES.DARK_DIM,
    label: 'Suave',
    subLabel: 'Nível 1',
    description: 'Tons de ardósia escuro para alívio visual contínuo nos plantões.',
    iconName: 'Moon',
    accentColor: '#38bdf8',
    surfaceBg: '#151f32',
    mainBg: '#0b1120'
  },
  {
    id: THEME_MODES.DARK_BLACK,
    label: 'OLED',
    subLabel: 'Nível 2',
    description: 'Preto cirúrgico absoluto para telas OLED e contraste nítido.',
    iconName: 'MoonStar',
    accentColor: '#10b981',
    surfaceBg: '#09090b',
    mainBg: '#000000'
  }
];

/**
 * Obtém o tema armazenado no navegador (padrão: 'light')
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return THEME_MODES.LIGHT;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === THEME_MODES.DARK_DIM || stored === THEME_MODES.DARK_BLACK) {
      return stored;
    }
  } catch (e) {
    console.warn('[ThemeManager] Não foi possível ler localStorage:', e);
  }
  return THEME_MODES.LIGHT;
}

/**
 * Aplica o modo de tema no documento HTML e salva em localStorage
 */
export function applyTheme(mode) {
  if (typeof document === 'undefined') return mode;

  const validMode = (mode === THEME_MODES.DARK_DIM || mode === THEME_MODES.DARK_BLACK)
    ? mode
    : THEME_MODES.LIGHT;

  try {
    document.documentElement.setAttribute('data-theme', validMode);

    // Classes auxiliares para frameworks ou utilitários CSS legados
    if (validMode === THEME_MODES.DARK_DIM) {
      document.documentElement.classList.add('theme-dark', 'theme-dark-dim');
      document.documentElement.classList.remove('theme-light', 'theme-dark-black');
    } else if (validMode === THEME_MODES.DARK_BLACK) {
      document.documentElement.classList.add('theme-dark', 'theme-dark-black');
      document.documentElement.classList.remove('theme-light', 'theme-dark-dim');
    } else {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark', 'theme-dark-dim', 'theme-dark-black');
    }

    localStorage.setItem(THEME_STORAGE_KEY, validMode);

    // Dispara evento para re-renderizar componentes que escutam mudanças dinâmicas
    window.dispatchEvent(new CustomEvent('nexaclinic-theme-changed', {
      detail: { theme: validMode }
    }));
  } catch (err) {
    console.error('[ThemeManager] Erro ao aplicar tema:', err);
  }

  return validMode;
}

/**
 * Alterna ciclicamente entre os 3 temas: Claro -> Suave (Nível 1) -> OLED (Nível 2) -> Claro
 */
export function cycleTheme() {
  const current = getStoredTheme();
  let next = THEME_MODES.LIGHT;

  if (current === THEME_MODES.LIGHT) {
    next = THEME_MODES.DARK_DIM;
  } else if (current === THEME_MODES.DARK_DIM) {
    next = THEME_MODES.DARK_BLACK;
  } else {
    next = THEME_MODES.LIGHT;
  }

  return applyTheme(next);
}

/**
 * Inicializa o tema no bootstrap da aplicação
 */
export function initTheme() {
  const current = getStoredTheme();
  applyTheme(current);
  return current;
}
