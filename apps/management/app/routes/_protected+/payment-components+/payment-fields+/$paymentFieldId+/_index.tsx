import { safeRedirect } from "@/utils/server/http.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export function loader({ params }: LoaderFunctionArgs) {
  return safeRedirect(
    `/payment-components/payment-fields/${params?.paymentFieldId}/reports`,
  );
}
