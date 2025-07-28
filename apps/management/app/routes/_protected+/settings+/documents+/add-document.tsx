import {
  CompanyDocumentsSchema,
  SIZE_10MB,
  getInitialValueFromZod,
  isGoodStatus,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { FormButtons } from "@/components/form/form-buttons";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { uploadCompanyDocument } from "@canny_ecosystem/supabase/media";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { UPDATE_COMPANY_DOCUMENT } from "./$documentId.update-document";
import type { DocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";

export const CREATE_COMPANY_DOCUMENT = "create-company-document";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB }),
    );
    const submission = parseWithZod(formData, {
      schema: CompanyDocumentsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await uploadCompanyDocument({
      supabase,
      file: submission.value.document_file as File,
      companyId,
      documentName: submission.value.name,
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

export default function AddDocument({
  updatedValues,
}: {
  updatedValues?: DocumentsDatabaseRow;
}) {
  const actionData = useActionData<typeof action>();
  const COMPANY_DOCUMENT_TAG = updatedValues
    ? UPDATE_COMPANY_DOCUMENT
    : CREATE_COMPANY_DOCUMENT;

  const initialValues =
    updatedValues ?? getInitialValueFromZod(CompanyDocumentsSchema);

  const [_resetKey, setResetKey] = useState(Date.now());
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    id: COMPANY_DOCUMENT_TAG,
    constraint: getZodConstraint(CompanyDocumentsSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CompanyDocumentsSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      existing_document_name: initialValues.name,
    },
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
          description: actionData?.error?.message,
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
          <DialogTitle>{updatedValues ? "Update" : "Add"} Document</DialogTitle>
        </DialogHeader>
        <FormProvider context={form.context}>
          <Form
            method="POST"
            {...getFormProps(form)}
            className="flex flex-col"
            encType="multipart/form-data"
          >
            <input
              {...getInputProps(fields.existing_document_name, {
                type: "hidden",
              })}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.name, { type: "text" }),
                placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
              }}
              labelProps={{ children: replaceUnderscore(fields.name.name) }}
              errors={fields.name.errors}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.document_file, { type: "file" }),
                placeholder: `Enter ${replaceUnderscore(fields.document_file.name)}`,
              }}
              labelProps={{
                children: replaceUnderscore(fields.document_file.name),
              }}
              errors={fields.document_file.errors}
            />
          </Form>
        </FormProvider>
        <FormButtons
          className="mr-[-24px] pb-0"
          setResetKey={setResetKey}
          form={form}
          isSingle={true}
        />
      </DialogContent>
    </Dialog>
  );
}
