// localStorage cache: remembers API responses so repeated requests aren't sent again.
// Every access is wrapped in try/catch because storage can be full, disabled or corrupted.
const PREFIX = 'hmh-cache:';

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { savedAt, ttl, data } = JSON.parse(raw);
    if (Date.now() - savedAt > ttl) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeCache(key, data, ttl) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), ttl, data }));
  } catch {
    // Storage full or blocked: the app still works, just without caching.
  }
}
