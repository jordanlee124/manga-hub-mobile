import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'cache:';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// TTLs in milliseconds
export const TTL = {
  POPULAR:  5 * 60 * 1000,  // 5 min
  SEARCH:   2 * 60 * 1000,  // 2 min
  MANGA:   10 * 60 * 1000,  // 10 min
  CHAPTERS: 5 * 60 * 1000,  // 5 min
  PAGES:   30 * 60 * 1000,  // 30 min
};

const mem = new Map<string, CacheEntry<any>>();

function expired(entry: CacheEntry<any>): boolean {
  return Date.now() > entry.expiresAt;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const hit = mem.get(key);
    if (hit && !expired(hit)) return hit.data as T;

    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (expired(entry)) {
        AsyncStorage.removeItem(PREFIX + key);
        return null;
      }
      mem.set(key, entry);
      return entry.data;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
    mem.set(key, entry);
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {}
  },

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetcher();
    await this.set(key, data, ttlMs);
    return data;
  },

  invalidate(key: string): void {
    mem.delete(key);
    AsyncStorage.removeItem(PREFIX + key).catch(() => {});
  },

  async clear(): Promise<void> {
    mem.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(PREFIX));
      if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
    } catch {}
  },
};
