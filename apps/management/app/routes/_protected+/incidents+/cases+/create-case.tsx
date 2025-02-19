import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  getInitialValueFromZod,
  isGoodStatus,
  transformStringArrayIntoOptions,
  replaceUnderscore,
  createRole,
  hasPermission,
  CaseSchema,
  caseTypeArray,
  caseLocationTypeArray,
  reportedOnArray,
  caseStatusArray,
  reportedByArray,
} from "@canny_ecosystem/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { createCase } from "@canny_ecosystem/supabase/mutations";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import type { CasesDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { UPDATE_CASES_TAG } from "./$caseId.update-case";
import { useCompanyId } from "@/utils/company";
import {
  getEmployeesByCompanyId,
  getProjectsByCompanyId,
  getSitesByProjectId,
} from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { PROJECT_SITE_PARAM } from "@/components/employees/form/create-employee-project-assignment";
import { Label } from "@canny_ecosystem/ui/label";
import { Combobox } from "@canny_ecosystem/ui/combobox";

export const CREATE_CASES_TAG = "Create-Case";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const caseId = params.caseId;

  const { supabase, headers } = getSupabaseWithHeaders({ request });
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${createRole}:${attribute.cases}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }
    const url = new URL(request.url);
    const urlSearchParams = new URLSearchParams(url.searchParams);

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

    return json({
      caseId,
      employeeOptions: employees?.map((employee: any) => ({
        label: `${employee?.first_name} ${employee?.last_name}`,
        value: employee?.id ?? "",
      })),
      projectOptions:
        projects?.map((project) => ({
          label: project?.name,
          value: project?.id,
        })) ?? [],
      projectSiteOptions:
        projectSites?.map((item) => ({
          label: item?.name,
          value: item?.id,
        })) ?? [],
      error: null,
    });
  } catch (error) {
    return json({
      caseId,
      employeeOptions: null,
      projectOptions: null,
      projectSiteOptions: null,
      error,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: CaseSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const {
      reported_by_employee,
      reported_on_employee,
      reported_by_site,
      reported_on_site,
      reported_by_project,
      reported_on_project,
      ...restData
    } = submission.value;

    restData.reported_on_id =
      restData.reported_on === "project"
        ? reported_on_project
        : restData.reported_on === "site"
          ? reported_on_site
          : restData.reported_on === "employee"
            ? reported_on_employee
            : "";

    restData.reported_by_id =
      restData.reported_by === "project"
        ? reported_by_project
        : restData.reported_by === "site"
          ? reported_by_site
          : restData.reported_by === "employee"
            ? reported_by_employee
            : "";

    const { status, error } = await createCase({
      supabase,
      data: restData,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Case registered successfully",
        error: null,
        returnTo: "/incidents/cases",
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to register case",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  }
}

export default function CreateCase({
  updateValues,
  employeeData,
  projectData,
  projectSiteData,
}: {
  updateValues?: CasesDatabaseUpdate | null;
  employeeData?: { label: string; value: string };
  projectData?: { label: string; value: string };
  projectSiteData?: { label: string; value: string };
}) {
  const { employeeOptions, projectOptions, projectSiteOptions, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { companyId } = useCompanyId();

  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const CASE_TAG = updateValues ? UPDATE_CASES_TAG : CREATE_CASES_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(CaseSchema);

  const [form, fields] = useForm({
    id: CASE_TAG,
    constraint: getZodConstraint(CaseSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CaseSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: companyId,
    },
  });

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "error") {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ?? "An unexpected error occurred",
          variant: "destructive",
        });
      } else if (actionData.status === "success") {
        clearCacheEntry(cacheKeyPrefix.case);
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  useEffect(() => {
    searchParams.set("reported_by", fields.reported_by.value ?? "");
    searchParams.set("reported_on", fields.reported_on.value ?? "");
    setSearchParams(searchParams);
  }, [fields.reported_by.value, fields.reported_on.value]);

  return (
    <section className="flex flex-col w-full mx-auto lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>{updateValues ? "Update" : "Register"} Case</CardTitle>
              <CardDescription>
                {updateValues ? "Update" : "Register"} the Case here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.reported_by_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.reported_on_id, { type: "hidden" })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.date, { type: "date" }),
                    placeholder: `Enter ${fields.date.name}`,
                  }}
                  labelProps={{
                    children: fields.date.name,
                  }}
                  errors={fields.date.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    caseTypeArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.case_type, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.case_type.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.case_type.name),
                  }}
                  errors={fields.case_type.errors}
                />
              </div>
              <Field
                inputProps={{
                  ...getInputProps(fields.title, { type: "text" }),
                  placeholder: `Enter ${fields.title.name}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: fields.title.name,
                }}
                errors={fields.title.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.description),
                  placeholder: `Enter ${fields.description.name}`,
                  required: false,
                }}
                labelProps={{ children: fields.description.name }}
                errors={fields.description.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    caseLocationTypeArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.location_type, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.location_type.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.location_type.name),
                  }}
                  errors={fields.location_type.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.location, { type: "text" }),
                    placeholder: `Enter ${fields.location.name}`,
                  }}
                  labelProps={{
                    children: fields.location.name,
                  }}
                  errors={fields.location.errors}
                />
              </div>

              <hr className="mb-7 mt-1" />
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize col-span-3"
                  options={transformStringArrayIntoOptions(
                    reportedByArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.reported_by, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.reported_by.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.reported_by.name),
                  }}
                  errors={fields.reported_by.errors}
                />
                <div className="w-full flex flex-col gap-1.5">
                  <div className="flex">
                    <Label>Projects</Label>
                    <sub className="text-primary">*</sub>
                  </div>
                  <Combobox
                    options={(projectOptions as any) ?? projectData ?? []}
                    value={searchParams.get("reported_by_project") ?? ""}
                    onChange={(project) => {
                      form.update({
                        name: "reported_by_project",
                        value: project,
                      });
                      if (project?.length) {
                        searchParams.set("reported_by_project", project);
                      } else {
                        searchParams.delete("reported_by_project");
                      }
                      setSearchParams(searchParams);
                    }}
                    placeholder={"Select Projects"}
                  />
                </div>
                <SearchableSelectField
                  className="capitalize"
                  options={(projectSiteOptions as any) ?? projectSiteData ?? []}
                  inputProps={{
                    ...getInputProps(fields.reported_by_site, {
                      type: "text",
                    }),
                    defaultValue:
                      searchParams.get("reported_by_project_site") ??
                      String(fields.reported_by_site.initialValue),
                  }}
                  placeholder={"Select Project Site"}
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
                  errors={fields.reported_by_site.errors}
                />
                <SearchableSelectField
                  className="capitalize"
                  options={(employeeOptions as any) ?? employeeData ?? []}
                  inputProps={{
                    ...getInputProps(fields.reported_by_employee, {
                      type: "text",
                    }),
                  }}
                  placeholder={"Select Employee"}
                  labelProps={{
                    children: "Employee",
                  }}
                  errors={fields.reported_by_employee.errors}
                />
              </div>
              <hr className="mb-7 mt-1" />
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize col-span-3"
                  options={transformStringArrayIntoOptions(
                    reportedOnArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.reported_on, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.reported_on.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.reported_on.name),
                  }}
                  errors={fields.reported_on.errors}
                />

                <div className="w-full flex flex-col gap-1.5">
                  <div className="flex">
                    <Label>Reported On Projects</Label>
                    <sub className="text-primary">*</sub>
                  </div>
                  <Combobox
                    options={(projectOptions as any) ?? projectData ?? []}
                    value={searchParams.get("reported_on_project") ?? ""}
                    onChange={(project) => {
                      form.update({
                        name: "reported_on_project",
                        value: project,
                      });
                      if (project?.length) {
                        searchParams.set("reported_on_project", project);
                      } else {
                        searchParams.delete("reported_on_project");
                      }
                      setSearchParams(searchParams);
                    }}
                    placeholder={"Select Projects"}
                  />
                </div>

                <SearchableSelectField
                  className="capitalize"
                  options={(projectSiteOptions as any) ?? projectSiteData ?? []}
                  inputProps={{
                    ...getInputProps(fields.reported_on_site, {
                      type: "text",
                    }),
                    defaultValue:
                      searchParams.get("reported_on_project_site") ??
                      String(fields.reported_on_site.initialValue),
                  }}
                  placeholder={"Select Project Site"}
                  labelProps={{
                    children: replaceUnderscore(fields.reported_on_site.name),
                  }}
                  onChange={(projectSite) => {
                    if (projectSite?.length) {
                      searchParams.set(PROJECT_SITE_PARAM, projectSite);
                    } else {
                      searchParams.delete(PROJECT_SITE_PARAM);
                    }
                    setSearchParams(searchParams);
                  }}
                  errors={fields.reported_on_site.errors}
                />

                <SearchableSelectField
                  className="capitalize"
                  options={(employeeOptions as any) ?? employeeData ?? []}
                  inputProps={{
                    ...getInputProps(fields.reported_on_employee, {
                      type: "text",
                    }),
                  }}
                  placeholder={"Select Employee"}
                  labelProps={{
                    children: replaceUnderscore(
                      fields.reported_on_employee.name,
                    ),
                  }}
                  errors={fields.reported_on_employee.errors}
                />
              </div>
              <hr className="mb-7 mt-1" />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey + 3}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    caseStatusArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.status, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.status.name}`}
                  labelProps={{
                    children: fields.status.name,
                  }}
                  errors={fields.status.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.document, { type: "file" }),

                    placeholder: replaceUnderscore(
                      `Enter ${fields.document.name}`,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.document.name),
                  }}
                  errors={fields.document.errors}
                />
              </div>
              <Field
                inputProps={{
                  ...getInputProps(fields.court_case_reference, {
                    type: "text",
                  }),
                  placeholder: replaceUnderscore(
                    `Enter ${fields.court_case_reference.name}`,
                  ),
                  required: false,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.court_case_reference.name),
                }}
                errors={fields.court_case_reference.errors}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.amount_given, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(fields.amount_given.name)}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.amount_given.name),
                  }}
                  errors={fields.amount_given.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.amount_received, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(fields.amount_received.name)}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.amount_received.name),
                  }}
                  errors={fields.amount_received.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.incident_date, { type: "date" }),
                    placeholder: `Enter ${fields.incident_date.name}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.incident_date.name),
                  }}
                  errors={fields.incident_date.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.resolution_date, { type: "date" }),
                    placeholder: `Enter ${fields.resolution_date.name}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.resolution_date.name),
                  }}
                  errors={fields.resolution_date.errors}
                />
              </div>
            </CardContent>
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
