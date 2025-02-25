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
  useParams,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { updateProject } from "@canny_ecosystem/supabase/mutations";
import {
  hasPermission,
  isGoodStatus,
  ProjectSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import CreateProject from "../create-project";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_PROJECT = "update-project";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.projects}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    let projectData = null;
    let projectError = null;

    if (projectId) {
      ({ data: projectData, error: projectError } = await getProjectById({
        supabase,
        id: projectId,
        companyId,
      }));

      if (projectError) throw projectError;
    } else {
      throw new Error("Project ID not provided");
    }

    const companyOptionsPromise = await getCompanies({ supabase }).then(
      ({ data, error }) => {
        if (data) {
          const companyOptions = data
            .filter((company) => company.id !== companyId)
            .map((company) => ({ label: company.name, value: company.id }));
          return { data: companyOptions, error };
        }
        return { data: null, error };
      },
    );

    return json({
      projectData,
      companyOptionsPromise,
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        companyId: null,
        projectData: null,
        companyOptionsPromise: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
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
    return json(
      { status: "error", message: "Project update failed", error },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        data: null,
      },
      { status: 500 },
    );
  }
}

export default function UpdateProject() {
  const { projectData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { projectId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.projects);
        clearExactCacheEntry(`${cacheKeyPrefix.project_overview}${projectId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Project updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.message || "Project update failed",
          variant: "destructive",
        });
      }
      navigate("/projects", {
        replace: true,
      });
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load project" />;

  return <CreateProject updateValues={projectData} />;
}
