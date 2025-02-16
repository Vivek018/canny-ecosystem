import { safeRedirect } from "@/utils/server/http.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  return safeRedirect(`/projects/${projectId}/overview`);
}
