import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteInvoiceProof } from "@canny_ecosystem/supabase/media";
import { deleteInvoiceById } from "@canny_ecosystem/supabase/mutations";
import { getInvoiceById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const invoiceId = params.invoiceId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.invoice}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    let invoiceData = null;

    if (invoiceId) {
      ({ data: invoiceData } = await getInvoiceById({
        supabase,
        id: invoiceId,
      }));
    }

    const { error: proofError } = await deleteInvoiceProof({
      supabase,
      documentName: invoiceData?.invoice_number!,
    });
    const { status, error } = await deleteInvoiceById({
      supabase,
      id: invoiceId ?? "",
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Invoice deleted",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Invoice delete failed",
        error: proofError || error,
      },
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

export default function DeleteInvoice() {
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.payroll_invoice}`);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: (actionData?.error as any)?.message || actionData?.error?.message,
          variant: "destructive",
        });
      }
    }
    navigate("/payroll/invoices", { replace: true });
  }, [actionData, toast, navigate]);
  return null;
}
