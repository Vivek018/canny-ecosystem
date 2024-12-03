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
import { isGoodStatus, RelationshipSchema } from "@canny_ecosystem/utils";
import {
  getCompanies,
  getRelationshipById,
} from "@canny_ecosystem/supabase/queries";
import { updateRelationship } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_RELATIONSHIP = "update-relationship";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const relationshipId = params.relationshipId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let relationshipData = null;

    if (relationshipId) {
      relationshipData = await getRelationshipById({
        supabase,
        id: relationshipId,
        companyId,
      });
    }

    if (relationshipData?.error) {
      return json(
        {
          status: "error",
          message: "Failed to get relationship",
          error: relationshipData.error,
          data: null,
          companyOptions: null,
        },
        {
          status: 500,
        },
      );
    }

    const parentCompanyId = relationshipData?.data?.parent_company_id;
    const { data: companies, error } = await getCompanies({ supabase });

    if (error) {
      return json(
        {
          status: "error",
          message: "Failed to get companies",
          error,
          data: null,
          companyOptions: null,
        },
        { status: 500 },
      );
    }

    if (!companies) {
      return json(
        {
          status: "error",
          message: "No companies found",
          error,
          data: null,
          companyOptions: null,
        },
        { status: 500 },
      );
    }

    const companyOptions = companies
      .filter((company) => company.id !== parentCompanyId)
      .map((company) => ({ label: company.name, value: company.id }));

    return json({
      status: "success",
      message: "Relationship and Company Option data found.",
      data: relationshipData?.data,
      companyOptions,
      error: null,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred.",
        error,
        data: null,
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
  const { data, companyOptions, status, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }

    if (!actionData) return;
    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Relationship update failed",
        variant: "destructive",
      });
    }

    navigate("/settings/relationships", {
      replace: true,
    });
  }, [actionData]);

  return (
    <CreateRelationship
      updateValues={data}
      companyOptionsFromUpdate={companyOptions}
    />
  );
}
