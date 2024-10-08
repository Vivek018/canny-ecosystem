import { EditPaySequenceSheet } from "@/components/projects/pay-sequence/edit-pay-sequence-sheet";
import { getPaySequenceInProjectQuery } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data, error } = await getPaySequenceInProjectQuery({
    supabase,
    projectId: projectId ?? "",
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data });
}

export default function EditPaySequence() {
  const { data } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();

  if (searchParams.get(modalSearchParamNames.edit_pay_sequence) === "true") {
    return <EditPaySequenceSheet updateValues={data} />;
  }

  return null;
}
