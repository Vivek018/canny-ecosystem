import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { createEmployeeStatutoryDetails } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeStatutorySchema,
  hasPermission,
  createRole,
  getInitialValueFromZod,
} from "@canny_ecosystem/utils";
import { CreateEmployeeStatutoryDetails } from "@/components/employees/form/create-employee-statutory-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const ADD_EMPLOYEE_STATUTORY = "add-employee-statutory";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.employeeStatutory}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return {};
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const employeeId = params.employeeId;
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: EmployeeStatutorySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createEmployeeStatutoryDetails({
      supabase,
      data: {
        ...submission.value,
        employee_id: submission.value.employee_id ?? employeeId ?? "",
      },
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Statutory created successfully",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Statutory create failed", error },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "Statutory create failed",
      error,
    });
  }
}

export default function CreateStatutoryDetailsRoute() {
  const { employeeId } = useParams();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const currentSchema = EmployeeStatutorySchema;
  const initialData = getInitialValueFromZod(currentSchema);

  const [form, fields] = useForm({
    id: ADD_EMPLOYEE_STATUTORY,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: { ...initialData, employee_id: employeeId },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_overview}${employeeId}`
        );
        toast({
          title: "Success",
          description:
            actionData?.message || "Employee statutory details created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            "Employee statutory details create failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/overview`);
    }
  }, [actionData]);

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form
          method='POST'
          encType='multipart/form-data'
          {...getFormProps(form)}
          className='flex flex-col'
        >
          <Card>
            <CreateEmployeeStatutoryDetails
              key={resetKey}
              fields={fields as any}
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
