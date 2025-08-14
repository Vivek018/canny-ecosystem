import { safeRedirect } from "@/utils/server/http.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const vehicleId = params.vehicleId;
  return safeRedirect(`/vehicles/${vehicleId}/overview`);
}
