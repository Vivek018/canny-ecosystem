import { Results } from "@/components/ai/result";
import { cacheKeyPrefix } from "@/constant";
import { fetchAllSingleSQLQuery, generateQuery, runGeneratedSQLQuery } from "@/utils/ai/chat";
import { generateChartConfig } from "@/utils/ai/chat/chart";
import { clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent, CardHeader } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useTypingAnimation } from "@canny_ecosystem/utils/hooks/typing-animation";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, defer, useLoaderData, useNavigate, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const suggestedPrompt = [
  "Show me employees with the highest attendance this month",
  "Show invoices due for payment this week",
  "Employees joined this month",
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
    const tablesData = JSON.stringify((await fetchAllSingleSQLQuery())?.data);
    const url = new URL(request.url);
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    // const { user } = await getUserCookieOrFetchUser(request, supabase);

    const searchParams = new URLSearchParams(url.searchParams);
    let prompt = searchParams.get("prompt") ?? "";

    if (!prompt) {
      return defer({ data: [], config: null, error: null });
    }

    // After testing everything uncomment the if statement below

    // if (user?.role !== "master" && user?.role !== "admin") {
    prompt = `${prompt} where company is company_id=${companyId}`
    // }

    const { query, error } = await generateQuery({ input: prompt, tablesData, companyId });

    if (query === undefined || error) {
      return defer({ data: null, config: null, error: error ?? "Error generating query" });
    }

    const { data, error: sqlError } = await runGeneratedSQLQuery({ input: prompt, originalQuery: query, tablesData, companyId });


    const { config } = await generateChartConfig(data ?? [], prompt);

    return defer({ data, config, error: sqlError ?? null });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({ data: null, config: null, error: error });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.chat}${url.searchParams.toString()}`,
    args
  );
}
clientLoader.hydrate = true;


export default function Chat() {
  const { data, config, error } = useLoaderData<typeof loader>();

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
        navigation.location.pathname === "/chat" &&
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
    if (prompt) {
      searchParams.set("prompt", prompt);
      setSearchParams(searchParams);
    }
    setIsSubmitting(false);
  };

  return (
    <section className="w-full h-full p-4 flex flex-col items-center justify-start gap-4">
      {/* Input Chat Box */}
      <div className='flex space-x-3 w-full md:w-4/5 items-center'>
        <form
          className='relative w-full'
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Icon
            name={isSubmitting ? "update" : "search"}
            size="md"
            className={cn(
              "absolute pointer-events-none left-2 top-[14px]",
              isSubmitting && "animate-spin"
            )}
          />
          <Input
            type="search"
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
        </form>
        <div className={cn("h-full flex flex-row items-center justify-center gap-3", (!stateData?.length) && "hidden")}>
          <Button className="h-full px-7" variant={"default"} onClick={refreshSearch}>Refresh</Button>
          <Button className="h-full px-7" variant={"secondary"} onClick={clearSearch}>Clear</Button>
        </div>
      </div>
      {/* Suggested Prompts */}
      <Card className={cn('w-full h-full md:w-4/5 items-start pb-3', searchPrompt && "hidden")}>
        <CardHeader className="py-4 text-2xl font-bold capitalize tracking-wide">Try These Prompts:</CardHeader>
        <CardContent className="w-full flex flex-wrap gap-x-6 gap-y-4 overflow-y-scroll">
          {
            suggestedPrompt.map((prompt, index) => (
              <div
                key={prompt + index.toString()}
                className="w-max h-min text-sm tracking-wider cursor-pointer text-muted-foreground hover:text-foreground px-5 py-2.5 border dark:border-muted-foreground/40 rounded-md hover:bg-accent transition-colors"
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
              <Button size="full" className="w-40" variant={"default"} onClick={refreshSearch}>Refresh</Button>
              <Button size="full" className="w-40" variant={"secondary"} onClick={clearSearch}>Clear</Button>
            </div>
          </>
        }
      </div>
      {/* Data Display */}
      <Card className={cn("w-full h-full md:w-4/5 overflow-y-auto", (!stateData?.length) && "hidden")}>
        <Results
          results={stateData}
          chartConfig={stateConfig}
          columns={columns}
        />
      </Card>
    </section >
  )
}
