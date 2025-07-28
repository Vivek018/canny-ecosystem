import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { deleteCompanyDocument } from "@canny_ecosystem/supabase/media";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getCompanyDocumentById } from "@canny_ecosystem/supabase/queries";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const documentId = params.documentId ?? "";
  const { data } = await getCompanyDocumentById({ supabase, id: documentId });

  try {
    const { status, error } = await deleteCompanyDocument({
      supabase,
      companyId,
      documentName: data?.name ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Document deleted successfully",
        error: null,
        returnTo: "/settings/documents",
      });
    }
    return json(
      {
        status: "error",
        message: "Document delete failed",
        error,
        returnTo: "/settings/documents",
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: "/settings/documents",
      },
      { status: 500 }
    );
  }
}

export default function DeleteDocument() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.company_document}`);
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);
}
