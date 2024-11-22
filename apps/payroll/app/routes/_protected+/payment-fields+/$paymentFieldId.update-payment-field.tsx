import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreatePaymentField from "./create-payment-field";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  isGoodStatus,
  PaymentFieldSchema,
  paymentTypeArray,
} from "@canny_ecosystem/utils";
import { getPaymentFieldById } from "@canny_ecosystem/supabase/queries";
import { updatePaymentField } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_PAYMENT_FIELD = "update-payment-field";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paymentFieldId = params.paymentFieldId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  let paymentFieldData = null;

  if (paymentFieldId) {
    paymentFieldData = await getPaymentFieldById({
      supabase,
      id: paymentFieldId,
      companyId,
    });
  }

  if (paymentFieldData?.error) throw paymentFieldData.error;

  return json({ data: paymentFieldData?.data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: PaymentFieldSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updatePaymentField({
    supabase,
    data: {
      ...submission.value,
      amount:
        submission.value.payment_type === paymentTypeArray[1]
          ? null
          : submission.value.amount,
    },
  });

  if (isGoodStatus(status))
    return safeRedirect("/payment-fields", { status: 303 });

  return json({ status, error });
}

export default function UpdatePaymentField() {
  const { data } = useLoaderData<typeof loader>();
  return <CreatePaymentField updateValues={data} />;
}
