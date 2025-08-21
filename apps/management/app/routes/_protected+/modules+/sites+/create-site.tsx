import {
  isGoodStatus,
  SiteSchema,
  replaceUnderscore,
  hasPermission,
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

import { createSite } from "@canny_ecosystem/supabase/mutations";
import type { SiteDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { attribute, statesAndUTs } from "@canny_ecosystem/utils/constant";
import { UPDATE_SITE } from "./$siteId+/update-site";
import {
  getLocationsForSelectByCompanyId,
  getProjectsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const CREATE_SITE = "create-site";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.site}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const { data, error } = await getLocationsForSelectByCompanyId({
      supabase,
      companyId,
    });

    const { data: projectsData, error: projectsError } =
      await getProjectsByCompanyId({ supabase, companyId });

    if (error ?? projectsError) throw error ?? projectsError;

    return json({
      error: null,
      companyId,
      locationOptions: data?.map((location) => ({
        label: location?.name,
        value: location?.id,
      })),
      projectOptions: projectsData?.map((project) => ({
        label: project?.name,
        value: project?.id,
      })),
    });
  } catch (error) {
    return json(
      {
        error,
        companyId,
        locationOptions: null,
        projectOptions: null,
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
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Site created successfully",
        error: null,
        returnTo: "/modules/sites",
      });
    }
    return json(
      {
        status: "error",
        message: "Site creation failed",
        error,
        returnTo: "/modules/sites",
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: "/modules/sites",
      },
      { status: 500 }
    );
  }
}

export default function CreateSite({
  locationFromUpdate,
  projectFromUpdate,
  updateValues,
}: {
  locationFromUpdate: ComboboxSelectOption[] | undefined | null;
  projectFromUpdate: ComboboxSelectOption[] | undefined | null;
  updateValues?: SiteDatabaseUpdate | null;
}) {
  const { companyId, locationOptions, projectOptions, error } =
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
      company_id: initialValues.company_id ?? companyId,
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.sites);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            (actionData?.error as any)?.message || actionData?.error?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo ?? "/modules/sites");
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
              <CardTitle className="text-3xl capitalize">
                {replaceDash(SITE_TAG)}
              </CardTitle>
              <CardDescription>
                {SITE_TAG.split("-")[0]} site of a company that will be central
                in all of canny apps
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
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={
                    (updateValues ? projectFromUpdate : projectOptions) ?? []
                  }
                  inputProps={{
                    ...getInputProps(fields.project_id, {
                      type: "text",
                    }),
                  }}
                  placeholder={"Select Project"}
                  labelProps={{
                    children: "Project",
                  }}
                  errors={fields.project_id.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize"
                  options={
                    (updateValues ? locationFromUpdate : locationOptions) ?? []
                  }
                  inputProps={{
                    ...getInputProps(fields.company_location_id, {
                      type: "text",
                    }),
                  }}
                  placeholder={"Select Company Location"}
                  labelProps={{
                    children: "Company Location",
                  }}
                  errors={fields.company_location_id.errors}
                />
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
                  placeholder: replaceUnderscore(fields.address_line_1.name)!,
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
                  placeholder: replaceUnderscore(fields.address_line_2.name)!,
                  className: "placeholder:capitalize",
                }}
                errors={fields.address_line_2.errors}
              />
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.city, { type: "text" }),

                    placeholder: `Enter ${fields.city.name}`,
                  }}
                  labelProps={{
                    children: fields.city.name,
                  }}
                  errors={fields.city.errors}
                />
                <SearchableSelectField
                  key={resetKey + 2}
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
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.capacity, { type: "number" }),

                    placeholder: `Enter ${fields.capacity.name}`,
                  }}
                  labelProps={{
                    children: `Employee ${fields.capacity.name}`,
                  }}
                  errors={fields.capacity.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.latitude, { type: "number" }),

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
