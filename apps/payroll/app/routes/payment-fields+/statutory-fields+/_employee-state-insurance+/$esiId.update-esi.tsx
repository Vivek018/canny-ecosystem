import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  EmployeeStateInsuranceSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeStateInsuranceById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeStateInsurance from "./create-employee-state-insurance";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const esiId = params.esiId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  let esiData = null;

  if (esiId) {
    esiData = await getEmployeeStateInsuranceById({
      supabase,
      id: esiId,
    });
  }

  if (esiData?.error) {
    throw esiData.error;
  }

  return json({ data: esiData?.data, companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeStateInsuranceSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateEmployeeStateInsurance({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/payment-fields/statutory-fields/employee-state-insurance", {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeProvidentFund() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateEmployeeStateInsurance updateValues={data} />;
}
