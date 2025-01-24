import { FormButtons } from "@/components/form/form-buttons";
import { safeRedirect } from "@/utils/server/http.server";
import { createUserById } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { UserDatabaseUpdate } from "@canny_ecosystem/supabase/types";
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
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  updateRole,
  userRoles,
  UserSchema,
} from "@canny_ecosystem/utils";

import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { UPDATE_USER_TAG } from "./$userId.update-user";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { DEFAULT_ROUTE } from "@/constant";

export const CREATE_USER_TAG = "Create User";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${updateRole}:setting_users`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  return { companyId };
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: UserSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { error, status } = await createUserById({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/users");
  }
  return json({ status, error });
}

export default function CreateUser({
  updateValues,
}: {
  updateValues?: UserDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const USER_TAG = updateValues ? UPDATE_USER_TAG : CREATE_USER_TAG;
  const initialValues = updateValues ?? getInitialValueFromZod(UserSchema);

  const [form, fields] = useForm({
    id: USER_TAG,
    constraint: getZodConstraint(UserSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>{USER_TAG}</CardTitle>
              <CardDescription className="lowercase">
                You can {USER_TAG} by filling this form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mb-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.first_name, { type: "text" }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(
                      fields.first_name.name
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.first_name.name),
                  }}
                  errors={fields.first_name.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.last_name, { type: "text" }),

                    placeholder: `Enter ${replaceUnderscore(
                      fields.last_name.name
                    )}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.last_name.name),
                  }}
                  errors={fields.last_name.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.email, { type: "text" }),

                    placeholder: `Enter ${replaceUnderscore(
                      fields.email.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.email.name),
                  }}
                  errors={fields.email.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.mobile_number, { type: "text" }),

                    placeholder: `Enter ${replaceUnderscore(
                      fields.mobile_number.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.mobile_number.name),
                  }}
                  errors={fields.mobile_number.errors}
                />
              </div>
              <SearchableSelectField
                options={transformStringArrayIntoOptions(
                  userRoles as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.role, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(fields.role.name)}`}
                labelProps={{
                  children: replaceUnderscore(fields.role.name),
                }}
                errors={fields.role.errors}
              />
              <CheckboxField
                className="mt-8"
                buttonProps={getInputProps(fields.is_active, {
                  type: "checkbox",
                })}
                labelProps={{
                  children: "Mark this as Active",
                }}
              />
            </CardContent>
            <FormButtons form={form} isSingle={true} />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
