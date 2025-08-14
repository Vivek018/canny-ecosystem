import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  IncidentSchema,
  getInitialValueFromZod,
  isGoodStatus,
  transformStringArrayIntoOptions,
  categoryOfIncidentArray,
  statusArray,
  replaceUnderscore,
  locationTypeArray,
  severityTypeArray,
  createRole,
  hasPermission,
} from "@canny_ecosystem/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { createIncident } from "@canny_ecosystem/supabase/mutations";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import type { IncidentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { UPDATE_INCIDENTS_TAG } from "./$incidentId.update-incident";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";

export const CREATE_INCIDENTS_TAG = "Create-Incident";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.incidents}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const employeeId = params.employeeId;

  return json({ employeeId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: IncidentSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }
    const data = submission.value;

    const { status, error } = await createIncident({
      supabase,
      data: data,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Incident registered successfully",
        error: null,
        returnTo: "/events/incidents",
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to register incident",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 }
    );
  }
}

export default function CreateIncident({
  updateValues,
}: {
  updateValues?: IncidentsDatabaseUpdate | null;
}) {
  const { employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearCacheEntry(cacheKeyPrefix.incidents);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      }
      if (actionData.status === "error") {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  const INCIDENT_TAG = updateValues
    ? UPDATE_INCIDENTS_TAG
    : CREATE_INCIDENTS_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(IncidentSchema);

  const [form, fields] = useForm({
    id: INCIDENT_TAG,
    constraint: getZodConstraint(IncidentSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: IncidentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className="flex flex-col w-full mx-auto lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>
                {updateValues ? "Update" : "Register"} Incident
              </CardTitle>
              <CardDescription>
                {updateValues ? "Update" : "Register"} the Incident here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.date, { type: "date" }),
                  placeholder: `Enter ${fields.date.name}`,
                }}
                labelProps={{
                  children: fields.date.name,
                }}
                errors={fields.date.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.title, { type: "text" }),
                  placeholder: `Enter ${fields.title.name}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: fields.title.name,
                }}
                errors={fields.title.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.description),
                  placeholder: `Enter ${fields.description.name}`,
                }}
                labelProps={{ children: fields.description.name }}
                errors={fields.description.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    locationTypeArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.location_type, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.location_type.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.location_type.name),
                  }}
                  errors={fields.location_type.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.location, { type: "text" }),
                    placeholder: `Enter ${fields.location.name}`,
                  }}
                  labelProps={{
                    children: fields.location.name,
                  }}
                  errors={fields.location.errors}
                />
              </div>
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  categoryOfIncidentArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.category, { type: "text" }),
                }}
                placeholder={`Select ${fields.category.name}`}
                labelProps={{
                  children: fields.category.name,
                }}
                errors={fields.category.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey + 2}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    severityTypeArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.severity, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.severity.name}`}
                  labelProps={{
                    children: fields.severity.name,
                  }}
                  errors={fields.severity.errors}
                />
                <SearchableSelectField
                  key={resetKey + 3}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    statusArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.status, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.status.name}`}
                  labelProps={{
                    children: fields.status.name,
                  }}
                  errors={fields.status.errors}
                />
              </div>
              <Field
                inputProps={{
                  ...getInputProps(fields.diagnosis, { type: "text" }),

                  placeholder:
                    replaceUnderscore(`Enter ${fields.diagnosis.name}`) ?? "",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.diagnosis.name),
                }}
                errors={fields.diagnosis.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.action_taken, { type: "text" }),

                  placeholder:
                    replaceUnderscore(`Enter ${fields.action_taken.name}`) ??
                    "",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.action_taken.name),
                }}
                errors={fields.action_taken.errors}
              />
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
