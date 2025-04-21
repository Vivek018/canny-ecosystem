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
  ProfessionalTaxSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getProfessionalTaxById } from "@canny_ecosystem/supabase/queries";
import { updateProfessionalTax } from "@canny_ecosystem/supabase/mutations";
import CreateProfessionalTax from "./create-professional-tax";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute, statesAndUTs } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_PROFESSIONAL_TAX = "update-professional-tax";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.statutoryFieldsPf}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const professionalTaxId = params.professionalTaxId;

    let professionalTaxData = null;
    let professionalTaxError = null;

    if (professionalTaxId) {
      ({ data: professionalTaxData, error: professionalTaxError } =
        await getProfessionalTaxById({
          supabase,
          id: professionalTaxId,
        }));

      if (professionalTaxError) throw professionalTaxError;

      return json({
        professionalTaxData,
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        error,
        professionalTaxData: null,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: ProfessionalTaxSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateProfessionalTax({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Professional Tax updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Failed to update Professional Tax",
    error,
  });
}

export default function UpdateProfessionalTax() {
  const { professionalTaxData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const matchedState = statesAndUTs.find(
    (state) =>
      state.label.toLowerCase() === professionalTaxData?.state.toLowerCase()
  );

  if (matchedState && professionalTaxData) {
    professionalTaxData.state = matchedState.value;
  }


  useEffect(() => {
    if (!actionData) return;
    if (actionData.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.professional_tax);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.message,
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/professional-tax");
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load Professional Taxes"
      />
    );

  return <CreateProfessionalTax updateValues={professionalTaxData} />;
}
