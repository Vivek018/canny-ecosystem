import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { addLeaveTypeFromData } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LeaveTypeDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  createRole,
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  leaveTypeArray,
  LeaveTypeSchema,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { UPDATE_LEAVETYPE_TAG } from "./$leaveTypeId+/update-leave-type";
import { useCompanyId } from "@/utils/company";

const ADD_LEAVETYPE_TAG = "add-leave-type";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.leaves}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return {};
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.leaves}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: LeaveTypeSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await addLeaveTypeFromData({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Leave type added successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Leave Type add failed",
    error,
  });
}

export default function AddLeaveType({
  updatableData,
}: {
  updatableData?: LeaveTypeDatabaseUpdate | null;
}) {
  const actionData = useActionData<typeof action>();

  const { companyId } = useCompanyId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resetKey, setResetKey] = useState(Date.now());

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.leaves);
        toast({
          title: "Success",
          description: actionData?.message || "Leave Type created",
          variant: "success",
        });
      }
      if (actionData?.status === "error") {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Leave Type update failed",
          variant: "destructive",
        });
      }

      navigate("/time-tracking/leaves", { replace: true });
    }
  }, [actionData]);

  const LEAVETYPE_TAG = updatableData
    ? UPDATE_LEAVETYPE_TAG
    : ADD_LEAVETYPE_TAG;

  const initialValues =
    updatableData ?? getInitialValueFromZod(LeaveTypeSchema);

  const [form, fields] = useForm({
    id: LEAVETYPE_TAG,
    constraint: getZodConstraint(LeaveTypeSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LeaveTypeSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  const onChange = () => {
    navigate("/time-tracking/leaves");
  };

  return (
    <Dialog open={true} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {updatableData ? "Update" : "Add"} Leave Type
          </DialogTitle>
        </DialogHeader>
        <FormProvider context={form.context}>
          <Form method="POST" {...getFormProps(form)} className="mt-2">
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />

            <SearchableSelectField
              key={resetKey}
              className="capitalize"
              options={transformStringArrayIntoOptions(
                leaveTypeArray as unknown as string[]
              )}
              inputProps={{
                ...getInputProps(fields.leave_type, { type: "text" }),
              }}
              placeholder={"Select Type"}
              labelProps={{
                children: "Leave Type",
              }}
              errors={fields.leave_type.errors}
            />

            <Field
              className="w-full"
              inputProps={{
                ...getInputProps(fields.leaves_per_year, { type: "number" }),
                placeholder: "No Of Hours",
              }}
              labelProps={{
                children: replaceUnderscore(fields.leaves_per_year.name),
              }}
              errors={fields.leaves_per_year.errors}
            />
          </Form>
        </FormProvider>

        <FormButtons
          className="mr-[-29px] pb-0"
          form={form}
          setResetKey={setResetKey}
          isSingle={true}
        />
      </DialogContent>
    </Dialog>
  );
}
