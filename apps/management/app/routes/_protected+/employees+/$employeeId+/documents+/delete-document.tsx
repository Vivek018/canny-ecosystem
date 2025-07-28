import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { deleteEmployeeDocument } from "@canny_ecosystem/supabase/media";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId ?? "";
  const url = new URL(request.url);
  const documentType = url.searchParams.get("documentType") ?? "";
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const { status, error } = await deleteEmployeeDocument({
      supabase,
      employeeId,
      documentType,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Document deleted successfully",
        error: null,
        returnTo: `/employees/${employeeId}/documents`,
      });
    }
    return json(
      {
        status: "error",
        message: "Document delete failed",
        error,
        returnTo: `/employees/${employeeId}/documents`,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: `/employees/${employeeId}/documents`,
      },
      { status: 500 },
    );
  }
}

export default function DeleteDocument() {
  const { employeeId } = useParams();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_documents}${employeeId}`,
        );
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
