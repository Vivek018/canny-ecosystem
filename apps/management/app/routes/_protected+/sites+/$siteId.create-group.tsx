import {
  hasPermission,
  isGoodStatus,
  GroupsSchema,
  replaceUnderscore,
  createRole,
} from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
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
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { GroupDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { createGroup } from "@canny_ecosystem/supabase/mutations";
import { UPDATE_GROUP_TAG } from "./$groupId.update-group";

export const CREATE_GROUP_TAG = "create-group";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.groups}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const siteId = params.siteId;

    return json({
      status: "success",
      message: "Group form loaded",
      siteId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: GroupsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createGroup({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Group created successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to create group",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function CreateGroup({
  updateValues,
}: {
  updateValues?: GroupDatabaseUpdate | null;
}) {
  const { siteId } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const GROUP_TAG = updateValues ? UPDATE_GROUP_TAG : CREATE_GROUP_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(GroupsSchema);

  const [form, fields] = useForm({
    id: GROUP_TAG,
    constraint: getZodConstraint(GroupsSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GroupsSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      site_id: initialValues.site_id ?? siteId,
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.groups);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.error ?? "Groups creation failed",
        variant: "destructive",
      });
    }
    navigate(-1, { replace: true });
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(GROUP_TAG)}
              </CardTitle>
              <CardDescription>
                {GROUP_TAG.split("-")[0]} group for the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input {...getInputProps(fields.site_id, { type: "hidden" })} />

              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
            </CardContent>
            <FormButtons form={form} isSingle={true} />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
