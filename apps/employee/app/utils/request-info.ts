import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "@/root";

export function useRequestInfo() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  return data?.requestInfo;
}
