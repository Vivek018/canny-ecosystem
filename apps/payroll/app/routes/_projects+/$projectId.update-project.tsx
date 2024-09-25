import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getProjectByIdQuery } from "@canny_ecosystem/supabase/queries";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { updateProject } from "@canny_ecosystem/supabase/mutations";
import { isGoodStatus, ProjectSchema } from "@canny_ecosystem/utils";
import CreateProject from "./create-project";

export const UPDATE_PROJECT = "update-project";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  const { supabase } = getSupabaseWithHeaders({ request });
  let data = null;

  if (projectId) {
    data = (await getProjectByIdQuery({ supabase, id: projectId })).data;
  }

  return json({ data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: ProjectSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateProject({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/projects", { status: 303 });
  }
  return json({ status, error });
}

export default function UpdateProject() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateProject updateValues={data} />;
}
