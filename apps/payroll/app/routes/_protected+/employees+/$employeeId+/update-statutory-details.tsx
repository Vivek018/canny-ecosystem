import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeStatutoryDetailsById } from "@canny_ecosystem/supabase/queries";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { updateEmployeeStatutoryDetails } from "@canny_ecosystem/supabase/mutations";
import { isGoodStatus, EmployeeStatutorySchema } from "@canny_ecosystem/utils";
import { CreateEmployeeStatutoryDetails } from "@/components/employees/form/create-employee-statutory-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_EMPLOYEE_STATUTORY = "update-employee-statutory";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let data = null;
    let error = null;

    if (employeeId) {
      ({ data, error } = await getEmployeeStatutoryDetailsById({
        supabase,
        id: employeeId,
      }));
    }

    if (error)
      return json({
        status: "error",
        message: "Failed to load statutory",
        data,
        error,
        employeeId,
      });

    return json({
      status: "success",
      message: "Statutory found",
      data,
      error: null,
      employeeId,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to load statutory",
      error,
      data: null,
      employeeId,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: EmployeeStatutorySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeStatutoryDetails({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Statutory updated successfully",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Statutory update failed", error },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "Statutory update failed",
      error,
    });
  }
}

export default function UpdateStatutoryDetails() {
  const { data, status, error, employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeStatutorySchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE_STATUTORY,
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
        description: error.message || "Failed to get statutory details",
        variant: "destructive",
      });
      navigate(`/employees/${data?.id}/work-portfolio`);
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Employee update failed",
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
            <CreateEmployeeStatutoryDetails
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
