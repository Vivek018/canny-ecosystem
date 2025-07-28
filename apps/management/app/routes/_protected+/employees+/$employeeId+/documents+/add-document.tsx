import {
  EmployeeDocumentsSchema,
  SIZE_10MB,
  employeeDocumentTypeArray,
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
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { FormButtons } from "@/components/form/form-buttons";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { uploadEmployeeDocument } from "@canny_ecosystem/supabase/media";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { UPDATE_EMPLOYEE_DOCUMENT } from "./$documentId.update-document";
import type { EmployeeDocumentsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";

export const CREATE_EMPLOYEE_DOCUMENT = "create-employee-document";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId ?? "";
  const { supabase } = getSupabaseWithHeaders({ request });

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

    const { status, error } = await uploadEmployeeDocument({
      supabase,
      file: submission.value.url as File,
      employeeId,
      documentType: submission.value.document_type,
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
  const actionData = useActionData<typeof action>();
  const EMPLOYEE_DOCUMENT_TAG = updatedValues
    ? UPDATE_EMPLOYEE_DOCUMENT
    : CREATE_EMPLOYEE_DOCUMENT;

  const { employeeId } = useParams();
  const initialValues =
    updatedValues ?? getInitialValueFromZod(EmployeeDocumentsSchema);

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
      url: undefined,
    },
  });

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (dialogRef.current?.contains(target)) return;

      if (
        target.closest("[cmdk-root]") ||
        target.closest("[role='listbox']") ||
        target.closest(".popover-content")
      ) {
        return;
      }

      navigate(`/employees/${employeeId}/documents`);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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
      navigate(actionData.returnTo, { replace: true });
    }
  }, [actionData]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div
        ref={dialogRef}
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">
            {updatedValues ? "Update" : "Add"} Document
          </h1>
          <button
            type="button"
            onClick={() => navigate(`/employees/${employeeId}/documents`)}
          >
            <Icon name="cross" size="sm" />
          </button>
        </div>
        <FormProvider context={form.context}>
          <Form
            method="POST"
            {...getFormProps(form)}
            className="flex flex-col space-y-4"
            encType="multipart/form-data"
          >
            <SearchableSelectField
              className="capitalize"
              options={transformStringArrayIntoOptions(
                employeeDocumentTypeArray as unknown as string[]
              )}
              inputProps={{
                ...getInputProps(fields.document_type, { type: "text" }),
              }}
              placeholder={`Select ${replaceUnderscore(fields.document_type.name)}`}
              labelProps={{
                children: replaceUnderscore(fields.document_type.name),
              }}
              errors={fields.document_type.errors}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.url, { type: "file" }),
                placeholder: `Enter ${replaceUnderscore(fields.url.name)}`,
              }}
              labelProps={{
                children: replaceUnderscore(fields.url.name),
              }}
              errors={fields.url.errors}
            />
            <FormButtons
              className="self-end -mr-6 pb-0"
              form={form}
              isSingle={true}
            />
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}
