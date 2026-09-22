/**
 * BangsStorage — localStorage-backed service replacing the server-side API.
 * Bangs are stored per-browser under the key 'dashboard_bangs'.
 *
 * Shape of each bang: { alias: string, name: string, searchurl: string, baseurl: string }
 */

const STORAGE_KEY = 'dashboard_bangs';

/** Default bangs loaded on first visit (matches former server seed). */
export const DEFAULT_BANGS = [
  {
    alias: 'y',
    name: 'Youtube',
    searchurl: 'https://www.youtube.com/results?search_query=',
    baseurl: 'https://www.youtube.com',
  },
  {
    alias: 'g',
    name: 'Github',
    searchurl: 'https://github.com/search?q=',
    baseurl: 'https://github.com',
  },
  {
    alias: 't',
    name: 'Twitter',
    searchurl: 'https://twitter.com/search?q=',
    baseurl: 'https://twitter.com',
  },
  {
    alias: 'am',
    name: 'Amazon',
    searchurl: 'https://www.amazon.in/s?k=',
    baseurl: 'https://www.amazon.in',
  },
];

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStorage(bangs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bangs));
}

export const BangsStorage = {
  /**
   * Returns all bangs. On first call (nothing in storage), seeds with DEFAULT_BANGS.
   * @returns {{ alias: string, name: string, searchurl: string, baseurl: string }[]}
   */
  getBangs() {
    const stored = readStorage();
    if (stored === null) {
      writeStorage(DEFAULT_BANGS);
      return [...DEFAULT_BANGS];
    }
    return stored;
  },

  /**
   * Create a new bang. Throws if alias already exists.
   * @param {{ alias: string, name: string, searchurl: string, baseurl: string }} bang
   * @returns {{ alias: string, name: string, searchurl: string, baseurl: string }}
   */
  createBang(bang) {
    const bangs = this.getBangs();
    if (bangs.some((b) => b.alias === bang.alias)) {
      throw new Error(`A bang with alias "${bang.alias}" already exists.`);
    }
    const updated = [...bangs, bang].sort((a, b) => a.alias.localeCompare(b.alias));
    writeStorage(updated);
    return bang;
  },

  /**
   * Update an existing bang by its current alias.
   * @param {string} alias  The alias to look up.
   * @param {{ alias?: string, name?: string, searchurl?: string, baseurl?: string }} updates
   * @returns {{ alias: string, name: string, searchurl: string, baseurl: string }}
   */
  updateBang(alias, updates) {
    const bangs = this.getBangs();
    const idx = bangs.findIndex((b) => b.alias === alias);
    if (idx === -1) throw new Error(`Bang "${alias}" not found.`);

    // If alias is changing, make sure new alias doesn't collide
    if (updates.alias && updates.alias !== alias) {
      if (bangs.some((b) => b.alias === updates.alias)) {
        throw new Error(`A bang with alias "${updates.alias}" already exists.`);
      }
    }

    const updated = { ...bangs[idx], ...updates };
    const newBangs = bangs
      .map((b, i) => (i === idx ? updated : b))
      .sort((a, b) => a.alias.localeCompare(b.alias));
    writeStorage(newBangs);
    return updated;
  },

  /**
   * Delete a bang by alias.
   * @param {string} alias
   */
  deleteBang(alias) {
    const bangs = this.getBangs();
    const newBangs = bangs.filter((b) => b.alias !== alias);
    writeStorage(newBangs);
  },

  /**
   * Replace all bangs wholesale (useful for import/migration).
   * @param {{ alias: string, name: string, searchurl: string, baseurl: string }[]} bangs
   */
  importBangs(bangs) {
    writeStorage([...bangs].sort((a, b) => a.alias.localeCompare(b.alias)));
  },

  /**
   * Export current bangs as a JSON string (for backup / migration).
   * @returns {string}
   */
  exportJson() {
    return JSON.stringify(this.getBangs(), null, 2);
  },
};
