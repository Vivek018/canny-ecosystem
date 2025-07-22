import {
  hasPermission,
  isGoodStatus,
  UserSchema,
  replaceUnderscore,
  createRole,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
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
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createUserById } from "@canny_ecosystem/supabase/mutations";
import type { UserDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { UPDATE_USER_TAG } from "./$userId.update-user";
import {
  transformStringArrayIntoOptions,
  userRoles,
} from "@canny_ecosystem/utils";
import {
  SITE_PARAM,
} from "@/components/employees/form/create-employee-project-assignment";
import {
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const CREATE_USER_TAG = "create-user";

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.settingUsers}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const { data: sites } = await getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    const siteOptions = sites?.map((site) => ({
      label: site?.name,
      pseudoLabel: site?.projects?.name,
      value: site?.id,
    }));

    return json({
      status: "success",
      message: "User form loaded",
      companyId,
      siteOptions,
      error: null,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        companyId,
        siteOptions: null,
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
      schema: UserSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createUserById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "User created successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to create user",
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

export default function CreateUser({
  updateValues,
  siteOptions: updateSiteOptions,
}: {
  siteOptions: ComboboxSelectOption[] | null | undefined;
  updateValues?: UserDatabaseUpdate | null;
}) {
  const { companyId, siteOptions } =
    useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const USER_TAG = updateValues ? UPDATE_USER_TAG : CREATE_USER_TAG;
  const [resetKey, setResetKey] = useState(Date.now());
  const [searchParams, setSearchParams] = useSearchParams();
  const [supervisor, setSupervisor] = useState(
    updateValues ? updateValues.role : ""
  );
  const initialValues = updateValues ?? getInitialValueFromZod(UserSchema);

  const [form, fields] = useForm({
    id: USER_TAG,
    constraint: getZodConstraint(UserSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserSchema });
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
      clearExactCacheEntry(cacheKeyPrefix.users);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.error?.message ?? "User creation failed",
        variant: "destructive",
      });
    }
    navigate("/settings/users", { replace: true });
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(USER_TAG)}
              </CardTitle>
              <CardDescription>
                {USER_TAG.split("-")[0]} user that will have access to canny
                apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <input {...getInputProps(fields.id, { type: "hidden" })} />

              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.first_name, { type: "text" }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(
                      fields.first_name.name
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.first_name.name),
                  }}
                  errors={fields.first_name.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.last_name, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.last_name.name
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.last_name.name),
                  }}
                  errors={fields.last_name.errors}
                />
              </div>

              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.email, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.email.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.email.name),
                  }}
                  errors={fields.email.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.mobile_number, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.mobile_number.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.mobile_number.name),
                  }}
                  errors={fields.mobile_number.errors}
                />
              </div>

              <SearchableSelectField
                key={resetKey}
                className="mb-2"
                options={transformStringArrayIntoOptions(
                  userRoles as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.role, { type: "text" }),
                }}
                onChange={(e) => {
                  setSupervisor(e);
                }}
                placeholder={`Select ${replaceUnderscore(fields.role.name)}`}
                labelProps={{
                  children: replaceUnderscore(fields.role.name),
                }}
                errors={fields.role.errors}
              />

              {supervisor === "supervisor" && (
                <SearchableSelectField
                  className="capitalize"
                  options={
                    siteOptions ?? updateSiteOptions ?? []
                  }
                  inputProps={{
                    ...getInputProps(fields.site_id, {
                      type: "text",
                    }),
                    defaultValue:
                      searchParams.get(SITE_PARAM) ??
                      String(fields.site_id.initialValue),
                  }}
                  placeholder={"Select Site"}
                  labelProps={{
                    children: "Site",
                  }}
                  onChange={(site) => {
                    if (site?.length) {
                      searchParams.set(SITE_PARAM, site);
                    } else {
                      searchParams.delete(SITE_PARAM);
                    }
                    setSearchParams(searchParams);
                  }}
                  errors={fields.site_id.errors}
                />
              )}

              <CheckboxField
                buttonProps={getInputProps(fields.is_active, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_active.id,
                  children: "Is this user currently active?",
                }}
              />
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
