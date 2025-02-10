import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  EmployeeLetterSchema,
  EmployeeLetterTypesArray,
  getInitialValueFromZod,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";

import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  CheckboxField,
  Field,
  MarkdownField,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";
import { createEmployeeLetter } from "@canny_ecosystem/supabase/mutations";
import type { ReimbursementsUpdate } from "@canny_ecosystem/supabase/types";
import { useEffect, useState } from "react";
import { cacheKeyPrefix } from "@/constant";
import { UPDATE_LETTER_TAG } from "./$letterId_+/update-letter";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";

export const CREATE_LETTER_TAG = "create-letter";

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: EmployeeLetterSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }
    const employeeLetterData = submission.value;

    const { status, error } = await createEmployeeLetter({
      supabase,
      letterData: employeeLetterData as any,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Employee Letter created",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Employee Letter creation failed",
        error,
      },
      { status: 500 },
    );
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

export default function CreateEmployeeLetter({
  updateValues,
}: {
  reimbursementId?: string;
  updateValues?: ReimbursementsUpdate | null;
  userOptionsFromUpdate?: any;
}) {
  const [resetKey, setResetKey] = useState(Date.now());
  const actionData = useActionData<typeof action>();
  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  const LETTERS_TAG = updateValues ? UPDATE_LETTER_TAG : CREATE_LETTER_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeLetterSchema);

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
      toast({
        title: "Success",
        description: "Employee created successfully",
        variant: "success",
      });
      navigate(`/employees/${employeeId}/letters`);
    } else {
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    }
  }, [actionData]);

  const [form, fields] = useForm({
    id: LETTERS_TAG,
    constraint: getZodConstraint(EmployeeLetterSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeLetterSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(LETTERS_TAG)}
              </CardTitle>
              <CardDescription>
                You can {LETTERS_TAG.split("-")[0]} letters by filling this form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-5">
                <SearchableSelectField
                  key={resetKey}
                  className="w-full capitalize flex-1"
                  options={transformStringArrayIntoOptions(
                    EmployeeLetterTypesArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.letter_type, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.letter_type.name,
                  )}`}
                  labelProps={{
                    children: "Letter Type",
                  }}
                  errors={fields.letter_type.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.date, {
                      type: "date",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.date.name),
                  }}
                  errors={fields.date.errors}
                />
              </div>

              <div className="grid grid-cols-1 place-content-center justify-between gap-x-8 mt-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.subject, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.subject.name,
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.subject.name),
                  }}
                  errors={fields.subject.errors}
                />
                <MarkdownField
                  textareaProps={{
                    ...getTextareaProps(fields.content),
                    placeholder: "Write your letter content here...",
                  }}
                  labelProps={{
                    children: "Content",
                  }}
                  errorClassName={"min-h-min pt-0 pb-0"}
                  errors={fields.content.errors}
                  className={cn(!isDocument && "hidden")}
                />
              </div>

              <div className="grid grid-cols-4 place-content-center justify-between gap-x-8 px-2">
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_letter_head, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Letter Head",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_client_address, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Client Address",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_employee_address, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Employee Address",
                  }}
                />
                <CheckboxField
                  className="mt-8"
                  buttonProps={getInputProps(fields.include_signatuory, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include Signatuory",
                  }}
                />
              </div>
            </CardContent>

            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
