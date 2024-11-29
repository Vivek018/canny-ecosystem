import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  EmployeeProjectAssignmentSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import {
  getEmployeeProjectAssignmentByEmployeeId,
  getEmployeesByPositionAndProjectSiteId,
  getProjectsByCompanyId,
  getSitesByProjectId,
} from "@canny_ecosystem/supabase/queries";
import { updateEmployeeProjectAssignment } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import {
  CreateEmployeeProjectAssignment,
  PROJECT_PARAM,
  PROJECT_SITE_PARAM,
} from "@/components/employees/form/create-employee-project-assignment";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT =
  "update-employee-project-assignment";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const url = new URL(request.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const { supabase } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId;

  let projectAssignmentData = null;

  if (employeeId) {
    projectAssignmentData = await getEmployeeProjectAssignmentByEmployeeId({
      supabase,
      employeeId: employeeId,
    });
  }

  if (projectAssignmentData?.error) {
    return json({
      status: "error",
      message: "Failed to get employee project assignment",
      error: projectAssignmentData.error,
    });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: projects } = await getProjectsByCompanyId({
    supabase,
    companyId,
  });

  const projectOptions = projects?.map((project) => ({
    label: project?.name,
    value: project?.id,
  }));

  let projectSiteOptions: any = [];

  const projectParamId = urlSearchParams.get(PROJECT_PARAM);

  if (projectParamId?.length) {
    const { data: projectSites } = await getSitesByProjectId({
      supabase,
      projectId: projectParamId,
    });

    projectSiteOptions = projectSites?.map((projectSite) => ({
      label: projectSite?.name,
      value: projectSite?.id,
    }));
  }

  let siteEmployeeOptions: any = [];

  const projectSiteParamId = urlSearchParams.get(PROJECT_SITE_PARAM);

  if (projectSiteParamId?.length) {
    const { data: siteEmployees } =
      await getEmployeesByPositionAndProjectSiteId({
        supabase,
        position: "supervisor",
        projectSiteId: projectSiteParamId,
      });

    siteEmployeeOptions = siteEmployees
      ?.filter((siteEmployee) => siteEmployee.id !== employeeId)
      .map((siteEmployee) => ({
        label: siteEmployee?.employee_code,
        value: siteEmployee?.id,
      }));
  }

  return json({
    status: "success",
    message: "Employee project assignment found",
    data: projectAssignmentData?.data,
    projectOptions,
    projectSiteOptions,
    siteEmployeeOptions,
  });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeProjectAssignmentSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateEmployeeProjectAssignment({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee project assignment updated successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Failed to update employee project assignment",
    error,
  });
}

export default function UpdateEmployeeProjectAssignment() {
  const {
    data,
    projectOptions,
    projectSiteOptions,
    siteEmployeeOptions,
    status,
    error
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeProjectAssignmentSchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: data,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
      navigate(-1);
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Employee update failed",
          variant: "destructive",
        });
      }
      navigate(-1);
    }
  }, [actionData]);

  return (
    <section className="md:px-20 lg:px-28 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CreateEmployeeProjectAssignment
              key={resetKey}
              fields={fields as any}
              isUpdate={true}
              projectOptions={projectOptions}
              projectSiteOptions={projectSiteOptions}
              siteEmployeeOptions={siteEmployeeOptions}
            />
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
