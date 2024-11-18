import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData } from "@remix-run/react";
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
import { useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card, CardFooter } from "@canny_ecosystem/ui/card";
import { CreateEmployeeProjectAssignment, PROJECT_PARAM, PROJECT_SITE_PARAM } from "@/components/employees/form/create-employee-project-assignment";
import { Button } from "@canny_ecosystem/ui/button";

export const UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT =
  "update-employee-project-assignment";

export async function loader({ request, params }: LoaderFunctionArgs) {
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
    throw projectAssignmentData.error;
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
    const { data: siteEmployees } = await getEmployeesByPositionAndProjectSiteId({
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
    data: projectAssignmentData?.data,
    projectOptions,
    projectSiteOptions,
    siteEmployeeOptions,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const employeeId = params.employeeId;

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
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeProjectAssignment() {
  const { data, projectOptions, projectSiteOptions, siteEmployeeOptions } =
    useLoaderData<typeof loader>();
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


  return (
    <section className='lg:px-40 2xl:px-80 py-2'>
      <FormProvider context={form.context}>
        <Form
          method='POST'
          encType='multipart/form-data'
          {...getFormProps(form)}
          className='flex flex-col'
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
            <CardFooter>
              <div className='ml-auto w-2/5 flex flex-row items-center justify-center gap-4'>
                <Button
                  variant='secondary'
                  size='full'
                  type='reset'
                  onClick={() => setResetKey(Date.now())}
                  {...form.reset.getButtonProps()}
                >
                  Reset
                </Button>
                <Button
                  form={form.id}
                  disabled={!form.valid}
                  variant='default'
                  size='full'
                  type='submit'
                >
                  Submit
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
