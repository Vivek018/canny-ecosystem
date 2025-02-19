import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  CaseSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import { clearExactCacheEntry } from "@/utils/cache";
import RegisterCase from "./create-case";
import { updateCaseById } from "@canny_ecosystem/supabase/mutations";
import {
  getCasesById,
  getEmployeesByCompanyId,
  getProjectsByCompanyId,
  getSitesByProjectId,
} from "@canny_ecosystem/supabase/queries";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_CASES_TAG = "Update-Case";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const caseId = params.caseId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  try {
    const { user } = await getUserCookieOrFetchUser(request, supabase);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    if (!hasPermission(user?.role!, `${updateRole}:${attribute.cases}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const url = new URL(request.url);
    const urlSearchParams = new URLSearchParams(url.searchParams);

    let casePromise = null;

    if (caseId) {
      casePromise = getCasesById({
        supabase,
        caseId,
      });
    }

    const reportedBy = urlSearchParams.get("reported_by");
    const reportedOn = urlSearchParams.get("reported_on");
    let employees = null;
    let projects = null;
    let projectSites = null;

    if (
      reportedBy === "project" ||
      reportedBy === "site" ||
      reportedBy === "employee" ||
      reportedOn === "project" ||
      reportedOn === "site" ||
      reportedOn === "company"
    ) {
      ({ data: projects } = await getProjectsByCompanyId({
        supabase,
        companyId,
      }));
    }
    if (
      (reportedBy === "site" ||
        reportedBy === "employee" ||
        reportedOn === "site" ||
        reportedOn === "employee") &&
      (urlSearchParams.get("reported_by_project") ||
        urlSearchParams.get("reported_on_project"))
    ) {
      ({ data: projectSites } = await getSitesByProjectId({
        supabase,
        projectId:
          urlSearchParams.get("reported_by_project") ??
          urlSearchParams.get("reported_on_project") ??
          "",
      }));
    }

    if (
      urlSearchParams.get("project-site") &&
      (reportedBy === "employee" || reportedOn === "employee")
    ) {
      ({ data: employees } = await getEmployeesByCompanyId({
        supabase,
        companyId,
        params: {
          from: 0,
          to: 100,
        },
      }));
    }

    return defer({
      casePromise,
      employees: employees?.map((employee: any) => ({
        label: `${employee?.first_name} ${employee?.last_name}`,
        value: employee?.id ?? "",
      })),
      projects:
        projects?.map((project) => ({
          label: project?.name,
          value: project?.id,
        })) ?? [],
      projectSites:
        projectSites?.map((item) => ({
          label: item?.name,
          value: item?.id,
        })) ?? [],
      error: null,
    });
  } catch (error) {
    return json({
      casePromise: null,
      employees: null,
      projects: null,
      projectSites: null,
      error,
    });
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const caseId = params.caseId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: CaseSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }
  const data = { ...submission.value, id: submission.value.id ?? caseId };

  const { status, error } = await updateCaseById({
    supabase,
    data,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Case updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Case update failed",
    error,
  });
}

export default function UpdateCases() {
  const { casePromise, employees, projects, projectSites, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.case);
      toast({
        title: "Success",
        description: actionData?.message || "Case updated successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Failed to update case",
        variant: "destructive",
      });
    }
    navigate("/incidents/cases");
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load case" />;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={casePromise}>
        {(resolvedData) => {
          if (resolvedData?.error) {
            clearExactCacheEntry(cacheKeyPrefix.case);
            return (
              <ErrorBoundary
                error={resolvedData?.error}
                message="Failed to load case"
              />
            );
          }
          return (
            <RegisterCase
              updateValues={resolvedData?.data}
              employeeData={employees}
              projectData={projects}
              projectSiteData={projectSites}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
