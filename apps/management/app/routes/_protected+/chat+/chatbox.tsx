import { cacheKeyPrefix, chatCategories, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { createChat } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, Outlet, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${createRole}:${attribute.chat}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const formData = await request.formData();
    const prompt = formData.get("prompt")?.toString();
    const query = formData.get("query")?.toString();
    const config = formData.get("config")?.toString();
    const returnTo = formData.get("returnTo")?.toString() ?? "/chat/chatbox";

    if (user?.id) {
      const data = {
        prompt: prompt ?? "",
        query: query ?? "",
        config: config,
        user_id: user?.id
      }

      const { error } = await createChat({ supabase, data });

      if (error) {
        return json({
          status: "error",
          message: (error as any).message.toString(),
          returnTo,
        });
      }

      return json({
        status: "success",
        message: "Chat Saved Successfully",
        returnTo,
      });
    }
    return json({
      status: "error",
      message: "No user found",
      returnTo,
    });
  } catch (error) {
    return json({
      status: "error",
      message: error,
      returnTo: "/chat/chatbox",
    });
  }
}

export default function Chatbox() {

  const actionData = useActionData<typeof action>()

  const { toast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.chatbox);
        clearCacheEntry(cacheKeyPrefix.save_chat);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo ?? "/chat/chatbox");
    }
  }, [actionData]);

  return (
    <section className="flex w-full flex-1 overflow-hidden">
      <SecondarySidebar
        items={chatCategories}
        className="flex-shrink-0"
        navLinkClassName="w-40 tracking-wider"
      />
      <div className="flex flex-col flex-1 p-4 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </section>
  )
}
