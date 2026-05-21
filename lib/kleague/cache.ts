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
  return "public, s-maxage=21600, stale-while-revalidate=21600, stale-if-error=86400";
}

export async function cachedExternalJson<T>(key: string, request: () => Promise<T>): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && now - cached.cachedAt < CACHE_MS) {
    return cached.data;
  }

  if (!isRefreshWindow()) {
    if (cached) return cached.data;
    throw new Error("K League external cache is empty and refresh is blocked before 12:00 KST.");
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
        cache.set(key, { data: cached.data, cachedAt: Date.now() });
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
  const koreaHour = (new Date().getUTCHours() + 9) % 24;
  return koreaHour >= 12;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown external data error.";
}
