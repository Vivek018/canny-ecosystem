import { Results } from "@/components/ai/result";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { fetchAllSingleSQLQuery, generateQuery, runGeneratedSQLQuery } from "@/utils/ai/chat";
import { generateChartConfig } from "@/utils/ai/chat/chart";
import { useSearchState } from "@/utils/ai/chat/hooks/search-state";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import { createChat } from "@canny_ecosystem/supabase/mutations";
import { getChatByPromptAndUserId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent, CardHeader } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission, isGoodStatus, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, defer, json, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

const suggestedPrompt = [
  "Employees working for more than 5 years",
  "Show invoices due for payment this week",
  "Employees started working after 2023",
  "List project sites with no of employees of age above 50",
  "Employees with missing bank details",
  "List pending reimbursements that need approval",
  "Generate basic salary report for April 2025",
  "Generate PF report for April 2025",
  // "List Employee that will get eligible for gratuity this year",
  // "Calculate Gratuity Amount for eligible employees this month",
  // Generate similar reports for Leave Encashments,
  "List projects sites with no of employees",
  "Payroll with amount more than 7 lakhs in last 2 years",
  "List top 20 employees with the highest net salaries in April 2025",
  "List employees with upcoming birthdays this month",
  // "List project sites with highest absent days last month",
  // "List employees with highest absent days last month with contact numbers",
  "Show me ongoing cases",
  "List pending invoices",
  "Generate payroll summary for this year",
  "Employees with upcoming leaves",
  "Show incidents with critical severity this year",
  // "Generate monthly % present days per site",
  "List employees with work anniversaries this month",
  "List employees with the most overtime hours last month",
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.chat}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const url = new URL(request.url);
    const tablesData = JSON.stringify((await fetchAllSingleSQLQuery())?.data);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const searchParams = new URLSearchParams(url.searchParams);
    const prompt = searchParams.get("prompt") ?? "";
    let dataExistsInDb = false;

    if (!prompt) {
      return defer({ query: null, data: [], config: null, error: null, dataExistsInDb });
    }

    const promptWithCompany = `${prompt} where company is company_id=${companyId}`

    if (prompt && user?.id) {
      const { data, status } = await getChatByPromptAndUserId({ supabase, userId: user?.id ?? "", prompt: prompt });

      if (data && isGoodStatus(status)) {
        dataExistsInDb = true;
      }
    }

    const { query, error } = await generateQuery({ input: promptWithCompany, tablesData, companyId });

    if (query === undefined || error) {
      return defer({ query: null, data: null, config: null, error: error ?? "Error generating query", dataExistsInDb });
    }

    const { data, error: sqlError } = await runGeneratedSQLQuery({ originalQuery: query });


    const { config } = await generateChartConfig(data ?? [], prompt);

    return defer({ query, data, config, error: sqlError ?? null, dataExistsInDb });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({ query: null, data: null, config: null, error: error, dataExistsInDb: false });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.chatbox}${url.searchParams.toString()}`,
    args
  );
}
clientLoader.hydrate = true;

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
        });
      }

      return json({
        status: "success",
        message: "Chat Saved Successfully",
      });
    }
    return json({
      status: "error",
      message: "No user found",
    });
  } catch (error) {
    return json({
      status: "error",
      message: error,
    });
  }
}

export default function Chatbox() {
  const { query, data, config, error, dataExistsInDb } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { role } = useUser();
  const { toast } = useToast();

  const { stateData,
    stateConfig,
    columns,
    prompt,
    setPrompt,
    inputRef,
    isSubmitting,
    searchPrompt,
    animatedPlaceholder,
    handleSubmit,
    handleSearch,
    saveChat,
    clearSearch,
    refreshSearch } = useSearchState({ data, config, query });

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
      clearSearch();
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

  return (
    <section className="relative w-full h-full flex flex-col items-center justify-start gap-4 p-4 overflow-hidden">
      {/* Input Chat Box */}
      <div className='flex space-x-3 w-full md:w-5/6 items-center'>
        <form
          className='relative w-full h-full flex flex-row gap-3 items-center justify-center'
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <>
            <Icon
              name={isSubmitting ? "update" : "search"}
              size="md"
              className={cn(
                "absolute pointer-events-none left-2 top-[14px]",
                isSubmitting && "animate-spin"
              )}
            />
            <Input
              type="text"
              name="prompt"
              value={prompt}
              tabIndex={-1}
              ref={inputRef}
              placeholder="Start typing to ask a question or search across your company’s data"
              className='pl-9 pb-[5px] text-[15px] w-full h-12 focus-visible:ring-0 placeholder:opacity-50 placeholder:focus-visible:opacity-70 bg-card tracking-wide'
              onChange={handleSearch}
              autoFocus={true}
              autoComplete='on'
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck='false'
            />
          </>
          <Button type="submit" className={cn("h-full px-5", (stateData?.length && prompt?.length && (prompt === searchPrompt)) && "hidden")} disabled={!prompt || isSubmitting} variant={"default"} onClick={handleSubmit}>
            <Icon name="check" size="md" />
          </Button>
        </form>
        <div className={cn("h-full flex flex-row items-center justify-center gap-3", (!stateData?.length) && "hidden")}>
          <Button className={cn("h-full px-5", prompt?.length && (prompt !== searchPrompt) && "hidden")} disabled={isSubmitting} variant={"default"} onClick={refreshSearch}>
            <Icon name="update" size="sm" />
          </Button>
          <Button
            onClick={saveChat}
            variant="default"
            className={cn("h-full px-5", !hasPermission(
              `${role}`,
              `${createRole}:${attribute.chat}`,
            ) && "hidden")}
            disabled={isSubmitting || dataExistsInDb}
          >
            <Icon name={dataExistsInDb ? "bookmark-filled" : "bookmark"} size="sm" />
          </Button>
          <Button className="h-full px-5" disabled={isSubmitting} variant={"muted"} onClick={clearSearch}>
            <Icon name="cross" size="sm" />
          </Button>
        </div>
      </div>
      {/* Suggested Prompts */}
      <Card className={cn(
        "w-full h-full md:w-5/6 flex flex-col overflow-hidden",
        searchPrompt && "hidden"
      )}>
        <CardHeader className="py-4 text-2xl font-bold capitalize tracking-wide">
          Try These Prompts:
        </CardHeader>
        <div className="flex-1 overflow-auto">
          <CardContent className="w-full flex flex-wrap gap-x-4 gap-y-4">
            {suggestedPrompt.map((prompt, index) => (
              <div
                key={prompt + index.toString()}
                className="w-max h-min text-sm tracking-wide cursor-pointer text-muted-foreground hover:text-foreground px-5 py-2.5 border dark:border-muted-foreground/40 rounded-md hover:bg-accent transition-colors"
                tabIndex={0}
                role="button"
                onClick={() => {
                  setPrompt(prompt);
                  inputRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setPrompt(prompt);
                  }
                }}
              >
                {prompt}
              </div>
            ))}
          </CardContent>
        </div>
      </Card>


      {/* If no state data is there after prompt */}
      <div className={cn("hidden", (searchPrompt && !stateData?.length) && "flex flex-col gap-4 w-full sm:w-3/5 md:w-1/2 h-3/5 text-center items-center justify-center")}>
        {isSubmitting ?
          <>
            <p className="text-muted-foreground/60 text-xl tracking-wider">{animatedPlaceholder}</p>
          </>
          :
          <>
            <p className="text-muted-foreground tracking-wider">
              No data found in this prompt. Since, this chat box is in early stages it might not work as expected. Try refreshing page or other prompts.
            </p>
            <div className="flex flex-col md:flex-row gap-3 items-center justify-center mt-1">
              <Button size="full" disabled={isSubmitting} className="px-5" variant={"default"} onClick={refreshSearch}>
                <Icon name="update" size="sm" />
              </Button>
              <Button size="full" disabled={isSubmitting} className="px-5" variant={"muted"} onClick={clearSearch}>
                <Icon name="cross" size="sm" />
              </Button>
            </div>
          </>
        }
      </div>
      {/* Data Display */}
      <Card className={cn("w-full h-full md:w-5/6 flex flex-col overflow-hidden", (!stateData?.length) && "hidden")}>
        <div className="flex-1 overflow-auto">
          <Results results={stateData} chartConfig={stateConfig} columns={columns} />
        </div>
      </Card>
    </section>
  )
}
