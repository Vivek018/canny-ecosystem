import { EmployeeDocumentsSchema, employeeDocuments, isGoodStatus, replaceUnderscore, transformStringArrayIntoOptions } from "@canny_ecosystem/utils";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { FormButtons } from "@/components/form/form-buttons";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { uploadEmployeeDocument } from "../../../../../../../../packages/supabase/src/media/employee";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const employeeId = params.employeeId;
    const url = new URL(request.url);
    const documentName = url.searchParams.get("documentName");
    return { employeeId, documentName };
}

export async function action({
    request,
    params,
}: ActionFunctionArgs): Promise<Response> {
    const employeeId = params.employeeId ?? "";
    const { supabase } = getSupabaseWithHeaders({ request });

    try {
        const formData = await request.formData();
        const document_name = formData.get("document_name");
        const document_file = formData.get("document_file");

        const submission = parseWithZod(formData, { schema: EmployeeDocumentsSchema });

        if (submission.status !== "success") {
            return json(
                { result: submission.reply() },
                { status: submission.status === "error" ? 400 : 200 },
            );
        }

        const { status, error } = await uploadEmployeeDocument({
            supabase,
            file: document_file,
            employeeId,
            documentName: document_name as string
        });

        if (isGoodStatus(status)) {
            return json({
                status: "success",
                message: "Document uploaded successfully",
                error: null,
                returnTo: `/employees/${employeeId}/documents`,
            });
        }
        return json(
            {
                status: "error",
                message: "Document upload failed",
                error,
                returnTo: `/employees/${employeeId}/documents`,
            },
            { status: 500 },
        );
    } catch (error) {
        return json(
            {
                status: "error",
                message: "An unexpected error occurred",
                error,
                returnTo: `/employees/${employeeId}/documents`,
            },
            { status: 500 },
        );
    }
}

export default function EditDocument() {
    const { employeeId, documentName } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [resetKey, setResetKey] = useState(Date.now());
    const { toast } = useToast();
    const navigate = useNavigate();

    const [form, fields] = useForm({
        id: "add-document",
        constraint: getZodConstraint(EmployeeDocumentsSchema),
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: EmployeeDocumentsSchema });
        },
        shouldValidate: "onInput",
        shouldRevalidate: "onInput",
        defaultValue: { document_name: documentName }
    });

    useEffect(() => {
        if (actionData) {
            if (actionData?.status === "success") {
                clearExactCacheEntry(`${cacheKeyPrefix.employee_documents}${employeeId}`);
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
        <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
            <FormProvider context={form.context}>
                <Form method="POST" {...getFormProps(form)} className="flex flex-col" encType="multipart/form-data">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl capitalize">
                                Update Document
                            </CardTitle>
                            <CardDescription>
                                Update document of employee that will be central in all of canny apps
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SearchableSelectField
                                key={resetKey}
                                className="capitalize"
                                options={transformStringArrayIntoOptions(employeeDocuments as unknown as string[])}
                                inputProps={{ ...getInputProps(fields.document_name, { type: "text" }), disabled: true }}
                                placeholder={`Select ${replaceUnderscore(fields.document_name.name)}`}
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
                        </CardContent>
                        <FormButtons form={form} setResetKey={setResetKey} isSingle={true} />
                    </Card>
                </Form>
            </FormProvider>
        </section>
    );
}
