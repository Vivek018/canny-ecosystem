import { safeRedirect } from "@/utils/server/http.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  return safeRedirect(
    `/projects/${params.projectId}/${params.siteId}/overview`
  );
}
