import {
  hasPermission,
  isGoodStatus,
  LocationSchema,
  replaceUnderscore,
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
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

import { UPDATE_LOCATION } from "./$locationId.update-location";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createLocation } from "@canny_ecosystem/supabase/mutations";
import type { LocationDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const CREATE_LOCATION = "create-location";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${updateRole}:setting_locations`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    return json({
      status: "success",
      message: "CompanyId found",
      companyId,
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      companyId: null,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: LocationSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createLocation({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Location created",
        error: null,
      });

    return json(
      { status: "error", message: "Location creation failed", error },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreateLocation({
  updateValues,
}: {
  updateValues?: LocationDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const LOCATION_TAG = updateValues ? UPDATE_LOCATION : CREATE_LOCATION;

  const initialValues = updateValues ?? getInitialValueFromZod(LocationSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: LOCATION_TAG,
    constraint: getZodConstraint(LocationSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LocationSchema });
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
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
      navigate("/settings/locations", {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Location creation failed",
        variant: "destructive",
      });
    }
  }, [actionData, toast, navigate]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(LOCATION_TAG)}
              </CardTitle>
              <CardDescription>
                {LOCATION_TAG.split("-")[0]} location of a company that will be
                central in all of canny apps
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
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
              <CheckboxField
                buttonProps={getInputProps(fields.is_primary, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_primary.id,
                  children: "Is this your primary address?",
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
