import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import {
  employeeRoleCookie,
  getEmployeeIdFromCookie,
} from "@/utils/server/user.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { getEmployeeByAnyIdentifier } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Field } from "@canny_ecosystem/ui/forms";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { EmployeeLoginSchema } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const { user } = await getSessionUser({ request });
  const employeeId = await getEmployeeIdFromCookie(request);

  if (user || employeeId) {
    return safeRedirect(DEFAULT_ROUTE, { status: 303 });
  }

  return json({ error });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { supabase, headers } = getSupabaseWithHeaders({
    request,
  });

  const submission = parseWithZod(formData, { schema: EmployeeLoginSchema });

  if (formData.get("_action") === "employee_login") {
    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const employeeData = submission.value;

    const { data, error } = await getEmployeeByAnyIdentifier({
      supabase,
      identifier: employeeData?.identifier ?? "",
    });

    if (error || !data) {
      return json(
        { error: error || "No employee data found", employeeId: null },
        { status: 400 }
      );
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("employeeId", JSON.stringify(data?.id));
    }

    return safeRedirect(`/employees/${data.id}/overview`, {
      headers: {
        "Set-Cookie": await employeeRoleCookie.serialize({
          role: "employee",
          employeeId: data.id,
        }),
      },
    });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Login - OAuth error:", error);
    return json({ error: error.message }, { status: 500 });
  }

  if (data.url) {
    return redirect(data.url, { headers });
  }

  return json({ error: "Failed to get login URL" }, { status: 500 });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const error =
    (actionData && "error" in actionData ? actionData.error : null) ||
    loaderData.error;

  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(EmployeeLoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeLoginSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error) ?? "Failed to load employee details",
        variant: "destructive",
      });
    }
  }, [error, actionData]);

  return (
    <section className="flex min-h-screen justify-center items-center overflow-hidden p-6 mt-1 md:p-0">
      <div className="relative z-20 m-auto flex w-full max-w-[450px] flex-col">
        <div className="flex w-full flex-col justify-center relative">
          <div className="pb-4 bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text mx-auto">
            <h1 className="font-extrabold uppercase pb-1 tracking-widest text-3xl md:text-4xl max-sm:text-center">
              CANNY ECOSYSTEM
            </h1>
          </div>

          <p className="font-medium text-center pb-2 text-[#878787]">
            If you are an{" "}
            <strong className="text-foreground/80">Employee</strong>, please
            enter your Employee Code, Mobile Number, or Email directly. If you
            are a{" "}
            <strong className="text-foreground/80">Incharge/Supervisor </strong>
            , please use the Login button.
          </p>

          <div className="flex flex-col items-center my-4">
            <div className="pointer-events-auto flex flex-col mx-auto w-full sm:w-80">
              <FormProvider context={form.context}>
                {/* Employee Login Form */}
                <Form method="POST" {...getFormProps(form)}>
                  <div className="flex items-start gap-2">
                    <Field
                      className="-mt-1.5"
                      inputProps={{
                        ...getInputProps(fields.identifier, {
                          type: "text",
                        }),
                        placeholder: "Emp Code, Mobile Number or Email",
                      }}
                      errors={fields.identifier.errors}
                    />
                    <Button
                      form={form.id}
                      disabled={!form.valid}
                      variant="default"
                      size="icon"
                      type="submit"
                      name="_action"
                      value="employee_login"
                      className="w-11 rounded-md"
                    >
                      <Icon name="chevron-right" />
                    </Button>
                  </div>
                </Form>
              </FormProvider>
            </div>

            <div className="w-full sm:w-80 flex flex-col items-center my-2">
              <div className="w-full h-0.5 bg-border" />
              <span className="mx-auto -mt-3.5 px-4 bg-background">or</span>
            </div>

            <div className="max-sm:w-full pointer-events-auto my-5 flex flex-col">
              <Form method="POST">
                <Button
                  type="submit"
                  name="_action"
                  value="supervisor_login"
                  className="cursor-pointer w-full sm:w-80"
                >
                  Login
                </Button>
              </Form>
            </div>
          </div>

          <p className="text-xs text-[#878787]">
            By clicking continue, you acknowledge that you have read and agree
            to Canny's{" "}
            <Link to="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/policy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
