import { statutorySideNavList } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";

export async function loader() {
  return safeRedirect(statutorySideNavList[0].link);
}
