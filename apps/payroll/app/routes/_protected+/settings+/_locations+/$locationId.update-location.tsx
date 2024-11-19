import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLocation from "./create-location";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, LocationSchema } from "@canny_ecosystem/utils";
import { getLocationById } from "@canny_ecosystem/supabase/queries";
import { updateLocation } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_LOCATION = "update-location";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locationId = params.locationId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  let locationData = null;

  if (locationId) {
    locationData = await getLocationById({
      supabase,
      id: locationId,
      companyId,
    });
  }

  if (locationData?.error) {
    throw locationData.error;
  }

  return json({ data: locationData?.data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: LocationSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateLocation({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/locations", { status: 303 });
  }
  return json({ status, error });
}

export default function UpdateLocation() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateLocation updateValues={data} />;
}
