import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import {
  getPaymentTemplateAssignmentById,
  getPaymentTemplatesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  EmployeeLinkSchema,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect } from "react";
import CreateEmployeeLinkTemplate from "../create-link-template";

export const UPDATE_LINK_TEMPLATE = "update-link-template";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.employeeProjectAssignment}`
    )
  )
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const templateAssignmentId = params.templateAssignmentId;

  const { data, error } = await getPaymentTemplatesByCompanyId({
    supabase,
    companyId,
  });

  let paymentTemplateOptions = null;
  if (data && !error) {
    paymentTemplateOptions =
      data?.map((template) => ({
        label: template.name,
        value: template.id ?? "",
      })) ?? [];
  }

  const { data: paymentTemplateAssigmentData } =
    await getPaymentTemplateAssignmentById({
      supabase,
      id: templateAssignmentId ?? "",
    });

  return json({
    paymentTemplateAssigmentData,
    paymentTemplateOptions,
    error,
  });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const templateAssignmentId = params.employeeId as string;
  const employeeId = params.employeeId as string;
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: EmployeeLinkSchema });

  if (submission.status !== "success")
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );

  try {
    const { error } = await updatePaymentTemplateAssignment({
      supabase,
      data: submission.value,
      id: submission.value.id ?? templateAssignmentId,
    });

    if (error) throw error;
    return json({
      status: "success",
      message: "Successfully updated payment template link",
      returnTo: `/employees/${employeeId}/payments`,
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to update payment template link.",
      returnTo: `/employees/${employeeId}/payments`,
      error,
    });
  }
}

export default function UpdateEmployeeLinkTemplate() {
  const { paymentTemplateAssigmentData, paymentTemplateOptions } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_payments}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "error",
          description: actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo);
    }
  }, [actionData]);

  return (
    <CreateEmployeeLinkTemplate
      updateValues={paymentTemplateAssigmentData}
      updatePaymentTemplateOptions={paymentTemplateOptions}
    />
  );
}
