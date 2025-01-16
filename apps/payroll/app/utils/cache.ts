import type { ClientLoaderFunctionArgs } from "@remix-run/react";

export async function cacheDeferDataInSession<
  T extends Record<string, unknown>,
>(cacheKey: string, { serverLoader }: ClientLoaderFunctionArgs): Promise<T> {
  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData) as T | null;
    if (parsedData) {
      return parsedData;
    }
  }

  const serverData = (await serverLoader()) as T;
  const resolvedData: Record<string, unknown> = {};

  for (const [key, promise] of Object.entries(serverData)) {
    try {
      resolvedData[key] = await promise;
    } catch (error) {
      console.error(`Failed to resolve ${key} promise:`, error);
      resolvedData[key] = "error";
    }
  }

  if (!Object.values(resolvedData).some((data) => data === "error")) {
    sessionStorage.setItem(cacheKey, JSON.stringify(resolvedData));
  }

  return resolvedData as T;
}
