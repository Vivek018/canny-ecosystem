import {
  EmployeeDocumentsSchema,
  SIZE_1MB,
  employeeDocuments,
  getInitialValueFromZod,
  isGoodStatus,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { FormButtons } from "@/components/form/form-buttons";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { uploadEmployeeDocument } from "@canny_ecosystem/supabase/media";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { UPDATE_EMPLOYEE_DOCUMENT } from "./$documentId.update-document";
import type { EmployeeDocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";

export const CREATE_EMPLOYEE_DOCUMENT = "create-employee-document";

export async function loader({ params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  return { employeeId };
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId ?? "";
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_1MB })
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

    const { status, error } = await uploadEmployeeDocument({
      supabase,
      file: submission.value.document_file as File,
      employeeId,
      documentType: submission.value
        .document_type as (typeof employeeDocuments)[number],
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

export default function AddDocument({
  updatedValues,
}: {
  updatedValues: EmployeeDocumentsDatabaseRow;
}) {
  const { employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const EMPLOYEE_DOCUMENT_TAG = updatedValues
    ? UPDATE_EMPLOYEE_DOCUMENT
    : CREATE_EMPLOYEE_DOCUMENT;

  const initialValues =
    updatedValues ?? getInitialValueFromZod(EmployeeDocumentsSchema);

  const [resetKey, setResetKey] = useState(Date.now());
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    id: EMPLOYEE_DOCUMENT_TAG,
    constraint: getZodConstraint(EmployeeDocumentsSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeDocumentsSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      existing_document_type: initialValues.document_type,
    },
  });

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
          description: actionData.error,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  return (
    <Dialog
      open={true}
      onOpenChange={() => navigate(`/employees/${employeeId}/documents`)}
    >
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
              {...getInputProps(fields.existing_document_type, {
                type: "hidden",
              })}
            />
            <SearchableSelectField
              key={resetKey}
              className="capitalize"
              options={transformStringArrayIntoOptions(
                employeeDocuments as unknown as string[]
              )}
              inputProps={{
                ...getInputProps(fields.document_type, { type: "text" }),
              }}
              placeholder={`Select ${replaceUnderscore(
                fields.document_type.name
              )}`}
              labelProps={{
                children: replaceUnderscore(fields.document_type.name),
              }}
              errors={fields.document_type.errors}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.document_file, { type: "file" }),
                placeholder: `Enter ${replaceUnderscore(
                  fields.document_file.name
                )}`,
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
