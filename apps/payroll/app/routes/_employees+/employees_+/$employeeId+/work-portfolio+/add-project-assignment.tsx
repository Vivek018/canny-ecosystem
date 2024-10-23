import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData, useSearchParams } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  assignmentTypeArray,
  EmployeeProjectAssignmentSchema,
  getInitialValueFromZod,
  getValidDateForInput,
  isGoodStatus,
  positionArray,
  replaceDash,
  replaceUnderscore,
  skillLevelArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Button } from "@canny_ecosystem/ui/button";
import { createEmployeeProjectAssignment } from "@canny_ecosystem/supabase/mutations";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import type { EmployeeProjectAssignmentDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { useState } from "react";
import { UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT } from "./$projectAssignmentId.update-project-assignment";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getEmployeesByProjectSiteId,
  getProjectsByCompanyId,
  getSitesByProjectId,
} from "@canny_ecosystem/supabase/queries";
import { Combobox, ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Label } from "@canny_ecosystem/ui/label";

export const ADD_EMPLOYEE_PROJECT_ASSIGNMENT =
  "add-employee-project-assignment";

export const PROJECT_PARAM = "project";
export const PROJECT_SITE_PARAM = "project-site";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const employeeId = params.employeeId;

  const { supabase } = getSupabaseWithHeaders({ request });
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
    const { data: siteEmployees } = await getEmployeesByProjectSiteId({
      supabase,
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
    employeeId,
    projectOptions,
    projectSiteOptions,
    siteEmployeeOptions,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const employeeId = params.employeeId;
  if (!employeeId) {
    return safeRedirect("/employees");
  }

  const submission = parseWithZod(formData, {
    schema: EmployeeProjectAssignmentSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createEmployeeProjectAssignment({
    supabase,
    data: { ...submission.value, employee_id: employeeId },
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function AddEmployeeProjectAssignment({
  updateValues,
  updateProjectOptions,
  updateProjectSiteOptions,
  updateSiteEmployeeOptions,
}: {
  updateValues?: EmployeeProjectAssignmentDatabaseUpdate | null;
  updateProjectOptions: ComboboxSelectOption[] | undefined;
  updateProjectSiteOptions: ComboboxSelectOption[] | undefined;
  updateSiteEmployeeOptions: ComboboxSelectOption[] | undefined;
}) {
  const {
    employeeId,
    projectOptions,
    projectSiteOptions,
    siteEmployeeOptions,
  } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());
  const [searchParams, setSearchParams] = useSearchParams();

  const EMPLOYEE_PROJECT_ASSIGNMENT_TAG = updateValues
    ? UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT
    : ADD_EMPLOYEE_PROJECT_ASSIGNMENT;
  const currentSchema = EmployeeProjectAssignmentSchema;

  const initialValues = updateValues ?? getInitialValueFromZod(currentSchema);

  const [form, fields] = useForm({
    id: EMPLOYEE_PROJECT_ASSIGNMENT_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
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
            <CardHeader>
              <CardTitle className='text-3xl'>
                {replaceDash(EMPLOYEE_PROJECT_ASSIGNMENT_TAG)}
              </CardTitle>
              <CardDescription>
                {EMPLOYEE_PROJECT_ASSIGNMENT_TAG.split("-")[0]} project
                assignment of the employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <div className='grid grid-cols-3 place-content-center justify-between gap-6'>
                <div className='w-full flex flex-col gap-1.5'>
                  <div className='flex'>
                    <Label>Projects</Label>
                    <sub className='text-primary'>*</sub>
                  </div>
                  <Combobox
                    key={resetKey}
                    options={updateProjectOptions ?? projectOptions ?? []}
                    value={searchParams.get(PROJECT_PARAM) ?? ""}
                    onChange={(project) => {
                      if (project?.length) {
                        searchParams.set(PROJECT_PARAM, project);
                      } else {
                        searchParams.delete(PROJECT_PARAM);
                      }
                      setSearchParams(searchParams);
                    }}
                    placeholder={"Select Projects"}
                  />
                </div>
                <SearchableSelectField
                  key={resetKey + 1}
                  className='capitalize'
                  options={updateProjectSiteOptions ?? projectSiteOptions ?? []}
                  inputProps={{
                    ...getInputProps(fields.project_site_id, { type: "text" }),
                    defaultValue:
                      searchParams.get(PROJECT_SITE_PARAM) ??
                      fields.project_site_id.initialValue,
                  }}
                  placeholder={`Select Project Site`}
                  labelProps={{
                    children: "Project Site",
                  }}
                  onChange={(projectSite) => {
                    if (projectSite?.length) {
                      searchParams.set(PROJECT_SITE_PARAM, projectSite);
                    } else {
                      searchParams.delete(PROJECT_SITE_PARAM);
                    }
                    setSearchParams(searchParams);
                  }}
                  errors={fields.project_site_id.errors}
                />
                <SearchableSelectField
                  key={resetKey + 2}
                  className='capitalize'
                  options={
                    updateSiteEmployeeOptions ?? siteEmployeeOptions ?? []
                  }
                  inputProps={{
                    ...getInputProps(fields.supervisor_id, { type: "text" }),
                  }}
                  placeholder={`Select Supervisor`}
                  labelProps={{
                    children: "Supervisor",
                  }}
                  errors={fields.supervisor_id.errors}
                />
              </div>
              <div className='grid grid-cols-3 place-content-center justify-between gap-6'>
                <SearchableSelectField
                  key={resetKey + 3}
                  className='capitalize'
                  options={transformStringArrayIntoOptions(
                    positionArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.position, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.position.name}`}
                  labelProps={{
                    children: fields.position.name,
                  }}
                  errors={fields.position.errors}
                />
                <SearchableSelectField
                  key={resetKey + 4}
                  className='capitalize'
                  options={transformStringArrayIntoOptions(
                    skillLevelArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.skill_level, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.skill_level.name
                  )}`}
                  labelProps={{
                    children: replaceUnderscore(fields.skill_level.name),
                  }}
                  errors={fields.skill_level.errors}
                />
                <SearchableSelectField
                  key={resetKey + 5}
                  className='capitalize'
                  options={transformStringArrayIntoOptions(
                    assignmentTypeArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.assignment_type, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.assignment_type.name
                  )}`}
                  labelProps={{
                    children: replaceUnderscore(fields.assignment_type.name),
                  }}
                  errors={fields.assignment_type.errors}
                />
              </div>
              <div className='grid grid-cols-2 place-content-center justify-between gap-6'>
                <Field
                  inputProps={{
                    ...getInputProps(fields.start_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.start_date.name
                    )}`,
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.start_date.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.start_date.name),
                  }}
                  errors={fields.start_date.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.end_date, {
                      type: "date",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.end_date.name
                    )}`,
                    min: getValidDateForInput(fields.start_date.value),
                    defaultValue: getValidDateForInput(
                      fields.end_date.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.end_date.name),
                  }}
                  errors={fields.end_date.errors}
                />
              </div>
              <CheckboxField
                buttonProps={getInputProps(fields.is_current, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_current.id,
                  children: "Is this the current project assignment?",
                }}
              />
              <CheckboxField
                buttonProps={getInputProps(fields.probation_period, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.probation_period.id,
                  children: "Is there a probation period?",
                }}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.probation_end_date, {
                    type: "date",
                  }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.probation_end_date.name
                  )}`,
                  defaultValue: getValidDateForInput(
                    fields.probation_end_date.initialValue
                  ),
                }}
                labelProps={{
                  children: replaceUnderscore(fields.probation_end_date.name),
                }}
                errors={fields.probation_end_date.errors}
              />
            </CardContent>
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
