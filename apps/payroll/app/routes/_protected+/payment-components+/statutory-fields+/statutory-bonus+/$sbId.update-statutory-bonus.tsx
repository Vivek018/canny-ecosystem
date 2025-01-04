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
import { isGoodStatus, StatutoryBonusSchema } from "@canny_ecosystem/utils";
import { getStatutoryBonusById } from "@canny_ecosystem/supabase/queries";
import { updateStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateStatutoryBonus from "./create-statutory-bonus";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import type { StatutoryBonusDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";

export const UPDATE_STATUTORY_BONUS = "update-statutory-bonus";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const sbId = params.sbId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let sbPromise = null;

    if (sbId) {
      sbPromise = getStatutoryBonusById({
        supabase,
        id: sbId,
      });
    }

    return defer({
      sbPromise,
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        sbPromise: null,
        companyId: null,
        error,
      },
      { status: 500 },
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
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateStatutoryBonus() {
  const { sbPromise, error } = useLoaderData<typeof loader>();
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

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load Statutory Bonus" />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={sbPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load Statutory Bonus" />;
          return (
            <UpdateStatutoryBonusWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateStatutoryBonusWrapper({
  data,
  error,
}: {
  data: StatutoryBonusDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load Statutory Bonus",
        variant: "destructive",
      });
  }, [error]);

  return <CreateStatutoryBonus updateValues={data} />;
}
