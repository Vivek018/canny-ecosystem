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
  VehiclesInsuranceSchema,
  SIZE_10MB,
} from "@canny_ecosystem/utils";
import { getVehicleInsuranceById } from "@canny_ecosystem/supabase/queries";
import {
  updateVehicleInsurance,
  updateVehicleInsuranceById,
} from "@canny_ecosystem/supabase/mutations";
import { useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  attribute,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
} from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { CreateVehicleInsurance } from "@/components/vehicles/insurance/create-vehicle-insurance";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { addOrUpdateVehicleInsuranceWithDocument } from "@canny_ecosystem/supabase/media";
import type { VehiclesInsuranceDatabaseInsert } from "@canny_ecosystem/supabase/types";

export const UPDATE_VEHICLE_INSURANCE = "update-vehicle-insurance";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const insuranceId = params.insuranceId;
  const vehicleId = params.vehicleId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.vehicle_insurance}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let vehicleInsuranceData = null;
    let vehicleInsuranceError = null;

    if (insuranceId) {
      ({ data: vehicleInsuranceData, error: vehicleInsuranceError } =
        await getVehicleInsuranceById({
          supabase,
          id: insuranceId,
        }));
    }

    if (vehicleInsuranceError) throw vehicleInsuranceError;

    return json({
      vehicleInsuranceData,
      vehicleId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        vehicleId,
        vehicleInsuranceData: null,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const insuranceId = params.insuranceId;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data: oldVehicleData } = await getVehicleInsuranceById({
    supabase,
    id: insuranceId!,
  });
  const oldFilePath = `vehicles/${oldVehicleData!.insurance_number}`;
  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB })
    );
    const submission = parseWithZod(formData, {
      schema: VehiclesInsuranceSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }
    if (submission.value.document) {
      if (
        oldVehicleData?.insurance_number !== submission.value.insurance_number
      ) {
        const { error } = await addOrUpdateVehicleInsuranceWithDocument({
          vehicleInsuranceData:
            submission.value as VehiclesInsuranceDatabaseInsert,
          document: submission.value.document as File,
          supabase,
          route: "update",
        });

        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([oldFilePath]);

        if (!error) {
          return json({
            status: "success",
            message: "Insurance updated successfully",
            error: null,
          });
        }
        return json(
          {
            status: "error",
            message: "Vehicle Updated Failed",
            error: error,
          },
          { status: 400 }
        );
      }

      await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .remove([oldFilePath]);

      const { error } = await addOrUpdateVehicleInsuranceWithDocument({
        vehicleInsuranceData:
          submission.value as VehiclesInsuranceDatabaseInsert,
        document: submission.value.document as File,
        supabase,
        route: "update",
      });

      if (!error) {
        return json({
          status: "success",
          message: "Insurance updated successfully",
          error: null,
        });
      }
      return json(
        {
          status: "error",
          message: "Insurance Updated Failed",
          error: error,
        },
        { status: 400 }
      );
    }
    if (
      oldVehicleData?.document &&
      oldVehicleData?.insurance_number !== submission.value.insurance_number
    ) {
      const newFilePath = `vehicles/${submission.value!.insurance_number}`;

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .download(oldFilePath);

      if (downloadError || !fileData) {
        console.error("Failed to download the file to rename.");
      }

      const { data: urlData, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .upload(newFilePath, fileData!, {
          contentType: fileData!.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Failed to upload the renamed file.");
      }

      await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .remove([oldFilePath]);

      const { error: insuranceError } = await updateVehicleInsuranceById({
        supabase,
        insuranceId: insuranceId!,
        data: {
          ...submission.value,
          document: `${SUPABASE_MEDIA_URL_PREFIX}${urlData!.fullPath}`,
        },
      });

      if (!uploadError && !downloadError && !insuranceError) {
        return json({
          status: "success",
          message: "Insurance updated successfully",
          error: null,
        });
      }
      return json({
        status: "error",
        message: "Insurance update failed",
        error: uploadError || downloadError || insuranceError,
      });
    }

    const { status, error } = await updateVehicleInsurance({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicle Insurance updated successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to update Vehicle Insurance",
      error,
    });
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

export default function UpdateVehicleInsurance() {
  const { vehicleInsuranceData, vehicleId, error } =
    useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = VehiclesInsuranceSchema;

  const [form, fields] = useForm({
    id: UPDATE_VEHICLE_INSURANCE,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: { ...vehicleInsuranceData, document: undefined },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description:
          (error as any)?.message || "Vehicle Insurance update failed",
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.vehicle_overview}${vehicleId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Vehicle Insurance updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Vehicle Insurance update failed",
          variant: "destructive",
        });
      }
      navigate(`/vehicles/${vehicleId}`);
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load vehicle insurance details"
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
            <CreateVehicleInsurance
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
