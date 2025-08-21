import {
  getFilePathFromUrl,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
} from "@canny_ecosystem/utils/constant";
import type {
  TypedSupabaseClient,
  VehiclesDatabaseInsert,
  VehiclesInsuranceDatabaseInsert,
  VehiclesLoanDetailsDatabaseInsert,
} from "../types";
import {
  createVehicleInsurance,
  createVehicleLoan,
  createVehicles,
  updateVehicle,
  updateVehicleById,
  updateVehicleInsuranceById,
  updateVehicleLoan,
} from "../mutations";
import {
  getVehicleInsuranceDocumentUrlByInsuranceNumber,
  getVehicleLoanDocumentUrlByVehicleId,
  getVehiclePhotoUrlByRegistrationNumber,
} from "../queries";
import { isGoodStatus } from "@canny_ecosystem/utils";

export async function addOrUpdateVehicleWithPhoto({
  supabase,
  photo,
  vehicleData,
  route,
}: {
  supabase: TypedSupabaseClient;
  photo: File;
  vehicleData: VehiclesDatabaseInsert;
  route?: "add" | "update";
}) {
  if (photo instanceof File) {
    const filePath = `vehicles/${vehicleData.registration_number}`;

    const { data: existingData } = await getVehiclePhotoUrlByRegistrationNumber(
      {
        supabase,
        documentName: vehicleData.registration_number!,
      },
    );

    if (existingData?.photo) {
      await deleteVehiclePhoto({
        supabase,
        documentName: vehicleData.registration_number!,
      });
    }

    const buffer = await photo.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: photo.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadVehicleDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    if (route === "add") {
      const { status: insertStatus, error: insertError } = await createVehicles(
        {
          supabase,
          data: {
            ...vehicleData,
            photo: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
        },
      );

      if (insertError) {
        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([filePath]);
        console.error("addVehiclePhoto Error", insertError);
        return {
          status: insertStatus,
          error: insertError || "Error uploading document record",
        };
      }

      return { status: insertStatus, error: null };
    }
    if (route === "update") {
      const { status: updateStatus, error: updateError } =
        await updateVehicleById({
          supabase,
          data: {
            ...vehicleData,
            photo: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
          vehicleId: vehicleData.id!,
        });

      if (updateError) {
        console.error("updateVehiclePhoto Error", updateError);
        return {
          status: updateStatus,
          error: updateError || "Error uploading document record",
        };
      }

      return { status: updateStatus, error: null };
    }
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteVehiclePhoto({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const { data, error } = await getVehiclePhotoUrlByRegistrationNumber({
    supabase,
    documentName,
  });
  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.photo ?? "");

  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  return { status: 200, error: null };
}

export async function uploadVehiclePhoto({
  supabase,
  vehiclePhoto,
  vehicleId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  vehiclePhoto: File;
  vehicleId: string;
  documentName: string;
}) {
  // delete old profile photo if exists
  const { status, error } = await deleteVehiclePhoto({
    supabase,
    documentName,
  });
  if (!isGoodStatus(status)) {
    console.error("deleteVehiclePhoto Error", error);
    return { status, error };
  }

  if (vehiclePhoto instanceof File) {
    const filePath = `vehicles/${documentName}`;

    const buffer = await vehiclePhoto.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: vehiclePhoto.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadVehiclePhoto Error", error);
      return { status: 500, error };
    }

    const { status, error: updateVehicleError } = await updateVehicle({
      supabase,
      data: {
        id: vehicleId,
        photo: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
      },
    });

    if (updateVehicleError) {
      console.error("updateVehicle Error", updateVehicleError);
      return { status, error: updateVehicleError };
    }

    return { status, error: null };
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function addOrUpdateVehicleInsuranceWithDocument({
  supabase,
  document,
  vehicleInsuranceData,
  route,
}: {
  supabase: TypedSupabaseClient;
  document: File;
  vehicleInsuranceData: VehiclesInsuranceDatabaseInsert;
  route?: "add" | "update";
}) {
  if (document instanceof File) {
    const filePath = `vehicles/${vehicleInsuranceData.insurance_number}`;

    const { data: existingData } =
      await getVehicleInsuranceDocumentUrlByInsuranceNumber({
        supabase,
        documentName: vehicleInsuranceData.insurance_number!,
      });

    if (existingData?.document) {
      await deleteVehicleInsuranceDocument({
        supabase,
        documentName: vehicleInsuranceData.insurance_number!,
      });
    }

    const buffer = await document.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: document.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadVehicleInsuranceDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    if (route === "add") {
      const { status: insertStatus, error: insertError } =
        await createVehicleInsurance({
          supabase,
          data: {
            ...vehicleInsuranceData,
            document: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
        });

      if (insertError) {
        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([filePath]);
        console.error("addInsuranceDocument Error", insertError);
        return {
          status: insertStatus,
          error: insertError || "Error uploading document record",
        };
      }

      return { status: insertStatus, error: null };
    }
    if (route === "update") {
      const { status: updateStatus, error: updateError } =
        await updateVehicleInsuranceById({
          supabase,
          data: {
            ...vehicleInsuranceData,
            document: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
          insuranceId: vehicleInsuranceData.id!,
        });

      if (updateError) {
        console.error("updateInsuranceDocument Error", updateError);
        return {
          status: updateStatus,
          error: updateError || "Error uploading document record",
        };
      }

      return { status: updateStatus, error: null };
    }
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteVehicleInsuranceDocument({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const { data, error } = await getVehicleInsuranceDocumentUrlByInsuranceNumber(
    {
      supabase,
      documentName,
    },
  );
  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.document ?? "");

  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  return { status: 200, error: null };
}

export async function addOrUpdateVehicleLoanWithDocument({
  supabase,
  document,
  vehicleLoanData,
  route,
}: {
  supabase: TypedSupabaseClient;
  document: File;
  vehicleLoanData: VehiclesLoanDetailsDatabaseInsert;
  route?: "add" | "update";
}) {
  if (document instanceof File) {
    const filePath = `vehicles/loan/${vehicleLoanData.vehicle_id}`;

    const { data: existingData } = await getVehicleLoanDocumentUrlByVehicleId({
      supabase,
      vehicleId: vehicleLoanData.vehicle_id!,
    });

    if (existingData?.document) {
      await deleteVehicleLoanDocument({
        supabase,
        documentName: vehicleLoanData.vehicle_id!,
      });
    }

    const buffer = await document.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: document.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadVehicleLoanDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    if (route === "add") {
      const { status: insertStatus, error: insertError } =
        await createVehicleLoan({
          supabase,
          data: {
            ...vehicleLoanData,
            document: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
        });

      if (insertError) {
        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([filePath]);
        console.error("addLoanDocument Error", insertError);
        return {
          status: insertStatus,
          error: insertError || "Error uploading document record",
        };
      }

      return { status: insertStatus, error: null };
    }
    if (route === "update") {
      const { status: updateStatus, error: updateError } =
        await updateVehicleLoan({
          supabase,
          data: {
            ...vehicleLoanData,
            document: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
        });

      if (updateError) {
        console.error("updateLoanDocument Error", updateError);
        return {
          status: updateStatus,
          error: updateError || "Error uploading document record",
        };
      }

      return { status: updateStatus, error: null };
    }
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteVehicleLoanDocument({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const { data, error } = await getVehicleLoanDocumentUrlByVehicleId({
    supabase,
    vehicleId: documentName,
  });
  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.document ?? "");

  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  return { status: 200, error: null };
}
