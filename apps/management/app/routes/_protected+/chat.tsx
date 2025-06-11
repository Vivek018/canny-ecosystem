import { Results } from "@/components/ai/result";
import { cacheKeyPrefix } from "@/constant";
import { generateQuery, runGeneratedSQLQuery } from "@/utils/ai/chat";
import { clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent, CardHeader } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, defer, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
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
  "Payroll with highest amount in last 2 years",
  "Show me the top 5 employees with the highest salaries",
  "Show me employees with upcoming birthdays",
  "Show me project sites with lowest attendance rates",
  "List all pending contractor invoices",
  "Probation end dates by employee",
  "Employees with upcoming leave",
  "Generate payroll summary for last 3 month",
  "Show me accident reports by severity level",
  "List approved invoices awaiting processing",
  // "Generate monthly attendance % per site",
  "List employees with work anniversaries this month",
  "Show me employees with the most overtime hours",
  "List laborers most absent last month with contact numbers",
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const searchParams = new URLSearchParams(url.searchParams);
    const prompt = searchParams.get("prompt") ?? "";

    if (!prompt) {
      return defer({ data: [], error: null });
    }

    const { query, error } = await generateQuery({ input: prompt, companyId });

    if (query === undefined || error) {
      return defer({ data: null, error: error ?? "Error generating query" });
    }

    const { data, error: sqlError } = await runGeneratedSQLQuery(query);

    return defer({ data, error: sqlError ?? null });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({ data: null, error: error });
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

  const { data, error } = useLoaderData<typeof loader>();
  const columns = data?.[0] ? Object.keys(data[0]) : [];

  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [chartConfig, setChartConfig] = useState<null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchPrompt = searchParams.get("prompt") ?? null;

  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.location.pathname === "/chat" &&
      navigation.location.search.length);

  const clearSearch = () => {
    searchParams.delete("prompt");
    setSearchParams(searchParams);
    setChartConfig(null);
  }

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
    searchParams.set("prompt", prompt);
    setSearchParams(searchParams);
  };

  console.log(data, columns);

  return (
    <section className="w-full h-full p-4 flex flex-col items-center justify-start gap-4">
      {/* Input Chat Box */}
      <div className='flex space-x-4 w-full md:w-4/5 items-center'>
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
              "absolute pointer-events-none left-2 top-[14px] md:left-[10px] md:top-[18px]",
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
            className='pl-9 pb-[5px] text-[15px] w-full h-12 md:h-14 focus-visible:ring-0 placeholder:opacity-50 placeholder:focus-visible:opacity-70 bg-card'
            onChange={handleSearch}
            autoFocus={true}
            autoComplete='on'
            autoCapitalize='none'
            autoCorrect='off'
            spellCheck='false'
          />
        </form>
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
      {/* If no data is there after prompt */}
      <div className={cn("hidden", (searchPrompt && !data?.length) && "flex flex-col gap-4 w-full h-3/5 items-center justify-center")}>
        {isSubmitting ?
          <>
            <p className="text-muted-foreground text-lg">Creating Data For You...</p>
          </>
          :
          <>
            <p className="text-muted-foreground text-lg">
              No data found for your prompt. Please try a different question.
            </p>
            <Button size="lg" variant={"secondary"} onClick={clearSearch}>Clear</Button>
          </>
        }
      </div>
      {/* Data Display */}
      <Card className={cn("w-full h-full md:w-4/5 overflow-y-auto", (!data?.length) && "hidden")}>
        <Results
          results={data}
          chartConfig={chartConfig}
          columns={columns}
        />
      </Card>
    </section>
  )
}
