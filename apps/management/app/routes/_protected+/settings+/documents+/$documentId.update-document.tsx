import { CompanyDocumentsSchema, SIZE_1MB, hasPermission, isGoodStatus, updateRole } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { updateCompanyDocument } from "@canny_ecosystem/supabase/media";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getCompanyDocumentById } from "@canny_ecosystem/supabase/queries";
import AddDocument from "./add-document";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";
import type { DocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";

export const UPDATE_COMPANY_DOCUMENT = "update-company-document";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const documentId = params.documentId ?? "";
    const { supabase, headers } = getSupabaseWithHeaders({ request });

    const { user } = await getUserCookieOrFetchUser(request, supabase);
    if (!hasPermission(user?.role!, `${updateRole}:${attribute.companyDocuments}`)) {
        return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const { data } = await getCompanyDocumentById({ supabase, id: documentId });
    return { data };
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    try {
        const formData = await parseMultipartFormData(
            request,
            createMemoryUploadHandler({ maxPartSize: SIZE_1MB }),
        );
        const submission = parseWithZod(formData, { schema: CompanyDocumentsSchema });

        if (submission.status !== "success") {
            return json(
                { result: submission.reply() },
                { status: submission.status === "error" ? 400 : 200 },
            );
        }

        const { status, error } = await updateCompanyDocument({
            supabase,
            file: submission.value.document_file as File,
            companyId,
            documentName: submission.value.name,
            existingDocumentName:submission.value.existing_document_name ?? ""
        });
        if (isGoodStatus(status)) {
            return json({
                status: "success",
                message: "Document updated successfully",
                error: null,
                returnTo: "/settings/documents",
            });
        }
        return json(
            {
                status: "error",
                message: "Document update failed",
                error,
                returnTo: "/settings/documents",
            },
            { status: 500 },
        );
    } catch (error) {
        return json(
            {
                status: "error",
                message: "An unexpected error occurred",
                error,
                returnTo: "/settings/documents",
            },
            { status: 500 },
        );
    }
}

export default function UpdateDocument() {
    const { data } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (actionData) {
            if (actionData?.status === "success") {
                clearExactCacheEntry(`${cacheKeyPrefix.company_document}`);
                toast({
                    title: "Success",
                    description: actionData.message,
                    variant: "success",
                });
            } else {
                toast({
                    title: "Error",
                    description: actionData.error,
                    variant: "destructive",
                });
            }
            navigate(actionData.returnTo);
        }
    }, [actionData]);

    return <AddDocument updatedValues={data as DocumentsDatabaseRow} />
}
