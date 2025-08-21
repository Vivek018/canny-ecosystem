import {
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
  createRole,
  DepartmentsSchema,
} from "@canny_ecosystem/utils";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { DepartmentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { createDepartment } from "@canny_ecosystem/supabase/mutations";
import { UPDATE_DEPARTMENT_TAG } from "./$departmentId.update-department";
import { getSiteNamesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const CREATE_DEPARTMENT_TAG = "create-department";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.departments}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const { data, error } = await getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    if (error) throw error;

    return json({
      siteOptions: data?.map((site) => ({
        label: site.name,
        pseudoLabel: site?.projects?.name,
        value: site.id,
      })),
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        siteOptions: null,
        companyId,
        error,
      },
      { status: 500 }
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
      schema: DepartmentsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createDepartment({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Department created successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to create department",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function CreateDepartment({
  updateValues,
  siteFromUpdate,
}: {
  updateValues?: DepartmentsDatabaseUpdate | null;
  siteFromUpdate: ComboboxSelectOption[] | null | undefined;
}) {
  const { siteOptions, companyId } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const actionData = useActionData<typeof action>();
  const DEPARTMENT_TAG = updateValues
    ? UPDATE_DEPARTMENT_TAG
    : CREATE_DEPARTMENT_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(DepartmentsSchema);

  const [form, fields] = useForm({
    id: DEPARTMENT_TAG,
    constraint: getZodConstraint(DepartmentsSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DepartmentsSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.departments);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.error?.message ?? "Departments Creation failed",
        variant: "destructive",
      });
    }
    navigate("/modules/departments", { replace: true });
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(DEPARTMENT_TAG)}
              </CardTitle>
              <CardDescription>
                {DEPARTMENT_TAG.split("-")[0]} department for the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={(updateValues ? siteFromUpdate : siteOptions) ?? []}
                inputProps={{
                  ...getInputProps(fields.site_id, {
                    type: "text",
                  }),
                }}
                placeholder={"Select Site"}
                labelProps={{
                  children: "Site",
                }}
                errors={fields.site_id.errors}
              />
            </CardContent>
            <FormButtons
              setResetKey={setResetKey}
              form={form}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
