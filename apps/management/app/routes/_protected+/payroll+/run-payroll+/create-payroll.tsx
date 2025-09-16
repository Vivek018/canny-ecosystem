import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  PayrollSchema,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
  defaultYear,
  getYears,
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
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";
import {
  getProjectsByCompanyId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { useEffect, useState } from "react";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute, payoutMonths } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Label } from "@canny_ecosystem/ui/label";
import { createPayroll } from "@canny_ecosystem/supabase/mutations";

export const LINK_PARAM = "linkWith";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const url = new URL(request.url);

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.payroll}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const urlSearchParams = new URLSearchParams(url.searchParams);

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  let projectOptions: any = [];
  let allSiteOptions: any = [];

  const link = urlSearchParams.get(LINK_PARAM);

  if (link?.length && link === "project") {
    const { data: projects } = await getProjectsByCompanyId({
      supabase,
      companyId,
    });

    projectOptions = projects?.map((project) => ({
      label: project?.name,
      value: project?.id,
    }));
  }
  if (link?.length && link === "site") {
    const { data: allSites } = await getSiteNamesByCompanyId({
      companyId,
      supabase,
    });
    allSiteOptions = allSites?.map((sites) => ({
      label: sites?.name,
      pseudoLabel: sites?.projects?.name,
      value: sites?.id,
    }));
  }
  return json({ projectOptions, allSiteOptions, companyId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: PayrollSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }
  const { status, error } = await createPayroll({
    supabase,
    data: submission.value,
  });
  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Payroll create successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Payroll create failed",
    error,
  });
}

export default function CreatePayroll() {
  const { projectOptions, allSiteOptions, companyId } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const [linkWith, setLinkWith] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.payroll}`);
        toast({
          title: "Success",
          description: actionData?.message || "Payroll created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Payroll create failed",
          variant: "destructive",
        });
      }
      navigate("/payroll/run-payroll");
    }
  }, [actionData]);

  const initialValues = getInitialValueFromZod(PayrollSchema);

  const [form, fields] = useForm({
    id: "create-payroll",
    constraint: getZodConstraint(PayrollSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PayrollSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">Create Payroll</CardTitle>
              <CardDescription className="lowercase">
                Create payroll by filling this form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />

              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />

              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8 mt-10">
                <SearchableSelectField
                  key={resetKey}
                  className="w-full capitalize flex-1 "
                  options={payoutMonths}
                  inputProps={{
                    ...getInputProps(fields.month, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(fields.month.name)}`}
                  labelProps={{
                    children: "Month",
                  }}
                  errors={fields.month.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="w-full capitalize flex-1 "
                  options={transformStringArrayIntoOptions(
                    getYears(25, defaultYear) as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.year, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(fields.year.name)}`}
                  labelProps={{
                    children: "Year",
                  }}
                  errors={fields.year.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8 mt-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.title, {
                      type: "text",
                    }),
                    placeholder: `Enter ${fields.title.name}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.title.name),
                  }}
                  errors={fields.title.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.run_date, {
                      type: "date",
                    }),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.run_date.name),
                  }}
                  errors={fields.run_date.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1  place-content-center justify-between gap-x-8 mt-10">
                <div className="w-full flex flex-col gap-1.5">
                  <div className="flex">
                    <Label>Link With</Label>
                    <sub className="text-primary">*</sub>
                  </div>
                  <Combobox
                    options={transformStringArrayIntoOptions([
                      "project",
                      "site",
                    ])}
                    value={linkWith}
                    onChange={(value: string) => {
                      if (value?.length) {
                        searchParams.set(LINK_PARAM, value);
                      } else {
                        searchParams.delete(LINK_PARAM);
                      }
                      setSearchParams(searchParams);
                      setLinkWith(value);
                    }}
                    placeholder={"Link Payroll With"}
                  />
                </div>
                {linkWith === "project" && (
                  <SearchableSelectField
                    key={resetKey}
                    className="w-full capitalize flex-1 "
                    options={projectOptions ?? []}
                    inputProps={{
                      ...getInputProps(fields.project_id, { type: "text" }),
                    }}
                    placeholder={"Select Project"}
                    labelProps={{
                      children: "Project",
                    }}
                    errors={fields.project_id.errors}
                  />
                )}
                {linkWith === "site" && (
                  <SearchableSelectField
                    className="capitalize"
                    options={allSiteOptions ?? []}
                    inputProps={{
                      ...getInputProps(fields.site_id, {
                        type: "text",
                      }),
                      defaultValue: fields.site_id.initialValue ?? undefined,
                    }}
                    placeholder={"Select Site"}
                    labelProps={{
                      children: "Site",
                    }}
                    errors={fields.site_id.errors}
                  />
                )}
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
