import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { isGoodStatus, StatutoryBonusSchema } from "@canny_ecosystem/utils";
import { getStatutoryBonusById } from "@canny_ecosystem/supabase/queries";
import { updateStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateStatutoryBonus from "./create-statutory-bonus";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_STATUTORY_BONUS = "update-statutory-bonus";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const sbId = params.sbId;
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let sbData = null;

    if (sbId) {
      sbData = await getStatutoryBonusById({
        supabase,
        id: sbId,
      });
    }

    if (sbData?.error) {
      return json({
        status: "error",
        message: "Failed to load data",
        error: sbData?.error,
        data: null,
      });
    }

    return json({
      status: "success",
      message: "Statutory Bonus loaded successfully",
      data: sbData?.data,
      companyId,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      data: null,
      error,
    }, { status: 500 });
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
      bypassAuth: true,
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
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    }, { status: 500 });
  }
}

export default function UpdateStatutoryBonus() {
  const { data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
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

  return <CreateStatutoryBonus updateValues={data} />;
}
