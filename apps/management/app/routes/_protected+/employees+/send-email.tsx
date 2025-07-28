import { Resend } from "resend";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import EmployeeEmail from "@/components/employees/email/employee-email";
import { useEffect } from "react";
import { useActionData, useNavigate } from "@remix-run/react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { emailRole, hasPermission } from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${emailRole}:${attribute.employees}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const formData = await request.formData();
    const employeeFile = formData.get("employeeFile") as string;
    const emails = formData.get("to") as unknown as string;
    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    if (!employeeFile || emailList.length === 0) {
      return json(
        {
          status: "error",
          message: "An unexpected error occurred",
        },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: emailList,
      subject: "Employee Data",
      react: <EmployeeEmail />,
      attachments: [
        {
          filename: "Employees.csv",
          content: Buffer.from(employeeFile).toString("base64"),
          contentType: "text/csv",
        },
      ],
    });

    if (error) {
      return json({
        status: "failed",
        message: "Failed to send Email",
        error: null,
      });
    }

    return json(
      {
        status: "success",
        message: "Email sent succesfully",
        error: error,
      },
      { status: 500 }
    );
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

export default function EmpEmail() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Email sent succesfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: (actionData?.error as any)?.message || "Email sending failed",
          variant: "destructive",
        });
      }
      navigate("/employees");
    }
  }, [actionData]);

  return null;
}
