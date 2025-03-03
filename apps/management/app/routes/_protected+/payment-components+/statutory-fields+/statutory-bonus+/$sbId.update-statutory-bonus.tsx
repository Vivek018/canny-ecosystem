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
  isGoodStatus,
  StatutoryBonusSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getStatutoryBonusById } from "@canny_ecosystem/supabase/queries";
import { updateStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateStatutoryBonus from "./create-statutory-bonus";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_STATUTORY_BONUS = "update-statutory-bonus";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const sbId = params.sbId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  if (
    !hasPermission(
      `${user?.role!}`,
      `${updateRole}:${attribute.statutoryFieldsStatutoryBonus}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let sbData = null;
    let sbError = null;

    if (sbId) {
      ({ data: sbData, error: sbError } = await getStatutoryBonusById({
        supabase,
        id: sbId,
      }));

      if (sbError) throw sbError;

      return json({
        sbData,
        companyId,
        error: null,
      });
    }
  } catch (error) {
    return json(
      {
        sbData: null,
        companyId: null,
        error,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: StatutoryBonusSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateStatutoryBonus({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Statutory Bonus updated successfully",
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Failed to update Statutory Bonus",
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

export default function UpdateStatutoryBonus() {
  const { sbData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.statutory_bonus);
      toast({
        title: "Success",
        description: actionData?.message || "Statutory Bonus updated",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.message || "Failed to update Statutory Bonus",
        variant: "destructive",
      });
    }

    navigate("/payment-components/statutory-fields/statutory-bonus", {
      replace: true,
    });
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load Statutory Bonus" />
    );

  return <CreateStatutoryBonus updateValues={sbData} />;
}
