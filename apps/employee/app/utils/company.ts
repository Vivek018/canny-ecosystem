import { useRequestInfo } from "./request-info";

export function useCompanyId(): { companyId: string | null } {
  const requestInfo = useRequestInfo();
  return { companyId: requestInfo?.userPrefs.companyId ?? null };
}
