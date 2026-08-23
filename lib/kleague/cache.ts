import { CACHE_MS, CACHE_SECONDS } from "@/lib/kleague/types";

type CacheEntry<T> = {
  data: T;
  cachedAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __kleagueVerifiedCache?: Map<string, CacheEntry<unknown>>;
  __kleagueVerifiedPending?: Map<string, Promise<unknown>>;
};

const cache = globalCache.__kleagueVerifiedCache ?? new Map<string, CacheEntry<unknown>>();
const pending = globalCache.__kleagueVerifiedPending ?? new Map<string, Promise<unknown>>();

globalCache.__kleagueVerifiedCache = cache;
globalCache.__kleagueVerifiedPending = pending;

export function getCacheSeconds() {
  return CACHE_SECONDS;
}

export function getCacheControlHeader() {
  return `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}, stale-if-error=86400`;
}

export async function cachedExternalJson<T>(key: string, request: () => Promise<T>): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && now - cached.cachedAt < CACHE_MS) {
    return cached.data;
  }

  const activeRequest = pending.get(key) as Promise<T> | undefined;
  if (activeRequest) return activeRequest;

  const nextRequest = request()
    .then((data) => {
      cache.set(key, { data, cachedAt: Date.now() });
      return data;
    })
    .catch((error) => {
      if (cached) {
        console.error(`[kleague-cache] Keeping stale cache after request failure: ${getErrorMessage(error)}`);
        return cached.data;
      }

      throw error;
    })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, nextRequest);
  return nextRequest;
}

export function isRefreshWindow() {
  return true;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown external data error.";
}
