import { useRequestInfo } from "./request-info";

export function useUser() {
  const requestInfo = useRequestInfo();
  return { role: requestInfo?.userPrefs?.user?.role ?? "executive", id: requestInfo?.userPrefs?.user?.id };
}
