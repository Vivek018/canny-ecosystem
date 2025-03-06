import { CompanyDocumentsSchema, SIZE_1MB, isGoodStatus, replaceUnderscore } from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { FormButtons } from "@/components/form/form-buttons";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { updateCompanyDocument, uploadCompanyDocument } from "@canny_ecosystem/supabase/media";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@canny_ecosystem/ui/dialog";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getCompanyDocumentById } from "@canny_ecosystem/supabase/queries";

export async function loader({ request }: LoaderFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId") ?? "";
    const { data } = await getCompanyDocumentById({ supabase, id: documentId });
    return { companyId, documentName: data?.name };
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId") ?? "";

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

        // edit document case
        if (documentId) {
            const { status, error } = await updateCompanyDocument({
                supabase,
                file: submission.value.document_file as File,
                companyId,
                documentName: submission.value.document_name
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
        }

        // add document case
        const { status, error } = await uploadCompanyDocument({
            supabase,
            file: submission.value.document_file as File,
            companyId,
            documentName: submission.value.document_name
        });

        if (isGoodStatus(status)) {
            return json({
                status: "success",
                message: "Document uploaded successfully",
                error: null,
                returnTo: "/settings/documents",
            });
        }
        return json(
            {
                status: "error",
                message: "Document upload failed",
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

export default function AddDocument() {
    const { documentName } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [_resetKey, setResetKey] = useState(Date.now());
    const { toast } = useToast();
    const navigate = useNavigate();

    const [form, fields] = useForm({
        id: "add-document",
        constraint: getZodConstraint(CompanyDocumentsSchema),
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: CompanyDocumentsSchema });
        },
        shouldValidate: "onInput",
        shouldRevalidate: "onInput",
        defaultValue: { document_name: documentName },
    });

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

    return (
        <Dialog open={true} onOpenChange={() => navigate("/settings/documents")}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{documentName ? "Update" : "Add"} Document</DialogTitle>
                </DialogHeader>
                <FormProvider context={form.context}>
                    <Form method="POST" {...getFormProps(form)} className="flex flex-col" encType="multipart/form-data">
                        <Field
                            inputProps={{
                                ...getInputProps(fields.document_name, { type: "text" }),
                                placeholder: `Enter ${replaceUnderscore(fields.document_name.name)}`,
                                readOnly: !!documentName
                            }}
                            labelProps={{ children: replaceUnderscore(fields.document_name.name) }}
                            errors={fields.document_name.errors}
                        />
                        <Field
                            inputProps={{
                                ...getInputProps(fields.document_file, { type: "file" }),
                                placeholder: `Enter ${replaceUnderscore(fields.document_file.name)}`,
                            }}
                            labelProps={{ children: replaceUnderscore(fields.document_file.name) }}
                            errors={fields.document_file.errors}
                        />
                    </Form>
                </FormProvider>
                <FormButtons className="mr-[-24px] pb-0" setResetKey={setResetKey} form={form} isSingle={true} />
            </DialogContent>
        </Dialog>
    );
}
