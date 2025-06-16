import { Results } from "@/components/chat/result";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { fetchAllSingleSQLQuery, generateQuery, runGeneratedSQLQuery } from "@/utils/ai/chat";
import { generateChartConfig } from "@/utils/ai/chat/chart";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { createChat } from "@canny_ecosystem/supabase/mutations";
import { getChatByPromptAndUserId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent, CardHeader } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, isGoodStatus, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, defer, json, useActionData, useLoaderData, useNavigate, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const suggestedPrompt = [
  "Show me employees with the highest attendance this month",
  "Show invoices due for payment this week",
  "Employees started working in 2025",
  "Employees with missing bank details",
  "List all pending reimbursements that need approval",
  // "Generate ESI/PF contribution report for this quarter",
  "Which employees have incomplete document submissions?",
  "List all projects sites with no of employees",
  "Payroll with amount more than 7 lakhs in last 2 years",
  "Show me the top 20 employees with the highest net salaries in April 2025",
  "Show me employees with upcoming birthdays this month",
  "Show me project sites with lowest attendance rates",
  "Show me accident reports by severity level",
  "Show me all ongoing cases",
  "List all pending invoices",
  "Employees with probation end dates",
  "Employees with upcoming leaves",
  "Generate payroll summary for last 3 month",
  "List approved invoices awaiting processing",
  // "Generate monthly attendance % per site",
  "List employees with work anniversaries this month",
  "Show me employees with the most overtime hours last month",
  "List employees most absent last month with contact numbers",
];

const placeholders = [
  "Thinking through your request, please hold on",
  "Analyzing everything you just asked for",
  "Generating the best possible response for you",
  "Fetching all the relevant data from our systems",
  "Just a moment while we prepare everything",
  "Working on your request with full focus",
  "Looking into the details to give you an accurate answer",
  "Digging through the data to find what you need",
  "Crunching some serious numbers for this one",
  "Loading up the insights you’re looking for",
  "Compiling the response that matches your request",
  "Pulling up the results — this won’t take long!",
  "Finalizing everything for a smooth output",
  "Almost done — just adding the finishing touches",
  "One sec, wrapping things up neatly for you",
  "Getting things ready — this’ll be worth it!",
  "Still with me? Your answer is coming together now",
  "Formatting the cleanest, clearest response possible",
  "Checking all the latest details before replying",
  "Still cooking that answer — hang tight!"
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

    const promptWithCompany =`${prompt} where company is company_id=${companyId}`

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
    const { supabase } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

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

  const [stateData, setStateData] = useState(data ?? []);
  const [stateConfig, setStateConfig] = useState(config);

  const columns = stateData?.[0] ? Object.keys(stateData[0]) : [];

  const animatedPlaceholder = useTypingAnimation(placeholders, false, {
    typingSpeed: 70,
    pauseDuration: 1400,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const searchPrompt = searchParams.get("prompt")?.toString() ?? undefined;

  const { toast } = useToast();
  const [prompt, setPrompt] = useState(searchPrompt);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const submit = useSubmit();

  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const clearSearch = () => {
    setStateData([]);
    setStateConfig(null);
    setPrompt("");
    searchParams.delete("prompt");
    setSearchParams(searchParams);
  }

  const refreshSearch = () => {
    setStateData([]);
    setStateConfig(null);
    setIsSubmitting(true);
    navigate(0);
  }

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
    if (data?.length) {
      setStateData(data);
    }
    if (config) {
      setStateConfig(config);
    }
  }, [data, config])

  useEffect(() => {
    setIsSubmitting(
      navigation.state === "submitting" ||
      (
        navigation.state === "loading" &&
        navigation.location.pathname === "/chat/chatbox" &&
        !!navigation.location.search.length
      )
    );
  }, [navigation.state]);

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

  useHotkeys(
    "esc",
    () => {
      clearSearch();
    },
    {
      enableOnFormTags: true,
    }
  );

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setPrompt(value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true)
    if (prompt !== searchPrompt) {
      setStateData([]);
      setStateConfig(null);
    }
    if (prompt) {
      searchParams.set("prompt", prompt);
      setSearchParams(searchParams);
    }
    setIsSubmitting(false);
  };

  const saveChat = (e: any) => {
    e.preventDefault();

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("prompt", searchPrompt ?? "");
    formData.append("query", query ?? "");
    formData.append("config", stateConfig ? JSON.stringify(stateConfig) : "");

    submit(formData, {
      action: "/chat/chatbox",
      method: "POST"
    })

    setIsSubmitting(false);
  }

  return (
    <section className="relative w-full h-full p-4 flex flex-col items-center justify-start gap-4">
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
            className="h-full px-5"
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
      <Card className={cn('w-full h-full md:w-5/6 items-start pb-3', searchPrompt && "hidden")}>
        <CardHeader className="py-4 text-2xl font-bold capitalize tracking-wide">Try These Prompts:</CardHeader>
        <CardContent className="w-full flex flex-wrap gap-x-4 gap-y-4 overflow-y-scroll">
          {
            suggestedPrompt.map((prompt, index) => (
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
            ))
          }
        </CardContent>
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
      <Card className={cn("w-full h-full mb-4 md:w-5/6 overflow-y-auto", (!stateData?.length) && "hidden")}>
        <Results
          results={stateData}
          chartConfig={stateConfig}
          columns={columns}
        />
      </Card>
    </section>
  )
}
