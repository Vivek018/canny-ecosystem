import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateRelationship from "./create-relationship";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  RelationshipSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getCompanies,
  getRelationshipById,
} from "@canny_ecosystem/supabase/queries";
import { updateRelationship } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import type {
  CompanyDatabaseRow,
  RelationshipDatabaseUpdate,
} from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_RELATIONSHIP = "update-relationship";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const relationshipId = params.relationshipId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.settingRelationships}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let relationshipData = null;
    let relationshipError = null;

    const { data: companiesData, error } = await getCompanies({ supabase });

    if (error) throw error;

    if (relationshipId) {
      ({ data: relationshipData, error: relationshipError } =
        await getRelationshipById({
          supabase,
          id: relationshipId,
          companyId,
        }));

      if (relationshipError) throw relationshipError;

      return json({
        relationshipData,
        companiesData,
        error: null,
      });
    }

    throw new Error("No relationshipId provided");
  } catch (error) {
    return json(
      {
        error,
        relationshipData: null,
        companiesData: null,
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
      schema: RelationshipSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateRelationship({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Relationship updated",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to update relationship",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update relationship",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateRelationship() {
  const { relationshipData, companiesData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.relationships);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error ||
          actionData?.error?.message ||
          "Relationship update failed",
        variant: "destructive",
      });
    }

    navigate("/settings/relationships", {
      replace: true,
    });
  }, [actionData]);

  const parentCompanyId = relationshipData?.parent_company_id;
  const companyOptions = companiesData
    ?.filter((company) => company.id !== parentCompanyId)
    .map((company) => ({ label: company.name, value: company.id }));

  return (
    <CreateRelationship
      updateValues={relationshipData}
      companyOptionsFromUpdate={companyOptions}
    />
  );
}

export function UpdateRelationshipWrapper({
  data,
  error,
  companiesData,
}: {
  data: RelationshipDatabaseUpdate | null;
  error: Error | null | { message: string };
  companiesData: Pick<CompanyDatabaseRow, "id" | "name">[] | null;
}) {
  const parentCompanyId = data?.parent_company_id;
  const companyOptions = companiesData
    ?.filter((company) => company.id !== parentCompanyId)
    .map((company) => ({ label: company.name, value: company.id }));

  if (error) {
    return (
      <ErrorBoundary error={error} message="Failed to load relationship" />
    );
  }

  return (
    <CreateRelationship
      updateValues={data}
      companyOptionsFromUpdate={companyOptions}
    />
  );
}
