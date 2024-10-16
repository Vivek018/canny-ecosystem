import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  getCompanies,
  getProjectById,
} from "@canny_ecosystem/supabase/queries";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { updateProject } from "@canny_ecosystem/supabase/mutations";
import { isGoodStatus, ProjectSchema } from "@canny_ecosystem/utils";
import CreateProject from "./create-project";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_PROJECT = "update-project";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  let data = null;

  if (projectId) {
    data = (await getProjectById({ supabase, id: projectId, companyId })).data;
  }

  const { data: companies, error } = await getCompanies({ supabase });

  if (error) {
    throw error;
  }

  if (!companies) {
    throw new Error("No companies found");
  }

  const companyOptions = companies
    .filter((company) => company.id !== companyId)
    .map((company) => ({ label: company.name, value: company.id }));

  return json({ data, companyOptions });
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
  const { data, companyOptions } = useLoaderData<typeof loader>();
  return (
    <CreateProject
      updateValues={data}
      companyOptionsFromUpdate={companyOptions}
    />
  );
}
