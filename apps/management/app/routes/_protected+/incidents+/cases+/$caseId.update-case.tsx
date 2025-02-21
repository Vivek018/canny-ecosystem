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
  getCompanies,
  getEmployeesByProjectSiteId,
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
    const reportedByProject = urlSearchParams.get("reported_by_project");
    const reportedOnProject = urlSearchParams.get("reported_on_project");
    const reportedBySiteId = urlSearchParams.get("reported_by_site");
    const reportedOnSiteId = urlSearchParams.get("reported_on_site");

    let companies = null;
    let projects = null;
    let reportedByEmployee = null;
    let reportedOnEmployee = null;
    let reportedBySite = null;
    let reportedOnSite = null;

    if (reportedBy === "company" || reportedOn === "company") {
      ({ data: companies } = await getCompanies({ supabase }));
    }

    const needsProjects = [
      reportedBy === "project",
      reportedBy === "site",
      reportedBy === "employee",
      reportedOn === "project",
      reportedOn === "site",
      reportedOn === "employee",
    ].some(Boolean);

    if (needsProjects) {
      ({ data: projects } = await getProjectsByCompanyId({
        supabase,
        companyId,
      }));
    }

    const needsReportedBySite =
      (reportedBy === "site" || reportedBy === "employee") && reportedByProject;

    if (needsReportedBySite) {
      ({ data: reportedBySite } = await getSitesByProjectId({
        supabase,
        projectId: reportedByProject ?? "",
      }));
    }

    const needsReportedOnSite =
      (reportedOn === "site" || reportedOn === "employee") && reportedOnProject;

    if (needsReportedOnSite) {
      ({ data: reportedOnSite } = await getSitesByProjectId({
        supabase,
        projectId: reportedOnProject ?? "",
      }));
    }

    if (reportedBySiteId && reportedBy === "employee") {
      ({ data: reportedByEmployee } = await getEmployeesByProjectSiteId({
        supabase,
        projectSiteId: reportedBySiteId,
      }));
    }

    if (reportedOnSiteId && reportedOn === "employee") {
      ({ data: reportedOnEmployee } = await getEmployeesByProjectSiteId({
        supabase,
        projectSiteId: reportedOnSiteId,
      }));
    }

    const companyOptions = companies?.map((company: any) => ({
      label: company?.name as string,
      value: (company?.id as string) ?? "",
    }));

    const projectOptions = projects?.map((project: any) => ({
      label: project?.name as string,
      value: (project?.id as string) ?? "",
    }));

    const reportedByEmployeeOptions = reportedByEmployee?.map(
      (employee: any) => ({
        label: `${employee?.first_name} ${employee?.last_name}`,
        value: employee?.id ?? "",
      }),
    );

    const reportedOnEmployeeOptions = reportedOnEmployee?.map(
      (employee: any) => ({
        label: `${employee?.first_name} ${employee?.last_name}`,
        value: employee?.id ?? "",
      }),
    );

    const reportedBySiteOptions = reportedBySite?.map((item) => ({
      label: item?.name,
      value: item?.id,
    }));

    const reportedOnSiteOptions = reportedOnSite?.map((item) => ({
      label: item?.name,
      value: item?.id,
    }));

    return defer({
      casePromise,
      companyOptions: companyOptions || null,
      projectOptions: projectOptions || null,
      reportedByEmployeeOptions: reportedByEmployeeOptions || null,
      reportedOnEmployeeOptions: reportedOnEmployeeOptions || null,
      reportedBySiteOptions: reportedBySiteOptions || null,
      reportedOnSiteOptions: reportedOnSiteOptions || null,
      error: null,
    });
  } catch (error) {
    return json({
      casePromise: null,
      companyOptions: null,
      projectOptions: null,
      reportedByEmployeeOptions: null,
      reportedOnEmployeeOptions: null,
      reportedBySiteOptions: null,
      reportedOnSiteOptions: null,
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

  const data = submission.value;

  data.id = submission?.value?.id ?? caseId;

  if (data.reported_by === "company") {
    data.reported_by_project_id = undefined;
    data.reported_by_site_id = undefined;
    data.reported_by_employee_id = undefined;
  } else if (data.reported_by === "project") {
    data.reported_by_company_id = undefined;
    data.reported_by_site_id = undefined;
    data.reported_by_employee_id = undefined;
  } else if (data.reported_by === "site") {
    data.reported_by_project_id = undefined;
    data.reported_by_company_id = undefined;
    data.reported_by_employee_id = undefined;
  } else if (data.reported_by === "employee") {
    data.reported_by_project_id = undefined;
    data.reported_by_company_id = undefined;
    data.reported_by_site_id = undefined;
  }

  if (data.reported_on === "company") {
    data.reported_on_project_id = undefined;
    data.reported_on_site_id = undefined;
    data.reported_on_employee_id = undefined;
  } else if (data.reported_on === "project") {
    data.reported_on_company_id = undefined;
    data.reported_on_site_id = undefined;
    data.reported_on_employee_id = undefined;
  } else if (data.reported_on === "site") {
    data.reported_on_project_id = undefined;
    data.reported_on_company_id = undefined;
    data.reported_on_employee_id = undefined;
  } else if (data.reported_on === "employee") {
    data.reported_on_project_id = undefined;
    data.reported_on_company_id = undefined;
    data.reported_on_site_id = undefined;
  }

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
  const {
    casePromise,
    companyOptions,
    projectOptions,
    reportedByEmployeeOptions,
    reportedOnEmployeeOptions,
    reportedBySiteOptions,
    reportedOnSiteOptions,
    error,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
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
    }
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
              options={{
                companyOptions: companyOptions || null,
                projectOptions: projectOptions || null,
                reportedByEmployeeOptions: reportedByEmployeeOptions || null,
                reportedOnEmployeeOptions: reportedOnEmployeeOptions || null,
                reportedBySiteOptions: reportedBySiteOptions || null,
                reportedOnSiteOptions: reportedOnSiteOptions || null,
              }}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
