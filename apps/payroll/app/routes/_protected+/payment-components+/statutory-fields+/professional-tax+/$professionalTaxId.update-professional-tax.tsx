import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { isGoodStatus, ProfessionalTaxSchema } from "@canny_ecosystem/utils";
import { getProfessionalTaxById } from "@canny_ecosystem/supabase/queries";
import { updateProfessionalTax } from "@canny_ecosystem/supabase/mutations";
import CreateProfessionalTax from "./create-professional-tax";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_PROFESSIONAL_TAX = "update-professional-tax";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const professionalTaxId = params.professionalTaxId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let professionalTaxData = null;

  if (professionalTaxId) {
    professionalTaxData = await getProfessionalTaxById({
      supabase,
      id: professionalTaxId,
    });
  }

  if (professionalTaxData?.error) {
    return json({
      status: "error",
      message: "Failed to get Professional Tax",
      error: professionalTaxData?.error,
      data: professionalTaxData?.data,
    });
  }

  return json({
    status: "success",
    message: "Professional Tax loaded successfully",
    data: professionalTaxData?.data,
    error: null,
  });
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
      { status: submission.status === "error" ? 400 : 200 },
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
  const { data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData.status === "success") {
      toast({
        title: "Success",
        description: actionData.message,
      });
    } else {
      toast({
        title: "Error",
        description: actionData.message,
      });
    }
    navigate("/payment-components/statutory-fields/professional-tax");
  });

  return <CreateProfessionalTax updateValues={data} />;
}
