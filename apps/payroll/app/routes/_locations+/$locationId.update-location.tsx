import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLocation, { LocationSchema } from "./create-location";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getLocationQuery } from "@canny_ecosystem/supabase/queries";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { updateLocation } from "@canny_ecosystem/supabase/mutations";
import { isGoodStatus } from "@canny_ecosystem/utils";

export const UPDATE_LOCATION = "update-location";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locationId = params.locationId;
  const { supabase } = getSupabaseWithHeaders({ request });
  let data = null;

  if (locationId) {
    data = (await getLocationQuery({ supabase, id: locationId })).data;
  }

  return json({ data });
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
    return safeRedirect("/locations", { status: 303 });
  }
  return json({ status, error });
}

export default function UpdateLocation() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateLocation updateValues={data} />;
}
