const THEME_SETTINGS_KEY = 'dashboard-theme-settings';
const LEGACY_THEME_KEY = 'dashboard-theme';

export const ACCENT_PRESETS = [
  { name: 'Purple', value: '#b69aff' },
  { name: 'Orange', value: '#ff9b54' },
  { name: 'Green', value: '#54d6a0' },
  { name: 'Blue', value: '#75b8ff' },
];

export const DEFAULT_THEME_SETTINGS = {
  backdrop: 'dark',
  accent: ACCENT_PRESETS[0].value,
};

const LEGACY_THEME_SETTINGS = {
  'theme-1': { backdrop: 'dark', accent: '#b69aff' },
  'theme-2': { backdrop: 'dark', accent: '#ff9b54' },
  'theme-3': { backdrop: 'light', accent: '#08784e' },
  'theme-4': { backdrop: 'light', accent: '#245fa8' },
};

function isValidThemeSettings(value) {
  return (
    value &&
    (value.backdrop === 'light' || value.backdrop === 'dark') &&
    typeof value.accent === 'string' &&
    /^#[\da-f]{6}$/i.test(value.accent)
  );
}

export function getThemeSettings() {
  try {
    const saved = localStorage.getItem(THEME_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidThemeSettings(parsed)) return parsed;
    }

    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    return LEGACY_THEME_SETTINGS[legacyTheme] ?? DEFAULT_THEME_SETTINGS;
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export function applyThemeSettings(settings) {
  if (!isValidThemeSettings(settings)) {
    throw new Error('Invalid theme settings.');
  }

  const root = document.documentElement;
  root.dataset.backdrop = settings.backdrop;
  root.style.setProperty('--user-accent', settings.accent);
}

export function saveThemeSettings(settings) {
  if (!isValidThemeSettings(settings)) {
    throw new Error('Invalid theme settings.');
  }
  localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
  applyThemeSettings(settings);
}
