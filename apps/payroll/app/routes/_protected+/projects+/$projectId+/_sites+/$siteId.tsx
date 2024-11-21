import { EditPaySequenceSheet } from "@/components/pay-sequence/edit-pay-sequence-sheet";
import { ViewPaySequenceDialog } from "@/components/pay-sequence/view-pay-sequence-dialog";
import { getSitePaySequenceInSite } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  const siteId = params.siteId;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data, error } = await getSitePaySequenceInSite({
    supabase,
    siteId: siteId!,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data, projectId });
}

export default function EditPaySequence() {
  const { data, projectId } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();

  if (searchParams.get(modalSearchParamNames.view_pay_sequence) === "true") {
    return <ViewPaySequenceDialog values={data} />;
  }
  if (searchParams.get(modalSearchParamNames.edit_pay_sequence) === "true") {
    return <EditPaySequenceSheet updateValues={data} projectId={projectId!} />;
  }

  return null;
}
