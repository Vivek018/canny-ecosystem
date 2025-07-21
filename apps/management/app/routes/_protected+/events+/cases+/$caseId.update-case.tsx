import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
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
  SIZE_10MB,
  updateRole,
} from "@canny_ecosystem/utils";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  attribute,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
} from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearExactCacheEntry } from "@/utils/cache";
import RegisterCase from "./create-case";
import { updateCaseById } from "@canny_ecosystem/supabase/mutations";
import {
  getCasesById,
  getCompanies,
  getEmployeeIdentityBySiteId,
  getProjectsByCompanyId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { addOrUpdateCaseWithDocument } from "@canny_ecosystem/supabase/media";
import type { CasesDatabaseInsert } from "@canny_ecosystem/supabase/types";

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

    let caseData = null;
    let caseError = null;

    if (caseId) {
      ({ data: caseData, error: caseError } = await getCasesById({
        supabase,
        caseId,
      }));
    }

    if (caseError) throw caseError;

    const reportedBy = urlSearchParams.get("reported_by");
    const reportedOn = urlSearchParams.get("reported_on");
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
      (reportedBy === "site" || reportedBy === "employee");

    if (needsReportedBySite) {
      ({ data: reportedBySite } = await getSiteNamesByCompanyId({
        supabase,
        companyId,
      }));
    }

    const needsReportedOnSite =
      (reportedOn === "site" || reportedOn === "employee");

    if (needsReportedOnSite) {
      ({ data: reportedOnSite } = await getSiteNamesByCompanyId({
        supabase,
        companyId,
      }));
    }

    if (reportedBySiteId && reportedBy === "employee") {
      ({ data: reportedByEmployee } = await getEmployeeIdentityBySiteId({
        supabase,
        siteId: reportedBySiteId,
      }));
    }

    if (reportedOnSiteId && reportedOn === "employee") {
      ({ data: reportedOnEmployee } = await getEmployeeIdentityBySiteId({
        supabase,
        siteId: reportedOnSiteId,
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
        label: employee?.employee_code as string,
        value: employee?.id as string,
      })
    );

    const reportedOnEmployeeOptions = reportedOnEmployee?.map(
      (employee: any) => ({
        label: employee?.employee_code as string,
        value: employee?.id as string,
      })
    );

    const reportedBySiteOptions = reportedBySite?.map((item) => ({
      label: item?.name,
      value: item?.id as string,
    }));

    const reportedOnSiteOptions = reportedOnSite?.map((item) => ({
      label: item?.name,
      value: item?.id as string,
    }));

    return json({
      caseData,
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
      caseData: null,
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
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: oldCaseData } = await getCasesById({
    supabase,
    caseId,
  });
  const oldFilePath = `cases/${companyId}/${oldCaseData!.title}`;

  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_10MB })
  );
  const submission = parseWithZod(formData, { schema: CaseSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
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
  } else if (data.reported_by === "other" || data.reported_by === "canny") {
    data.reported_by_project_id = undefined;
    data.reported_by_company_id = undefined;
    data.reported_by_site_id = undefined;
    data.reported_by_employee_id = undefined;
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
  } else if (data.reported_on === "other" || data.reported_on === "canny") {
    data.reported_on_project_id = undefined;
    data.reported_on_company_id = undefined;
    data.reported_on_site_id = undefined;
    data.reported_on_employee_id = undefined;
  }

  if (data.document) {
    if (oldCaseData?.title !== data.title) {
      const { error } = await addOrUpdateCaseWithDocument({
        caseData: submission.value as CasesDatabaseInsert,
        companyId,
        document: submission.value.document as File,
        supabase,
        route: "update",
      });

      await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .remove([oldFilePath]);

      if (!error) {
        return json({
          status: "success",
          message: "Case updated successfully",
          error: null,
        });
      }
      return json(
        {
          status: "error",
          message: "Case Updated Failed",
          error: error,
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(oldFilePath, data.document, {
        contentType: data.document.type,
        upsert: true,
      });
    if (!error) {
      return json({
        status: "success",
        message: "Case updated successfully",
        error: null,
      });
    }
    return json(
      {
        status: "error",
        message: "Case Updated Failed",
        error: error,
      },
      { status: 400 }
    );
  }

  if (oldCaseData?.document && oldCaseData?.title !== data.title) {
    const newFilePath = `cases/${companyId}/${data!.title}`;

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .download(oldFilePath);

    if (downloadError || !fileData) {
      console.error("Failed to download the file to rename.");
    }

    const { data: urlData, error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(newFilePath, fileData!, {
        contentType: fileData!.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Failed to upload the renamed file.");
    }

    await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .remove([oldFilePath]);

    const { error: caseError } = await updateCaseById({
      supabase,
      data: {
        ...data,
        document: `${SUPABASE_MEDIA_URL_PREFIX}${urlData!.fullPath}`,
      },
    });

    if (!uploadError && !downloadError && !caseError) {
      return json({
        status: "success",
        message: "Case updated successfully",
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Case update failed",
      error: uploadError || downloadError || caseError,
    });
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
    caseData,
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
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "Failed to update case",
          variant: "destructive",
        });
      }
      navigate("/events/cases");
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load case" />;

  return (
    <RegisterCase
      updateValues={caseData}
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
}
