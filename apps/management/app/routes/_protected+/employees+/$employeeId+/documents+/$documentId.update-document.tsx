import {
  EmployeeDocumentsSchema,
  SIZE_10MB,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { useEffect } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { updateEmployeeDocument } from "@canny_ecosystem/supabase/media";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { getEmployeeDocumentById } from "@canny_ecosystem/supabase/queries";
import AddDocument from "./add-document";
import { parseWithZod } from "@conform-to/zod";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import type { EmployeeDocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";

export const UPDATE_EMPLOYEE_DOCUMENT = "update-employee-document";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId ?? "";
  const documentId = params.documentId ?? "";
  const { supabase } = getSupabaseWithHeaders({ request });
  const { data } = await getEmployeeDocumentById({ supabase, id: documentId });
  return { employeeId, data };
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId ?? "";
  const documentId = params.documentId ?? "";

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data } = await getEmployeeDocumentById({ supabase, id: documentId });

  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB })
    );
    const submission = parseWithZod(formData, {
      schema: EmployeeDocumentsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateEmployeeDocument({
      supabase,
      file: submission.value.url as File,
      employeeId,
      documentType: submission.value.document_type,
      oldDocumentType: data?.document_type!,
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Document updated successfully",
        error: null,
        returnTo: `/employees/${employeeId}/documents`,
      });
    }
    return json(
      {
        status: "error",
        message: "Document update failed",
        error,
        returnTo: `/employees/${employeeId}/documents`,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: `/employees/${employeeId}/documents`,
      },
      { status: 500 }
    );
  }
}

export default function UpdateDocument() {
  const { data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_documents}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  return <AddDocument updatedValues={data as EmployeeDocumentsDatabaseRow} />;
}
