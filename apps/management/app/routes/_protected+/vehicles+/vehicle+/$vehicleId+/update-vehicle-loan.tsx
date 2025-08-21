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
import {
  isGoodStatus,
  hasPermission,
  updateRole,
  SIZE_10MB,
  VehiclesLoanSchema,
} from "@canny_ecosystem/utils";
import { getVehicleLoanDetailsByVehicleId } from "@canny_ecosystem/supabase/queries";
import { useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute, SUPABASE_BUCKET } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import type { VehiclesLoanDetailsDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { CreateVehicleLoan } from "@/components/vehicles/loan/create-vehicle-loan";
import { addOrUpdateVehicleLoanWithDocument } from "@canny_ecosystem/supabase/media";
import { updateVehicleLoan } from "@canny_ecosystem/supabase/mutations";

export const UPDATE_VEHICLE_LOAN = "update-vehicle-loan";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const vehicleId = params.vehicleId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.vehicle_loan}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let vehicleLoanData = null;
    let vehicleLoanError = null;

    if (vehicleId) {
      ({ data: vehicleLoanData, error: vehicleLoanError } =
        await getVehicleLoanDetailsByVehicleId({
          supabase,
          vehicleId,
        }));
    }

    if (vehicleLoanError) throw vehicleLoanError;

    return json({
      vehicleLoanData,
      vehicleId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        vehicleId,
        vehicleLoanData: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const vehicleId = params.vehicleId!;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data: oldVehicleData } = await getVehicleLoanDetailsByVehicleId({
    supabase,
    vehicleId,
  });
  const oldFilePath = `vehicles/loan/${oldVehicleData!.vehicle_id!}`;
  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB }),
    );
    const submission = parseWithZod(formData, {
      schema: VehiclesLoanSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }
    if (submission.value.document) {
      await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .remove([oldFilePath]);

      const { error } = await addOrUpdateVehicleLoanWithDocument({
        vehicleLoanData: submission.value as VehiclesLoanDetailsDatabaseInsert,
        document: submission.value.document as File,
        supabase,
        route: "update",
      });

      if (!error) {
        return json({
          status: "success",
          message: "Loan updated successfully",
          error: null,
        });
      }
      return json(
        {
          status: "error",
          message: "Loan Updated Failed",
          error: error,
        },
        { status: 400 },
      );
    }

    const { status, error } = await updateVehicleLoan({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicle Loan updated successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to update Vehicle loan",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateVehicleLoan() {
  const { vehicleLoanData, vehicleId, error } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = VehiclesLoanSchema;

  const [form, fields] = useForm({
    id: UPDATE_VEHICLE_LOAN,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: { ...vehicleLoanData, document: undefined },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as any)?.message || "Vehicle loan update failed",
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.vehicle_overview}${vehicleId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Vehicle loan updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Vehicle loan update failed",
          variant: "destructive",
        });
      }
      navigate(`/vehicles/vehicle/${vehicleId}`);
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load vehicle loan details"
      />
    );

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
            <CreateVehicleLoan
              key={resetKey}
              fields={fields as any}
              isUpdate={true}
            />
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
