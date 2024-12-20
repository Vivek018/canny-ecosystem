import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
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
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import type { ProfessionalTaxDatabaseUpdate } from "@canny_ecosystem/supabase/types";

export const UPDATE_PROFESSIONAL_TAX = "update-professional-tax";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const professionalTaxId = params.professionalTaxId;
    const { supabase } = getSupabaseWithHeaders({ request });

    let professionalTaxPromise = null;

    if (professionalTaxId) {
      professionalTaxPromise = getProfessionalTaxById({
        supabase,
        id: professionalTaxId,
      });
    }

    return defer({
      professionalTaxPromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        professionalTaxPromise: null,
      },
      { status: 500 },
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
  const { professionalTaxPromise, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData.status === "success") {
      toast({
        title: "Success",
        description: actionData.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.message,
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={professionalTaxPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return (
              <ErrorBoundary message="Failed to load Professional Taxes" />
            );
          return (
            <UpdateProfessionalTaxWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateProfessionalTaxWrapper({
  data,
  error,
}: {
  data: ProfessionalTaxDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load Professional Taxes",
        variant: "destructive",
      });
    }
  }, [error]);

  return <CreateProfessionalTax updateValues={data} />;
}
