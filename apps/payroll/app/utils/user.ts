import { useRequestInfo } from "./request-info";

export function useUserRole(){
  const requestInfo = useRequestInfo();
  return { role: requestInfo?.userPrefs.user?.role ?? "executive" };
}
