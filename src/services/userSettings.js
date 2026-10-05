const USER_NAME_KEY = 'dashboard-user-name';
export const USER_NAME_CHANGE_EVENT = 'dashboard-user-name-change';

export function getUserName() {
  try {
    return localStorage.getItem(USER_NAME_KEY)?.trim() || 'user';
  } catch {
    return 'user';
  }
}

export function setUserName(name) {
  const normalizedName = name.trim() || 'user';
  localStorage.setItem(USER_NAME_KEY, normalizedName);
  window.dispatchEvent(new Event(USER_NAME_CHANGE_EVENT));
  return normalizedName;
}
