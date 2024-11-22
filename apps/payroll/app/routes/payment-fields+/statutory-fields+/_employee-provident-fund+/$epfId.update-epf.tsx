import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  EmployeeProvidentFundSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeProvidentFundById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeProvidentFund from "./create-employee-provident-fund";


export async function loader({ request, params }: LoaderFunctionArgs) {
  const epfId = params.epfId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  let epfData = null;

  if (epfId) {
    epfData = await getEmployeeProvidentFundById({
      supabase,
      id: epfId,
    });
  }

  console.log("=-", epfData)

  if (epfData?.error) {
    throw epfData.error;
  }

  return json({ data: epfData?.data, companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeProvidentFundSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateEmployeeProvidentFund({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/payment-fields/statutory-fields/employee-provident-fund", {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeProvidentFund() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateEmployeeProvidentFund updateValues={data} />;
}
