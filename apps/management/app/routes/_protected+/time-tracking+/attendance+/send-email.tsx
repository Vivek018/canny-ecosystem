import { Resend } from "resend";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { useEffect } from "react";
import { useActionData, useNavigate } from "@remix-run/react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import AttendanceEmail from "@/components/attendance/email/attendance-email";
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

  if (!hasPermission(user?.role!, `${emailRole}:${attribute.attendance}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const formData = await request.formData();
    const attendanceCSVFile = formData.get("attendanceCSVFile") as string;

    const attendanceRegisterBase64 = formData.get(
      "attendanceRegisterBase64"
    ) as string;

    const attendanceRegisterBuffer = Buffer.from(
      attendanceRegisterBase64,
      "base64"
    );

    const attendanceHourlyRegisterBase64 = formData.get(
      "attendanceHourlyRegisterBase64"
    ) as string;
    const attendanceHourlyRegisterBuffer = Buffer.from(
      attendanceHourlyRegisterBase64,
      "base64"
    );

    const emails = formData.get("to") as unknown as string;
    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    const files = (formData.get("files") as string)
      ?.split(",")
      .map((f) => f.trim());

    if (!attendanceCSVFile || emailList.length === 0) {
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
        filename: "Attendance.csv",
        content: Buffer.from(attendanceCSVFile).toString("base64"),
        contentType: "text/csv",
      });
    }

    if (files?.includes("Monthly Register")) {
      attachments.push({
        filename: "Attendance-Monthly-Register.xlsx",
        content: attendanceRegisterBuffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    if (files?.includes("Hourly Register")) {
      attachments.push({
        filename: "Attendance-Hourly-Register.xlsx",
        content: attendanceHourlyRegisterBuffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }
    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: emailList,
      subject: "Attendance Data",
      react: <AttendanceEmail />,
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
        message: "Email sent successfully",
      },
      { status: 200 }
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

export default function AttdEmail() {
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
      navigate("/time-tracking/attendance");
    }
  }, [actionData]);

  return null;
}
