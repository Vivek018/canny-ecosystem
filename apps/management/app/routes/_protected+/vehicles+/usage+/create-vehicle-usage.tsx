import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  VehicleUsageSchema,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
  getYears,
  defaultYear,
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
import { createVehicleUsageFromData } from "@canny_ecosystem/supabase/mutations";
import type {
  VehiclesUsageDatabaseInsert,
  VehiclesUsageDatabaseUpdate,
} from "@canny_ecosystem/supabase/types";
import { getVehiclesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { useEffect, useState } from "react";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute, payoutMonths } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { UPDATE_VEHICLE_USAGE_TAG } from "./$usageId.update-vehicle-usage";

export const ADD_VEHICLE_USAGE_TAG = "Add_Vehicle_Usage";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.vehicle_usage}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: vehicleData, error: vehicleError } =
    await getVehiclesByCompanyId({
      supabase,
      companyId,
    });
  if (vehicleError || !vehicleData) {
    throw vehicleError;
  }

  const vehicleOptions = vehicleData.map((userData) => ({
    label: userData.registration_number ?? "",
    value: userData.id,
  }));

  return json({ vehicleOptions });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: VehicleUsageSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createVehicleUsageFromData({
    supabase,
    data: submission.value as unknown as VehiclesUsageDatabaseInsert[],
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Vehicle Usage create successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Vehicle Usage create failed",
    error,
  });
}

export default function AddVehicleUsage({
  updateValues,
  vehicleOptionsFromUpdate,
}: {
  updateValues?: VehiclesUsageDatabaseUpdate | null;
  vehicleOptionsFromUpdate?: any;
}) {
  const { vehicleOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.vehicle_usage}`);
        toast({
          title: "Success",
          description: actionData?.message || "Usage created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            actionData?.message ??
            "Usage create failed",
          variant: "destructive",
        });
      }
      navigate("/vehicles/usage");
    }
  }, [actionData]);

  const VEHICLE_USAGE_TAG = updateValues
    ? UPDATE_VEHICLE_USAGE_TAG
    : ADD_VEHICLE_USAGE_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(VehicleUsageSchema);

  const [form, fields] = useForm({
    id: VEHICLE_USAGE_TAG,
    constraint: getZodConstraint(VehicleUsageSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VehicleUsageSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {replaceUnderscore(VEHICLE_USAGE_TAG)}
              </CardTitle>
              <CardDescription className="lowercase">
                {`${replaceUnderscore(VEHICLE_USAGE_TAG)} by filling this form`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-0 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.month, { type: "text" }),
                    placeholder: "Select Month",
                  }}
                  options={payoutMonths}
                  labelProps={{
                    children: "Month",
                  }}
                  errors={fields.month.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(fields.year, { type: "text" }),
                    placeholder: "Select Year",
                  }}
                  options={transformStringArrayIntoOptions(
                    getYears(25, defaultYear) as unknown as string[]
                  )}
                  labelProps={{
                    children: "Year",
                  }}
                  errors={fields.year.errors}
                />
              </div>

              <SearchableSelectField
                key={resetKey}
                className="w-full capitalize flex-1 "
                options={vehicleOptionsFromUpdate ?? vehicleOptions}
                inputProps={{
                  ...getInputProps(fields.vehicle_id, { type: "text" }),
                }}
                placeholder={"Select Vehicle"}
                labelProps={{
                  children: "Vehicle",
                }}
                errors={fields.vehicle_id.errors}
              />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8 ">
                <Field
                  inputProps={{
                    ...getInputProps(fields.kilometers, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.kilometers.name
                    )}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.kilometers.name),
                  }}
                  errors={fields.kilometers.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.fuel_in_liters, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.fuel_in_liters.name
                    )}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.fuel_in_liters.name),
                  }}
                  errors={fields.fuel_in_liters.errors}
                />
              </div>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8 ">
                <Field
                  inputProps={{
                    ...getInputProps(fields.fuel_amount, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.fuel_amount.name
                    )}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.fuel_amount.name),
                  }}
                  errors={fields.fuel_amount.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.toll_amount, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.toll_amount.name
                    )}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.toll_amount.name),
                  }}
                  errors={fields.toll_amount.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8 ">
                <Field
                  inputProps={{
                    ...getInputProps(fields.maintainance_amount, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.maintainance_amount.name
                    )}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(
                      fields.maintainance_amount.name
                    ),
                  }}
                  errors={fields.maintainance_amount.errors}
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
