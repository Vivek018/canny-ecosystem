import { DeleteChat } from "@/components/chat/delete-chat";
import { Results } from "@/components/chat/result";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { runGeneratedSQLQuery } from "@/utils/ai/chat";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import { deleteChatById } from "@canny_ecosystem/supabase/mutations";
import { getChatById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardHeader } from "@canny_ecosystem/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  deleteRole,
  formatDateTime,
  hasPermission,
  isGoodStatus,
  readRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import {
  type ActionFunctionArgs,
  defer,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { useEffect } from "react";
import Papa from "papaparse";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const chatId = params.chatId;
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.chat}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const { data: dbData } = await getChatById({ supabase, id: chatId ?? "" });

    const prompt = dbData?.prompt ?? "";
    const query = dbData?.query ?? "";
    const config = JSON.parse(dbData?.config ?? "") ?? null;

    const { data, error: sqlError } = await runGeneratedSQLQuery({
      originalQuery: query,
    });

    return defer({ prompt, data, config, error: sqlError ?? null });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({ prompt: null, data: null, config: null, error: error });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.save_chat_id}${args.params.chatId}`,
    args,
  );
}
clientLoader.hydrate = true;

export async function action({ request, params }: ActionFunctionArgs) {
  const chatId = params.chatId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  const returnTo = "/chat/save-chat";

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.chat}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { error, status } = await deleteChatById({
      supabase,
      id: chatId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Chat deleted successfully",
        chatId,
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete chat",
        chatId,
        returnTo,
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      chatId,
      returnTo,
      error,
    });
  }
}

export default function Chatbox() {
  const { prompt, data, config, error } = useLoaderData<typeof loader>();
  const columns = data?.[0] ? Object.keys(data[0]) : [];

  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const { role } = useUser();
  const { chatId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.save_chat_id + chatId);
        toast({
          title: "Success",
          description: actionData?.message || "Chat deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ?? actionData?.message ?? "Chat delete failed",
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo ?? "/chat/save-chat");
    }
  }, [actionData]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description:
          error ??
          "Failed to generate data from your prompt. Please try again.",
        variant: "destructive",
      });
    }
  }, [error]);

  const toBeExportedData = data?.map((element) => {
    const exportedData: {
      [key: (typeof columns)[number]]: string | number | boolean;
    } = {};
    for (const key of columns) {
      exportedData[key] = element[key as keyof typeof columns] as
        | string
        | boolean
        | number;
    }
    return exportedData;
  });

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(toBeExportedData as any);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute("download", `${prompt} - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <Card
      className={cn(
        "w-full h-full flex flex-col overflow-hidden",
        !data?.length && "hidden",
      )}
    >
      <Form method="POST">
        <CardHeader className="py-2 flex flex-row items-center justify-between gap-4">
          <p className="w-full truncate tracking-wide">{prompt}</p>
          <div className="h-11 flex-1 flex flex-row gap-2 items-center justify-end pb-2">
            <Button variant={"secondary"} onClick={handleExport}>
              <Icon name="download" size="sm" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "h-9 px-3.5 rounded-sm bg-secondary text-secondary-foreground grid place-items-center",
                  !hasPermission(role, `${deleteRole}:${attribute.chat}`) &&
                    "hidden",
                )}
              >
                <Icon name="dots-vertical" size="sm" />
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={10} align="end">
                <DropdownMenuGroup>
                  <DeleteChat chatId={chatId ?? ""} />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Form>
      <div className="flex-1 overflow-auto">
        <Results results={data ?? []} chartConfig={config} columns={columns} />
      </div>
    </Card>
  );
}
