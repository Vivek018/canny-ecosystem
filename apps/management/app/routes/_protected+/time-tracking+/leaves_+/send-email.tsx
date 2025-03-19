import { Resend } from "resend";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { useEffect } from "react";
import { useActionData, useNavigate } from "@remix-run/react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import LeavesEmail from "@/components/leaves/email/leaves-email";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { emailRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${emailRole}:${attribute.leaves}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const formData = await request.formData();
    const leavesCSVFile = formData.get("leavesCSVFile") as string;

    const leavesRegisterBase64 = formData.get("leavesRegisterBase64") as string;

    const leavesRegisterBuffer = Buffer.from(leavesRegisterBase64, "base64");

    const emails = formData.get("to") as unknown as string;
    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    const files = (formData.get("files") as string)
      ?.split(",")
      .map((f) => f.trim());

    if (!leavesCSVFile || emailList.length === 0) {
      return json(
        {
          status: "error",
          message: "An unexpected error occurred",
        },
        { status: 500 }
      );
    }

    const attachments = [];

    if (files?.includes("CSV-Data")) {
      attachments.push({
        filename: "Leaves.csv",
        content: Buffer.from(leavesCSVFile).toString("base64"),
        contentType: "text/csv",
      });
    }

    if (files?.includes("Leaves-Register")) {
      attachments.push({
        filename: "Leaves-Register.xlsx",
        content: leavesRegisterBuffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: emailList,
      subject: "Leaves Data",
      react: <LeavesEmail />,
      attachments,
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

export default function LvsEmail() {
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
          description: actionData?.error || "Email sending failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/leaves");
    }
  }, [actionData]);

  return null;
}
