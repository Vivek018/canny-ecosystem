import { ErrorBoundary } from "@/components/error-boundary";
import { PaymentTemplateComponentsCard } from "@/components/payment-templates/payment-template-components-card";
import { getPaymentTemplateComponentsByTemplateId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const templateId = params.paymentTemplateId;
    const { data, error } = await getPaymentTemplateComponentsByTemplateId({
      supabase,
      templateId: templateId ?? "",
    });

    return json({
      data,
      error,
    });
  } catch (error) {
    return json(
      {
        data: null,
        error,
      },
      { status: 500 },
    );
  }
}

export default function PaymentTemplateId() {
  const { data, error } = useLoaderData<typeof loader>();

  if (error || !data?.length) {
    return (
      <ErrorBoundary
        error={error ?? "No Data"}
        message="Failed to load payment template components"
      />
    );
  }

  return <PaymentTemplateComponentsCard paymentTemplateComponents={data} />;
}
