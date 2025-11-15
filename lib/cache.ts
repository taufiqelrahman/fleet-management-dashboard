import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

export default cache;

export function getCachedData<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCachedData<T>(key: string, data: T, ttl?: number): boolean {
  return cache.set(key, data, ttl || 60);
}

export function deleteCachedData(key: string): number {
  return cache.del(key);
}

export function flushCache(): void {
  cache.flushAll();
}

export function getCacheStats() {
  return cache.getStats();
}
