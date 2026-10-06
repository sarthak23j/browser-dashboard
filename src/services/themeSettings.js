const THEME_SETTINGS_KEY = 'dashboard-theme-settings';
const LEGACY_THEME_KEY = 'dashboard-theme';

export const ACCENT_PRESETS = [
  { name: 'Purple', value: '#b18aff' },
  { name: 'Orange', value: '#ff9142' },
  { name: 'Green', value: '#3fd99a' },
  { name: 'Blue', value: '#62adff' },
];

export const DEFAULT_THEME_SETTINGS = {
  backdrop: 'dark',
  accent: ACCENT_PRESETS[0].value,
  bgOpacity: 20,
};

const LEGACY_THEME_SETTINGS = {
  'theme-1': { backdrop: 'dark', accent: '#b69aff', bgOpacity: 20 },
  'theme-2': { backdrop: 'dark', accent: '#ff9b54', bgOpacity: 20 },
  'theme-3': { backdrop: 'light', accent: '#08784e', bgOpacity: 20 },
  'theme-4': { backdrop: 'light', accent: '#245fa8', bgOpacity: 20 },
};

function isValidThemeSettings(value) {
  return (
    value &&
    (value.backdrop === 'light' || value.backdrop === 'dark') &&
    typeof value.accent === 'string' &&
    /^#[\da-f]{6}$/i.test(value.accent)
  );
}

/** Returns bgOpacity clamped to [5, 60], defaulting to 20. */
export function normalizeBgOpacity(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 20;
  return Math.min(60, Math.max(5, n));
}

export function getThemeSettings() {
  try {
    const saved = localStorage.getItem(THEME_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidThemeSettings(parsed)) {
        // Ensure bgOpacity is always present even in older saves
        return { bgOpacity: 20, ...parsed };
      }
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
  root.style.setProperty('--bg-image-opacity', normalizeBgOpacity(settings.bgOpacity) / 100);
}

export function saveThemeSettings(settings) {
  if (!isValidThemeSettings(settings)) {
    throw new Error('Invalid theme settings.');
  }
  localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
  applyThemeSettings(settings);
}
