import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLabourWelfareFund from "./create-labour-welfare-fund";
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
  LabourWelfareFundSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getLabourWelfareFundById } from "@canny_ecosystem/supabase/queries";
import { updateLabourWelfareFund } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute, statesAndUTs } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_LABOUR_WELFARE_FUND = "update-labour-welfare-fund";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const labourWelfareFundId = params.labourWelfareFundId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.statutoryFieldsLwf}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let lwfData = null;
    let lwfError = null;

    if (labourWelfareFundId) {
      ({ data: lwfData, error: lwfError } = await getLabourWelfareFundById({
        supabase,
        id: labourWelfareFundId,
      }));

      if (lwfError) throw lwfError;

      return json({
        lwfData,
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        error,
        lwfData: null,
      },
      { status: 500 }
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
      schema: LabourWelfareFundSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateLabourWelfareFund({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Labour Welfare Fund updated successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to update Labour Welfare Fund",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update Labour Welfare Fund",
        error,
      },
      { status: 500 }
    );
  }
}

export default function UpdateLabourWelfareFund() {
  const { lwfData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const matchedState = statesAndUTs.find(
    (state) => state.label.toLowerCase() === lwfData?.state.toLowerCase()
  );

  if (matchedState && lwfData) {
    lwfData.state = matchedState.value;
  }
  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.labour_welfare_fund);
      toast({
        title: "Success",
        description: actionData?.message || "Labour Welfare Fund updated",
        variant: "success",
      });
      navigate("/payment-components/statutory-fields/labour-welfare-fund");
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Labour Welfare Fund update failed",
        variant: "destructive",
      });
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load Labour Welfare Fund"
      />
    );

  return <CreateLabourWelfareFund updateValues={lwfData} />;
}
