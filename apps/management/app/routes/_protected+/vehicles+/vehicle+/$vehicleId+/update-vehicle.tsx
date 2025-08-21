import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  getEmployeesBySiteId,
  getPayeesByCompanyId,
  getSiteNamesByCompanyId,
  getVehicleById,
} from "@canny_ecosystem/supabase/queries";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  updateVehicle,
  updateVehicleById,
} from "@canny_ecosystem/supabase/mutations";
import {
  hasPermission,
  isGoodStatus,
  VehiclesSchema,
  updateRole,
  SIZE_10MB,
} from "@canny_ecosystem/utils";
import CreateVehicle from "../add-vehicle";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  attribute,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
} from "@canny_ecosystem/utils/constant";
import { clearCacheEntry } from "@/utils/cache";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import type { VehiclesDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { addOrUpdateVehicleWithPhoto } from "@canny_ecosystem/supabase/media";

export const UPDATE_VEHICLES = "update-vehicles";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const vehicleId = params.vehicleId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.vehicles}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const url = new URL(request.url);

  const urlSearchParams = new URLSearchParams(url.searchParams);
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const site = urlSearchParams.get("site") ?? "";

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

    let vehicleData = null;
    let vehicleError = null;

    if (vehicleId) {
      ({ data: vehicleData, error: vehicleError } = await getVehicleById({
        supabase,
        id: vehicleId,
      }));

      if (vehicleError) throw vehicleError;
    } else {
      throw new Error("Vehicle ID not provided");
    }

    return json({
      vehicleData,
      payeeOptions,
      siteOptions,
      employeeOptions,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        payeeOptions: [],
        siteOptions: [],
        employeeOptions: [],
        vehicleData: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const vehicleId = params.vehicleId;

  const { supabase } = getSupabaseWithHeaders({ request });
  const { data: oldVehicleData } = await getVehicleById({
    supabase,
    id: vehicleId!,
  });
  const oldFilePath = `vehicles/${oldVehicleData!.registration_number}`;

  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB }),
    );

    const submission = parseWithZod(formData, {
      schema: VehiclesSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    if (submission.value.photo) {
      if (
        oldVehicleData?.registration_number !==
        submission.value.registration_number
      ) {
        const { error } = await addOrUpdateVehicleWithPhoto({
          vehicleData: submission.value as VehiclesDatabaseInsert,
          photo: submission.value.photo as File,
          supabase,
          route: "update",
        });

        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([oldFilePath]);

        if (!error) {
          return json({
            status: "success",
            message: "Vehicle updated successfully",
            error: null,
          });
        }
        return json(
          {
            status: "error",
            message: "Vehicle Updated Failed",
            error: error,
          },
          { status: 400 },
        );
      }

      await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .remove([oldFilePath]);

      const { error } = await addOrUpdateVehicleWithPhoto({
        vehicleData: submission.value as VehiclesDatabaseInsert,
        photo: submission.value.photo as File,
        supabase,
        route: "update",
      });

      if (!error) {
        return json({
          status: "success",
          message: "Vehicle updated successfully",
          error: null,
        });
      }
      return json(
        {
          status: "error",
          message: "Vehicle Updated Failed",
          error: error,
        },
        { status: 400 },
      );
    }
    if (
      oldVehicleData?.photo &&
      oldVehicleData?.registration_number !==
        submission.value.registration_number
    ) {
      const newFilePath = `vehicles/${submission.value!.registration_number}`;

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

      const { error: vehicleError } = await updateVehicleById({
        supabase,
        vehicleId: vehicleId!,
        data: {
          ...submission.value,
          photo: `${SUPABASE_MEDIA_URL_PREFIX}${urlData!.fullPath}`,
        },
      });

      if (!uploadError && !downloadError && !vehicleError) {
        return json({
          status: "success",
          message: "Vehicle updated successfully",
          error: null,
        });
      }
      return json({
        status: "error",
        message: "Vehicle update failed",
        error: uploadError || downloadError || vehicleError,
      });
    }

    const { status, error } = await updateVehicle({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicle updated successfully",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Vehicle update failed", error },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        data: null,
      },
      { status: 500 },
    );
  }
}

export default function UpdateVehicle() {
  const { vehicleData, error, employeeOptions, payeeOptions, siteOptions } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.vehicles);
        toast({
          title: "Success",
          description: actionData?.message || "Vehicle updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message ||
            "Vehicle update failed",
          variant: "destructive",
        });
      }
      navigate("/vehicles", {
        replace: true,
      });
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load vehicles" />;

  return (
    <CreateVehicle
      updateValues={vehicleData}
      payeeOptionsFromUpdate={payeeOptions as unknown as any[]}
      siteOptionsFromUpdate={siteOptions as unknown as any[]}
      employeeOptionsFromUpdate={employeeOptions as unknown as any[]}
    />
  );
}
