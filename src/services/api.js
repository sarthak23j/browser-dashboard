/**
 * API service — thin fetch() wrappers for the FastAPI /api/bangs endpoints.
 * All storage is now server-side (SQLite via SQLAlchemy).
 */

const BASE_URL = '/api/bangs';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.detail ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  // 204 No Content has no body
  if (res.status === 204) return null;

  return res.json();
}

export const ApiService = {
  /**
   * Fetch all bangs from the server.
   * @returns {Promise<Array<{alias, name, searchurl, baseurl}>>}
   */
  getBangs() {
    return request('/');
  },

  /**
   * Create a new bang.
   * @param {{ alias: string, name: string, searchurl: string, baseurl: string }} bang
   * @returns {Promise<{alias, name, searchurl, baseurl}>}
   */
  createBang(bang) {
    return request('/', {
      method: 'POST',
      body: JSON.stringify(bang),
    });
  },

  /**
   * Update an existing bang by alias.
   * Only the fields provided are updated (partial update).
   * @param {string} alias
   * @param {{ name?: string, searchurl?: string, baseurl?: string }} updates
   * @returns {Promise<{alias, name, searchurl, baseurl}>}
   */
  updateBang(alias, updates) {
    return request(`/${encodeURIComponent(alias)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a bang by alias.
   * @param {string} alias
   * @returns {Promise<null>}
   */
  deleteBang(alias) {
    return request(`/${encodeURIComponent(alias)}`, {
      method: 'DELETE',
    });
  },
};
