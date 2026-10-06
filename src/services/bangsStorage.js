/**
 * BangsStorage — per-browser localStorage persistence for search shortcuts.
 *
 * Shape of each bang: { alias: string, name: string, searchurl: string, baseurl: string }
 */

const STORAGE_KEY = 'dashboard_bangs';

export const DEFAULT_BANGS = [
  {
    name: 'Amazon',
    alias: 'a',
    searchurl: 'https://www.amazon.in/s?k=',
    baseurl: 'https://www.amazon.in/',
  },
  {
    name: 'ChatGPT',
    alias: 'ch',
    searchurl: 'https://chatgpt.com/',
    baseurl: 'https://chatgpt.com/',
  },
  {
    name: 'Claude',
    alias: 'cl',
    searchurl: 'https://claude.ai/new',
    baseurl: 'https://claude.ai/new',
  },
  {
    name: 'F1TV',
    alias: 'f1',
    searchurl: 'https://f1tv.formula1.com/',
    baseurl: 'https://f1tv.formula1.com/',
  },
  {
    name: 'FitGirl',
    alias: 'fg',
    searchurl: 'https://fitgirl-repacks.site/?s=',
    baseurl: 'https://fitgirl-repacks.site',
  },
  {
    alias: 'gh',
    name: 'Github',
    searchurl: 'https://github.com/search?q=',
    baseurl: 'https://github.com',
  },
  {
    name: 'Gmail',
    alias: 'm',
    searchurl: 'https://mail.google.com/mail/u/0/#search/',
    baseurl: 'https://mail.google.com/mail/u/0',
  },
  {
    name: 'Reddit',
    alias: 'r',
    searchurl: 'https://www.reddit.com/search/?q=',
    baseurl: 'https://www.reddit.com/',
  },
  {
    name: 'Twitch',
    alias: 't',
    searchurl: 'https://www.twitch.tv/search?term=',
    baseurl: 'https://www.twitch.tv',
  },
  {
    alias: 'tw',
    name: 'Twitter',
    searchurl: 'https://twitter.com/search?q=',
    baseurl: 'https://twitter.com',
  },
  {
    alias: 'y',
    name: 'Youtube',
    searchurl: 'https://www.youtube.com/results?search_query=',
    baseurl: 'https://www.youtube.com',
  },
];

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(bangs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bangs));
}

export const BangsStorage = {
  getBangs() {
    const stored = readStorage();
    if (stored === null) {
      writeStorage(DEFAULT_BANGS);
      return [...DEFAULT_BANGS];
    }
    return stored;
  },

  createBang(bang) {
    const bangs = this.getBangs();
    const alias = bang.alias.trim().toLowerCase();
    if (bangs.some((item) => item.alias === alias)) {
      throw new Error(`A bang with alias "${alias}" already exists.`);
    }
    const created = { ...bang, alias };
    const updated = [...bangs, created].sort((a, b) => a.alias.localeCompare(b.alias));
    writeStorage(updated);
    return created;
  },

  updateBang(alias, updates) {
    const bangs = this.getBangs();
    const idx = bangs.findIndex((bang) => bang.alias === alias);
    if (idx === -1) throw new Error(`Bang "${alias}" not found.`);

    const newAlias = (updates.alias ?? alias).trim().toLowerCase();
    if (newAlias !== alias && bangs.some((bang) => bang.alias === newAlias)) {
      throw new Error(`A bang with alias "${newAlias}" already exists.`);
    }

    const updated = { ...bangs[idx], ...updates, alias: newAlias };
    const newBangs = bangs
      .map((bang, i) => (i === idx ? updated : bang))
      .sort((a, b) => a.alias.localeCompare(b.alias));
    writeStorage(newBangs);
    return updated;
  },

  deleteBang(alias) {
    const bangs = this.getBangs();
    writeStorage(bangs.filter((bang) => bang.alias !== alias));
  },

  importBangs(bangs) {
    const normalized = bangs.map((bang) => ({
      ...bang,
      alias: bang.alias.trim().toLowerCase(),
    }));
    const aliases = normalized.map((bang) => bang.alias);
    if (new Set(aliases).size !== aliases.length) {
      throw new Error('Imported bangs must have unique aliases.');
    }
    writeStorage(normalized.sort((a, b) => a.alias.localeCompare(b.alias)));
  },

  exportJson() {
    return JSON.stringify(this.getBangs(), null, 2);
  },
};
