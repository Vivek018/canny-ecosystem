import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  ReimbursementSchema,
  reimbursementStatusArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
  reimbursementTypeArray,
  z,
  getInitialValueFromZod,
  currentDate,
} from "@canny_ecosystem/utils";

import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";
import { createReimbursementsFromData } from "@canny_ecosystem/supabase/mutations";
import type { ReimbursementInsert } from "@canny_ecosystem/supabase/types";
import {
  getPayeesByCompanyId,
  getUsersByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { useEffect, useState } from "react";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE, recentlyAddedFilter } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

export const ADD_REIMBURSEMENTS_TAG = "Add_Reimbursement";
const BulkReimbursementSchema = z.object({
  singleValue: ReimbursementSchema.pick({
    submitted_date: true,
    status: true,
    user_id: true,
    company_id: true,
    type: true,
    note: true,
  }),
  reimbursements: z.array(
    ReimbursementSchema.pick({ amount: true, payee_id: true }),
  ),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.reimbursements}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: userData } = await getUsersByCompanyId({
    supabase,
    companyId,
  });

  const { data: payeeData } = await getPayeesByCompanyId({
    supabase,
    companyId,
  });

  const userOptions = userData?.map((userData) => ({
    label: userData.email?.toLowerCase() ?? "",
    value: userData.id,
  }));

  const payeeOptions = payeeData?.map((payee: any) => ({
    label: payee.payee_code as string,
    pseudoLabel: payee?.name as string,
    value: payee.id as string,
  }));

  return json({ userOptions, payeeOptions, companyId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: BulkReimbursementSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const data = submission.value.reimbursements.map((value) => ({
    ...submission.value.singleValue,
    ...value,
  }));

  const { status, error } = await createReimbursementsFromData({
    supabase,
    data: data as unknown as ReimbursementInsert[],
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Payee Reimbursement Create Successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Payee Reimbursement Create Failed",
    error,
  });
}

export default function AddBulkReimbursements() {
  const { userOptions, payeeOptions, companyId } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  const initialValues = getInitialValueFromZod(BulkReimbursementSchema);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.reimbursements);
        toast({
          title: "Success",
          description: actionData?.message || "Reimbursement Created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            actionData?.message ??
            "Reimbursement Create Failed",
          variant: "destructive",
        });
      }
      navigate(
        `/approvals/reimbursements?recently_added=${recentlyAddedFilter[0]}`,
      );
    }
  }, [actionData]);

  const REIMBURSEMENTS_TAG = ADD_REIMBURSEMENTS_TAG;

  const [form, fields] = useForm({
    id: REIMBURSEMENTS_TAG,
    constraint: getZodConstraint(BulkReimbursementSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: BulkReimbursementSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      singleValue: { ...initialValues.singleValue, company_id: companyId },
      reimbursements: initialValues.reimbursements,
    },
  });

  const singleField = fields.singleValue.getFieldset();

  const addReimbursement = () => {
    if (form.value?.reimbursements) {
      form.update({
        value: {
          ...form.value,
          reimbursements: [
            ...(form.value?.reimbursements as any),
            initialValues.reimbursements,
          ],
        },
      });
    } else {
      form.update({
        value: {
          ...form.value,
          reimbursements: [initialValues.reimbursements],
        },
      });
    }
  };

  const removeReimbursement = (index: number) => {
    if (form.value?.reimbursements) {
      const updated = [...form.value.reimbursements];
      updated.splice(index, 1);

      form.update({
        value: {
          ...form.value,
          reimbursements: updated,
        },
      });
    }
  };

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {`${replaceUnderscore(REIMBURSEMENTS_TAG)}s`}
              </CardTitle>
              <CardDescription className="lowercase">
                {`${replaceUnderscore(REIMBURSEMENTS_TAG)}s by filling this form`}
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col px-6">
              <input
                {...getInputProps(singleField.company_id, { type: "hidden" })}
              />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(singleField.submitted_date, {
                      type: "date",
                    }),
                    defaultValue: currentDate,
                  }}
                  labelProps={{
                    children: "Submitted Date",
                  }}
                  errors={singleField.submitted_date.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="w-full capitalize flex-1"
                  options={transformStringArrayIntoOptions(
                    reimbursementStatusArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(singleField.status, { type: "text" }),
                    defaultValue: "approved",
                  }}
                  placeholder={"Select Status"}
                  labelProps={{
                    children: "Status",
                  }}
                  errors={singleField.status.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <SearchableSelectField
                  key={resetKey + 2}
                  inputProps={{
                    ...getInputProps(singleField.type, { type: "text" }),
                    placeholder: "Select Reimbursement Type",
                    defaultValue: "expenses",
                  }}
                  options={transformStringArrayIntoOptions(
                    reimbursementTypeArray as unknown as string[],
                  )}
                  labelProps={{
                    children: "Type",
                  }}
                  errors={singleField.type.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(singleField.note, { type: "text" }),
                    placeholder: "Enter Note",
                  }}
                  labelProps={{
                    children: "Note",
                  }}
                  errors={singleField.note.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(singleField.user_id, { type: "text" }),
                    placeholder: "Select an authority that approved",
                  }}
                  className="lowercase"
                  options={userOptions ?? []}
                  labelProps={{
                    children: "Approved By",
                  }}
                  errors={singleField.user_id.errors}
                />
              </div>
            </div>
            <CardContent className="max-h-[190px] overflow-scroll mb-4 border mx-6 py-4 rounded-md">
              {fields?.reimbursements.getFieldList().map((fieldSet, index) => {
                const field = fieldSet.getFieldset();
                return (
                  <div
                    key={String(
                      fields?.reimbursements.key! + index + resetKey + 3,
                    )}
                    className="flex flex-row items-center justify-center gap-2 max-sm:grid max-sm:grid-cols-2"
                  >
                    <div className="mb-6 py-[7px] px-3 border shadow rounded text-sm">
                      {index + 1}
                    </div>
                    <SearchableSelectField
                      key={String(resetKey + index + 5)}
                      inputProps={{
                        ...getInputProps(field.payee_id, { type: "text" }),
                        placeholder: "Select Payee",
                      }}
                      options={payeeOptions ?? []}
                      errors={field.payee_id.errors}
                    />
                    <Field
                      inputProps={{
                        ...getInputProps(field.amount, { type: "number" }),
                        placeholder: "Enter Amount",
                      }}
                      errors={field.amount.errors}
                    />
                    <Button
                      type="button"
                      onClick={() => removeReimbursement(index)}
                      variant="destructive-outline"
                      className="mb-6 h-min py-2.5"
                    >
                      <Icon name="cross" />
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                onClick={addReimbursement}
                variant="primary-outline"
                size="full"
              >
                <Icon name="plus-circled" className="mr-2" /> Add Reimbursement
              </Button>
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
