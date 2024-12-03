import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeBankDetailsById } from "@canny_ecosystem/supabase/queries";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { updateEmployeeBankDetails } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeBankDetailsSchema,
} from "@canny_ecosystem/utils";
import { CreateEmployeeBankDetails } from "@/components/employees/form/create-employee-bank-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_BANK_DETAILS = "update-employee-bank-details";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let data: any;
    let error: any;

    if (employeeId) {
      ({ data, error } = await getEmployeeBankDetailsById({
        supabase,
        id: employeeId,
      }));
    }

    if (!data)
      return json({
        status: "error",
        message: "Failed to get employee bank details",
        data,
        error,
        employeeId,
      });

    return json({
      status: "success",
      message: "Employee bank details found",
      data,
      error: null,
      employeeId,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      data: null,
      employeeId,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeBankDetailsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateEmployeeBankDetails({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee bank details updated successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee bank details update failed",
    error,
  });
}

export default function UpdateEmployeeBankDetails() {
  const { data, status, message, employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeBankDetailsSchema;

  const [form, fields] = useForm({
    id: UPDATE_BANK_DETAILS,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: data,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: message || "Failed to get employee bank details",
        variant: "destructive",
      });
      navigate(`/employees/${employeeId}/work-portfolio`);
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee bank details updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee bank details update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/work-portfolio`);
    }
  }, [actionData]);

  return (
    <section className="md:px-20 lg:px-28 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CreateEmployeeBankDetails
              key={resetKey}
              fields={fields as any}
              isUpdate={true}
            />
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
