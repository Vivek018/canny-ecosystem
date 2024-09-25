import { useRequestInfo } from "./request-info";

export function useCompanyId(): string | null {
  const requestInfo = useRequestInfo();
  return requestInfo?.userPrefs.companyId ?? null;
}
