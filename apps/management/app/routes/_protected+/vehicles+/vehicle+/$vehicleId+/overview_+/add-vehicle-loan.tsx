import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  isGoodStatus,
  VehiclesLoanSchema,
  getInitialValueFromZod,
  hasPermission,
  createRole,
  SIZE_10MB,
} from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import type { VehiclesLoanDetailsDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { CreateVehicleLoan } from "@/components/vehicles/loan/create-vehicle-loan";
import { createVehicleLoan } from "@canny_ecosystem/supabase/mutations";
import { addOrUpdateVehicleLoanWithDocument } from "@canny_ecosystem/supabase/media";

export const ADD_VEHICLE_LOAN = "add-vehicle-loan";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const vehicleId = params.vehicleId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.vehicle_loan}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB }),
    );

    if (!vehicleId) {
      return json({
        status: "error",
        message: "Invalid vehicle id",
        returnTo: "/vehicles",
      });
    }

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
      const { error, status } = await addOrUpdateVehicleLoanWithDocument({
        vehicleLoanData: submission.value as VehiclesLoanDetailsDatabaseInsert,
        document: submission.value.document as File,
        supabase,
        route: "add",
      });

      if (isGoodStatus(status)) {
        return json({
          status: "success",
          message: "Loan added successfully",
          error: null,
        });
      }

      return json({
        status: "error",
        message: "Error adding loan",
        error,
      });
    }
    const { status, error } = await createVehicleLoan({
      supabase,
      data: { ...submission.value, vehicle_id: vehicleId },
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Loan added successfully",
        error: null,
        returnTo: `/vehicles/vehicle/${vehicleId}`,
      });
    }
    return json({ status, error });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function AddVehicleLoan() {
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = VehiclesLoanSchema;
  const { vehicleId } = useParams();

  const initialValues = getInitialValueFromZod(currentSchema);

  const [form, fields] = useForm({
    id: ADD_VEHICLE_LOAN,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      vehicle_id: vehicleId,
      document: undefined,
    },
  });

  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.vehicle_overview}${vehicleId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Loan added",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "Address add failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? -1);
    }
  }, [actionData]);

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
            <CreateVehicleLoan key={resetKey} fields={fields as any} />
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
