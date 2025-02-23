import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { addHolidaysFromData } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { HolidaysDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { CheckboxField, Field } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  createRole,
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  HolidaysSchema,
  replaceUnderscore,
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
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import { UPDATE_HOLIDAYS_TAG } from "./$holidayId+/update-holiday";

const ADD_HOLIDAYS_TAG = "add-holidays";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.holidays}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  return json({ companyId });
}
export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.holidays}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: HolidaysSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const holidaysData = submission.value;

  const { status, error } = await addHolidaysFromData({
    supabase,
    data: holidaysData,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Holidays added successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Holidays add failed",
    error,
  });
}

export default function AddHolidays({
  updatableData,
}: {
  updatableData?: HolidaysDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.holidays}`);
        toast({
          title: "Success",
          description: actionData?.message || "Holiday updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Holiday update failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/holidays");
    }
  }, [actionData]);

  const HOLIDAYS_TAG = updatableData ? UPDATE_HOLIDAYS_TAG : ADD_HOLIDAYS_TAG;

  const initialValues = updatableData ?? getInitialValueFromZod(HolidaysSchema);

  const [form, fields] = useForm({
    id: HOLIDAYS_TAG,
    constraint: getZodConstraint(HolidaysSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: HolidaysSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  const onChange = () => {
    navigate(-1);
  };
  return (
    <Dialog open={true} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{updatableData ? "Update" : "Add"} Holiday</DialogTitle>
        </DialogHeader>
        <FormProvider context={form.context}>
          <Form method="POST" {...getFormProps(form)}>
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10">
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: "Name",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.start_date, { type: "date" }),
                  placeholder: "Start Date",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.start_date.name),
                }}
                errors={fields.start_date.errors}
              />
            </div>
            <div className="grid grid-cols-2 place-content-center justify-between gap-x-8">
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.no_of_days, { type: "number" }),
                  placeholder: "No of Days",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.no_of_days.name),
                }}
                errors={fields.no_of_days.errors}
              />
            </div>
            <CheckboxField
              buttonProps={getInputProps(fields.is_mandatory, {
                type: "checkbox",
              })}
              labelProps={{
                htmlFor: fields.is_mandatory.id,
                children: "Is mandatory?",
              }}
            />
          </Form>
        </FormProvider>

        <FormButtons className="mr-[-29px] pb-0" form={form} isSingle={true} />
      </DialogContent>
    </Dialog>
  );
}
