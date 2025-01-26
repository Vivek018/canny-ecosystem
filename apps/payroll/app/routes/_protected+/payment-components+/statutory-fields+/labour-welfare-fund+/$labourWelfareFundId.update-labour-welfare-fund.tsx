import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLabourWelfareFund from "./create-labour-welfare-fund";
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
import { hasPermission, isGoodStatus, LabourWelfareFundSchema, updateRole } from "@canny_ecosystem/utils";
import { getLabourWelfareFundById } from "@canny_ecosystem/supabase/queries";
import { updateLabourWelfareFund } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import type { LabourWelfareFundDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";

export const UPDATE_LABOUR_WELFARE_FUND = "update-labour-welfare-fund";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const labourWelfareFundId = params.labourWelfareFundId;
  const { supabase,headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.statutoryFieldsLwf}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let labourWelfareFundPromise = null;

    if (labourWelfareFundId) {
      labourWelfareFundPromise = getLabourWelfareFundById({
        supabase,
        id: labourWelfareFundId,
      });

      return defer({
        labourWelfareFundPromise,
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        error,
        labourWelfareFundPromise: null,
      },
      { status: 500 }
    );
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
        { status: submission.status === "error" ? 400 : 200 }
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
    return json(
      {
        status: "error",
        message: "Failed to update Labour Welfare Fund",
        error,
      },
      { status: 500 }
    );
  }
}

export default function UpdateLabourWelfareFund() {
  const { labourWelfareFundPromise, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
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

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load Labour Welfare Fund"
      />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={labourWelfareFundPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return (
              <ErrorBoundary message="Failed to load Labour Welfare Fund" />
            );
          return (
            <UpdateLabourWelfareFundWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateLabourWelfareFundWrapper({
  data,
  error,
}: {
  data: LabourWelfareFundDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load Labour Welfare Fund",
        variant: "destructive",
      });
    }
  }, [error]);

  return <CreateLabourWelfareFund updateValues={data} />;
}
