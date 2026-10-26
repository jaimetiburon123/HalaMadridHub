// localStorage cache: remembers API responses so repeated requests aren't sent again.
// Every access is wrapped in try/catch because storage can be full, disabled or corrupted.
const PREFIX = 'hmh-cache:';

// Returns { data, savedAt } or null. Expired entries are kept (not deleted) so they can
// still be used as a fallback when the network fails: pass allowStale to get them.
export function readCache(key, { allowStale = false } = {}) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { savedAt, ttl, data } = JSON.parse(raw);
    const expired = Date.now() - savedAt > ttl;
    return expired && !allowStale ? null : { data, savedAt };
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
