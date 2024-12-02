import { safeRedirect } from "@/utils/server/http.server";

export async function loader() {
  return safeRedirect("/settings/general");
}
