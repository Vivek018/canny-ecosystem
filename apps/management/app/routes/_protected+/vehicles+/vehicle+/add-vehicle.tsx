import {
  hasPermission,
  isGoodStatus,
  VehiclesSchema,
  transformStringArrayIntoOptions,
  createRole,
  vehicleOwnershipArray,
  vehicleTypeArray,
  SIZE_10MB,
} from "@canny_ecosystem/utils";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createVehicles } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type {
  VehiclesDatabaseInsert,
  VehiclesDatabaseUpdate,
} from "@canny_ecosystem/supabase/types";
import { UPDATE_VEHICLES } from "./$vehicleId+/update-vehicle";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import {
  getEmployeesBySiteId,
  getPayeesByCompanyId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { addOrUpdateVehicleWithPhoto } from "@canny_ecosystem/supabase/media";

export const CREATE_VEHICLES = "create-vehicles";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.vehicles}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const url = new URL(request.url);

  const urlSearchParams = new URLSearchParams(url.searchParams);
  try {
    const site = urlSearchParams.get("site") ?? "";
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: payeeData } = await getPayeesByCompanyId({
      companyId,
      supabase,
    });
    const payeeOptions = payeeData?.map((payee: any) => ({
      label: payee.payee_code as string,
      pseudoLabel: payee?.name as string,
      value: payee.id as string,
    }));

    const { data: siteData } = await getSiteNamesByCompanyId({
      companyId,
      supabase,
    });

    const siteOptions = siteData?.map((siteData: any) => ({
      label: siteData.name as string,
      pseudoLabel: siteData?.projects?.name as string,
      value: siteData.id as string,
    }));

    let employeeData = null;
    if (site) {
      const { data } = await getEmployeesBySiteId({
        siteId: site,
        supabase,
      });
      employeeData = data;
    }
    const employeeOptions = employeeData?.map((employeeData: any) => ({
      label: employeeData.employee_code as string,
      pseudoLabel: `${
        employeeData?.first_name
      } ${employeeData?.middle_name ?? ""} ${employeeData?.last_name ?? ""}`,
      value: employeeData.id as string,
    }));

    return json({
      error: null,
      companyId,
      payeeOptions,
      siteOptions,
      employeeOptions,
    });
  } catch (error) {
    return json(
      {
        error,
        companyId: null,
        payeeOptions: [],
        siteOptions: [],
        employeeOptions: [],
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB })
    );
    const submission = parseWithZod(formData, {
      schema: VehiclesSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }
    if (submission.value.photo) {
      const { error, status } = await addOrUpdateVehicleWithPhoto({
        vehicleData: submission.value as VehiclesDatabaseInsert,
        photo: submission.value.photo as File,
        supabase,
        route: "add",
      });

      if (isGoodStatus(status)) {
        return json({
          status: "success",
          message: "Vehicle added successfully",
          error: null,
        });
      }

      return json({
        status: "error",
        message: "Error adding Vehicle",
        error,
      });
    }

    const { status, error } = await createVehicles({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicles created",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Vehicles creation failed", error },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreateVehicle({
  updateValues,
  employeeOptionsFromUpdate,
  payeeOptionsFromUpdate,
  siteOptionsFromUpdate,
}: {
  updateValues?: VehiclesDatabaseUpdate | null;
  payeeOptionsFromUpdate: any[];
  siteOptionsFromUpdate: any[];
  employeeOptionsFromUpdate: any[];
}) {
  const { companyId, error, employeeOptions, payeeOptions, siteOptions } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const VEHICLES_TAG = updateValues ? UPDATE_VEHICLES : CREATE_VEHICLES;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialValues = updateValues ?? getInitialValueFromZod(VehiclesSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: VEHICLES_TAG,
    constraint: getZodConstraint(VehiclesSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VehiclesSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
      photo: undefined,
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.vehicles);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "vehicles creation failed",
          variant: "destructive",
        });
      }
      navigate("/vehicles", { replace: true });
    }
  }, [actionData]);

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.vehicles);
    return <ErrorBoundary error={error} message="Failed to load vehicles" />;
  }

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(VEHICLES_TAG)}
              </CardTitle>
              <CardDescription>
                {VEHICLES_TAG.split("-")[0]} a vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, {
                  type: "hidden",
                })}
              />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.registration_number, {
                      type: "text",
                    }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(fields.registration_number.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(
                      fields.registration_number.name
                    ),
                  }}
                  errors={fields.registration_number.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.name, { type: "text" }),
                    autoFocus: true,
                    placeholder: `Enter ${fields.name.name}`,
                  }}
                  labelProps={{ children: fields.name.name }}
                  errors={fields.name.errors}
                />
              </div>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.vehicle_type, {
                      type: "text",
                    }),
                    placeholder: `Select ${fields.vehicle_type.name}`,
                  }}
                  options={transformStringArrayIntoOptions(
                    vehicleTypeArray as unknown as string[]
                  )}
                  labelProps={{
                    children: replaceUnderscore(fields.vehicle_type.name),
                  }}
                  errors={fields.vehicle_type.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.ownership, {
                      type: "text",
                    }),
                    placeholder: `Select ${fields.ownership.name}`,
                  }}
                  options={transformStringArrayIntoOptions(
                    vehicleOwnershipArray as unknown as string[]
                  )}
                  labelProps={{
                    children: fields.ownership.name,
                  }}
                  errors={fields.ownership.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.price, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.price.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.price.name),
                  }}
                  errors={fields.price.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.monthly_rate, {
                      type: "number",
                    }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(fields.monthly_rate.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.monthly_rate.name),
                  }}
                  errors={fields.monthly_rate.errors}
                />
              </div>
              <SearchableSelectField
                key={resetKey}
                inputProps={{
                  ...getInputProps(fields.payee_id, {
                    type: "text",
                  }),
                  placeholder: "Select Payee",
                }}
                options={payeeOptions ?? payeeOptionsFromUpdate}
                labelProps={{
                  children: "Payees",
                }}
                errors={fields.payee_id.errors}
              />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.site_id, {
                      type: "text",
                    }),
                    placeholder: "Select Site",
                  }}
                  onChange={(project) => {
                    if (project?.length) {
                      searchParams.set("site", project);
                    } else {
                      searchParams.delete("site");
                    }
                    setSearchParams(searchParams);
                  }}
                  options={siteOptions ?? siteOptionsFromUpdate}
                  labelProps={{
                    children: "Sites",
                  }}
                  errors={fields.site_id.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.driver_id, {
                      type: "text",
                    }),
                    placeholder: "Select Driver",
                  }}
                  options={employeeOptions ?? employeeOptionsFromUpdate}
                  labelProps={{
                    children: "Driver",
                  }}
                  errors={fields.driver_id.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.start_date, {
                      type: "date",
                    }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(fields.start_date.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.start_date.name),
                  }}
                  errors={fields.start_date.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.end_date, { type: "date" }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(fields.end_date.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.end_date.name),
                  }}
                  errors={fields.end_date.errors}
                />
              </div>

              <Field
                className="my-2"
                inputProps={{
                  ...getInputProps(fields.photo, { type: "file" }),
                  placeholder: `Enter ${replaceUnderscore(fields.photo.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.photo.name),
                }}
                errors={fields.photo.errors}
              />
              <CheckboxField
                buttonProps={getInputProps(fields.is_active, {
                  type: "checkbox",
                })}
                labelProps={{
                  children: replaceUnderscore(fields.is_active.name),
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
