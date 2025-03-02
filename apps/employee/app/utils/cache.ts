import { MILLISECONDS_IN_A_MIN } from "@canny_ecosystem/utils/constant";
import { LRUCache } from "lru-cache";

const lruCache = new LRUCache<string, any>({
  max: 200,
  ttl: MILLISECONDS_IN_A_MIN * 60 * 10, // 10 hours
  allowStale: false,
});

export function clearExactCacheEntry(cacheKey: string) {
  if (lruCache.has(cacheKey)) {
    lruCache.delete(cacheKey);
  }
}

export function clearCacheEntry(cacheKey: string) {
  for (const [key] of lruCache.dump()) {
    if (key.startsWith(cacheKey)) {
      lruCache.delete(key);
    }
  }
}

export function clearAllCache() {
  lruCache.clear();
}

export async function setDeferCache<T extends Record<string, unknown>>(
  cacheKey: string,
  serverData: Record<keyof T, Promise<any> | any>,
) {
  const resolvedData: Record<keyof T, any> = {} as Record<keyof T, any>;
  let hasError = false;

  for (const [key, promise] of Object.entries(serverData)) {
    try {
      resolvedData[key as keyof T] = await promise;
    } catch (error) {
      console.error(`Failed to resolve ${key} promise:`, error);
      resolvedData[key as keyof T] = "error";
      hasError = true;
    }
  }

  if (!hasError) {
    lruCache.set(cacheKey, resolvedData);
  }

  return resolvedData as T;
}

export function getDeferCache<T extends Record<string, unknown>>(
  cacheKey: string,
): T | undefined {
  return lruCache.get(cacheKey) as T;
}

export async function clientCaching<T extends Record<string, unknown>>(
  cacheKey: string,
  { serverLoader }: any,
): Promise<T> {
  if (lruCache.has(cacheKey)) {
    return getDeferCache(cacheKey) as T;
  }

  const serverData = (await serverLoader()) as T;
  await setDeferCache(cacheKey, serverData);

  return serverLoader() as T;
}
