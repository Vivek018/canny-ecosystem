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
import { isGoodStatus, LabourWelfareFundSchema } from "@canny_ecosystem/utils";
import { getLabourWelfareFundById } from "@canny_ecosystem/supabase/queries";
import { updateLabourWelfareFund } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_LABOUR_WELFARE_FUND = "update-labour-welfare-fund";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  try {
    const labourWelfareFundId = params.labourWelfareFundId;
    const { supabase } = getSupabaseWithHeaders({ request });

    let labourWelfareFundData = null;

    if (labourWelfareFundId) {
      labourWelfareFundData = await getLabourWelfareFundById({
        supabase,
        id: labourWelfareFundId,
      });
    }

    if (labourWelfareFundData?.error) {
      return json({
        status: "error",
        message: "Failed to load data",
        data: labourWelfareFundData?.data,
        error: labourWelfareFundData.error,
      });
    }

    return json({
      status: "success",
      message: "Labour Welfare Fund loaded successfully",
      data: labourWelfareFundData?.data,
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to load data",
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
      schema: LabourWelfareFundSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
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
    return json({
      status: "error",
      message: "Failed to update Labour Welfare Fund",
      error,
    }, { status: 500 });
  }
}

export default function UpdateLocation() {
  const { data, status, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
      navigate("/payment-components/statutory-fields/labour-welfare-fund");
    }

    if (!actionData) return;

    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message || "Labour Welfare Fund updated",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Labour Welfare Fund update failed",
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/labour-welfare-fund");
  }, [actionData]);

  return <CreateLabourWelfareFund updateValues={data} />;
}
