import {
  isGoodStatus,
  SiteSchema,
  replaceUnderscore,
  hasPermission,
  updateRole,
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
  Await,
  defer,
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createSite } from "@canny_ecosystem/supabase/mutations";
import type { SiteDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { UPDATE_SITE } from "./$siteId.update-site";
import { getLocationsForSelectByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { LocationsListWrapper } from "@/components/projects/sites/locations-list-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const CREATE_SITE = "create-site";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:project_sites`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    if (!projectId) throw new Error("No projectId provided");

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const locationOptionsPromise = getLocationsForSelectByCompanyId({
      supabase,
      companyId,
    }).then(({ data, error }) => {
      if (data) {
        const locationOptions = data.map((location) => ({
          label: location.name,
          value: location.id,
        }));
        return { data: locationOptions, error };
      }
      return { data, error };
    });

    return defer({
      error: null,
      projectId,
      locationOptionsPromise,
    });
  } catch (error) {
    return json(
      {
        error,
        projectId,
        locationOptionsPromise: null,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const projectId = params.projectId;

  try {
    if (!projectId) throw new Error("No projectId provided");

    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: SiteSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createSite({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Site created successfully",
        error: null,
        returnTo: `/projects/${projectId}/sites`,
      });
    }
    return json(
      {
        status: "error",
        message: "Site creation failed",
        error,
        returnTo: `/projects/${projectId}/sites`,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: `/projects/${projectId}/sites`,
      },
      { status: 500 }
    );
  }
}

export default function CreateSite({
  updateValues,
}: {
  updateValues?: SiteDatabaseUpdate | null;
}) {
  const { projectId, locationOptionsPromise, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const SITE_TAG = updateValues ? UPDATE_SITE : CREATE_SITE;

  const initialValues = updateValues ?? getInitialValueFromZod(SiteSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: SITE_TAG,
    constraint: getZodConstraint(SiteSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      project_id: initialValues.project_id ?? projectId,
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData.error,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to create site" />;

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(SITE_TAG)}
              </CardTitle>
              <CardDescription>
                {SITE_TAG.split("-")[0]} site of a project that will be central
                in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.project_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.site_code, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.site_code.name
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.site_code.name),
                  }}
                  errors={fields.site_code.errors}
                />
                <Suspense fallback={<div>Loading...</div>}>
                  <Await resolve={locationOptionsPromise}>
                    {(resolvedData) => {
                      if (!resolvedData)
                        return (
                          <ErrorBoundary message="Failed to load locations" />
                        );
                      return (
                        <LocationsListWrapper
                          data={resolvedData.data}
                          error={resolvedData.error}
                          fields={fields}
                          resetKey={resetKey}
                        />
                      );
                    }}
                  </Await>
                </Suspense>
              </div>
              <CheckboxField
                buttonProps={getInputProps(fields.is_active, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_active.id,
                  children: "Is this site active?",
                }}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.address_line_1, { type: "text" }),
                  placeholder: replaceUnderscore(fields.address_line_1.name),
                  className: "placeholder:capitalize",
                }}
                labelProps={{
                  children: "Address",
                }}
                errors={fields.address_line_1.errors}
              />
              <Field
                className="-mt-4"
                inputProps={{
                  ...getInputProps(fields.address_line_2, { type: "text" }),
                  placeholder: replaceUnderscore(fields.address_line_2.name),
                  className: "placeholder:capitalize",
                }}
                errors={fields.address_line_2.errors}
              />
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.city, { type: "text" }),
                    className: "capitalize",
                    placeholder: `Enter ${fields.city.name}`,
                  }}
                  labelProps={{
                    children: fields.city.name,
                  }}
                  errors={fields.city.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={statesAndUTs}
                  inputProps={{
                    ...getInputProps(fields.state, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.state.name}`}
                  labelProps={{
                    children: fields.state.name,
                  }}
                  errors={fields.state.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.pincode, { type: "text" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(
                      fields.pincode.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.pincode.name),
                  }}
                  errors={fields.pincode.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.latitude, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${fields.latitude.name}`,
                  }}
                  labelProps={{
                    children: fields.latitude.name,
                  }}
                  errors={fields.latitude.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.longitude, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(
                      fields.longitude.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.longitude.name),
                  }}
                  errors={fields.longitude.errors}
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
