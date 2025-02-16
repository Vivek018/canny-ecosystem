import { setCompanyId } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteCompany } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearAllCache } from "@/utils/cache";
import { DEFAULT_ROUTE } from "@/constant";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.company}`)) {
    return json(
      {
        status: "error",
        message: "You don't have permission to delete companies",
        error: { message: "Permission denied" },
      },
      {
        status: 403,
        headers,
      },
    );
  }

  const companyId = params.companyId;

  try {
    const { status, error } = await deleteCompany({
      supabase,
      id: companyId ?? "",
    });

    if (isGoodStatus(status)) {
      setCompanyId(undefined, true);
      headers.append("Set-Cookie", "company_id=; Path=/; Max-Age=0");

      return json(
        {
          status: "success",
          message: "Company deleted successfully",
        },
        {
          status: 200,
          headers,
        },
      );
    }

    return json(
      {
        status: "error",
        message: "Failed to delete company",
        error: { message: error?.toString() },
      },
      {
        status: 500,
        headers,
      },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      },
      {
        status: 500,
        headers,
      },
    );
  }
}

export default function DeleteCompany() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearAllCache();
        toast({
          title: "Success",
          description: actionData?.message || "Company deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Company delete failed",
          variant: "destructive",
        });
      }
      navigate(DEFAULT_ROUTE);
    }
  }, [actionData]);

  return null;
}
