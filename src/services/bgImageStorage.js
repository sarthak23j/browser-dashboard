const BG_IMAGE_KEY = 'dashboard-bg-image';
export const BG_IMAGE_CHANGE_EVENT = 'dashboard-bg-image-change';

export function getBgImage() {
  try {
    return localStorage.getItem(BG_IMAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setBgImage(dataUrl) {
  try {
    localStorage.setItem(BG_IMAGE_KEY, dataUrl);
    applyBgImage(dataUrl);
    window.dispatchEvent(new Event(BG_IMAGE_CHANGE_EVENT));
  } catch {
    throw new Error('Could not save background image. It may be too large for your browser storage.');
  }
}

export function clearBgImage() {
  try {
    localStorage.removeItem(BG_IMAGE_KEY);
    applyBgImage(null);
    window.dispatchEvent(new Event(BG_IMAGE_CHANGE_EVENT));
  } catch {
    // ignore
  }
}

/**
 * Reads the stored image (or the passed-in dataUrl) and applies
 * --bg-image-url / --bg-image-display CSS variables on :root.
 * Call once on app mount, then again whenever the image changes.
 */
export function applyBgImage(dataUrl) {
  const root = document.documentElement;
  if (dataUrl) {
    root.style.setProperty('--bg-image-url', `url("${dataUrl}")`);
    root.style.setProperty('--bg-image-display', 'block');
    root.dataset.hasBg = 'true';
  } else {
    root.style.removeProperty('--bg-image-url');
    root.style.setProperty('--bg-image-display', 'none');
    delete root.dataset.hasBg;
  }
}

/**
 * Convenience: load from localStorage and apply immediately.
 */
export function applyStoredBgImage() {
  applyBgImage(getBgImage());
}
