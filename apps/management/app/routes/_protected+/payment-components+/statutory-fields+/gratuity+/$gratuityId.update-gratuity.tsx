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
  GratuitySchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getGratuityById } from "@canny_ecosystem/supabase/queries";
import { updateGratuity } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import CreateGratuity from "./create-gratuity";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_GRATUITY = "update-gratuity";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const gratuityId = params.gratuityId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.statutoryFieldsGraduity}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let gratuityData = null;
    let gratuityError = null;

    if (gratuityId) {
      ({ data: gratuityData, error: gratuityError } = await getGratuityById({
        supabase,
        id: gratuityId,
      }));
    } else {
      throw new Error("Gratuity ID not provided");
    }

    if (gratuityError) throw gratuityError;

    return json({
      error: null,
      gratuityData,
      companyId,
    });
  } catch (error) {
    return json(
      {
        error,
        gratuityData: null,
        companyId: null,
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
      schema: GratuitySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateGratuity({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Gratuity updated successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Gratuity update failed",
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

export default function UpdateEmployeeStateInsurance() {
  const { gratuityData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.gratuity);
      toast({
        title: "Success",
        description: actionData?.message || "Gratuity updated",
        variant: "success",
      });
      navigate("/payment-components/statutory-fields/gratuity");
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error ||
          actionData?.error?.message ||
          "Gratuity update failed",
        variant: "destructive",
      });
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load gratuity" />;

  return <CreateGratuity updateValues={gratuityData} />;
}
