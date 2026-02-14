export const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  update(key, fallback, updater) {
    const current = Storage.get(key, fallback);
    const next = updater(structuredClone(current));
    Storage.set(key, next);
    return next;
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};
