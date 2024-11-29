import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  getCompanies,
  getProjectById,
} from "@canny_ecosystem/supabase/queries";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { updateProject } from "@canny_ecosystem/supabase/mutations";
import { isGoodStatus, ProjectSchema } from "@canny_ecosystem/utils";
import CreateProject from "../create-project";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_PROJECT = "update-project";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const projectId = params.projectId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  let data = null;

  if (projectId) {
    data = (await getProjectById({ supabase, id: projectId, companyId })).data;
  }

  const { data: companies, error } = await getCompanies({ supabase });

  if (error) {
    return json({
      status: "error",
      message: "Failed to get companies",
      error,
      data: null,
    });
  }

  if (!companies) {
    return json({
      status: "error",
      message: "No companies found",
      error: "No companies found",
      data: null,
    });
  }

  const companyOptions = companies
    .filter((company) => company.id !== companyId)
    .map((company) => ({ label: company.name, value: company.id }));

  return json({
    status: "success",
    message: "Project loaded",
    data,
    companyOptions,
  });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
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
    return json({
      status: "success",
      message: "Project updated successfully",
      error: null,
    });
  }
  return json({ status: "error", message: "Project update failed", error }, { status: 500 });
}

export default function UpdateProject() {
  const { data, companyOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.message,
          variant: "destructive",
        });
      }
      navigate("/projects", {
        replace: true,
      });
    }
  }, [actionData]);

  return (
    <CreateProject
      updateValues={data}
      companyOptionsFromUpdate={companyOptions}
    />
  );
}
