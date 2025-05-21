import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  InvoiceSchema,
  SIZE_1MB,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getCannyCompanyIdByName,
  getInvoiceById,
  getLocationsForSelectByCompanyId,
  getRelationshipsByParentAndChildCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import CreateInvoice, {
  CANNY_NAME,
} from "../payroll-history+/$payrollId+/_reports+/create-invoice";
import { updateInvoiceById } from "@canny_ecosystem/supabase/mutations";
import type { InvoiceDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import {
  addOrUpdateInvoiceWithProof,
  deleteInvoiceProof,
} from "@canny_ecosystem/supabase/media";

export const UPDATE_INVOICE_TAG = "Update-Invoice";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const invoiceId = params.invoiceId;

  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.invoice}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let invoiceData = null;
    let invoiceError = null;

    if (invoiceId) {
      ({ data: invoiceData, error: invoiceError } = await getInvoiceById({
        supabase,
        id: invoiceId,
      }));
    }
    const { data: cannyData, error } = await getCannyCompanyIdByName({
      name: CANNY_NAME,
      supabase,
    });
    if (error) {
      throw new Error("Error fetching company ID");
    }
    let companyRelations = [] as any;
    if (cannyData?.id) {
      const { data } = await getRelationshipsByParentAndChildCompanyId({
        childCompanyId: cannyData?.id,
        parentCompanyId: companyId,
        supabase,
      });
      companyRelations = (data ?? []) as unknown as any;
    }
    const { data: companyLocations } = await getLocationsForSelectByCompanyId({
      companyId,
      supabase,
    });
    const companyLocationArray = companyLocations?.map((location) => ({
      label: location?.name,
      value: location?.id,
    }));
    return json({
      companyLocationArray,
      companyRelations,
      invoiceData,
      error: invoiceError,
    });
  } catch (error) {
    return json(
      {
        error,
        invoiceData: null,
        companyRelations: null,
        companyLocationArray: null,
        payroll: null,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const invoiceId = params.invoiceId;
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_1MB })
    );
    const submission = parseWithZod(formData, { schema: InvoiceSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    if (submission.value.include_proof) {
      if (submission.value.proof) {
        const { error } = await addOrUpdateInvoiceWithProof({
          invoiceData: submission.value as InvoiceDatabaseInsert,
          payrollId: submission.value.payroll_id,
          proof: submission.value.proof as File,
          supabase,
          route: "update",
        });

        if (!error) {
          return json({
            status: "success",
            message: "Invoice updated successfully",
            error: null,
          });
        }

        return json({
          status: "error",
          message: "Error updating Invoice with proof",
          error,
        });
      }
      const { status, error } = await updateInvoiceById({
        supabase,
        invoiceId: invoiceId!,
        data: {
          ...submission.value,
        },
      });
      if (!error) {
        return json(
          {
            status: "success",
            message: "Invoice Updated",
            error: null,
          },
          { status: 400 }
        );
      }
      return json(
        {
          status: status,
          message: "Invoice Updated Failed",
          error: error,
        },
        { status: 400 }
      );
    }

    const { error: proofError } = await deleteInvoiceProof({
      supabase,
      payrollId: submission.value.payroll_id,
      documentName: submission.value.invoice_number,
    });
    const { error: invoiceError } = await updateInvoiceById({
      supabase,
      invoiceId: invoiceId!,
      data: {
        ...submission.value,
      },
    });

    if (!invoiceError && !proofError) {
      return json({
        status: "success",
        message: "Invoice updated",
        error: null,
      });
    }

    return json(
      {
        status: "error",
        message: "Invoice update failed",
        error: invoiceError || proofError,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Unexpected error in updateInvoice action:", error);
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

export default function UpdateInvoice() {
  const { companyRelations, companyLocationArray, invoiceData, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: (error as Error)?.message || "Invoice load failed",
        variant: "destructive",
      });
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(`${cacheKeyPrefix.payroll_invoice}`);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
      navigate("/payroll/invoices", {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description:
          typeof actionData?.error === "string"
            ? actionData.error
            : actionData?.message || "Invoice update failed",
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <CreateInvoice
      updateValues={invoiceData as unknown as InvoiceDatabaseInsert}
      locationArrayFromUpdate={companyLocationArray as unknown as any[]}
      companyRelationsFromUpdate={companyRelations}
    />
  );
}
