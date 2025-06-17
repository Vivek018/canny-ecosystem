import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent, CardHeader } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Results } from "./result";
import { useSearchState } from "@/utils/ai/chat/hooks/search-state";
import { useUser } from "@/utils/user";

export function ChatboxComponent({
  query,
  suggestedPrompts,
  data,
  config,
  returnTo = "/chat/chatbox",
  dataExistsInDb = false
}: { query: string | null, suggestedPrompts: string[], data: any[] | null[] | null, config: any, returnTo?: string, dataExistsInDb?: boolean }) {

  const { role } = useUser();
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
    refreshSearch } = useSearchState({ data, config, query, returnTo });

  return (
    <section className="relative w-full h-full flex flex-col items-center justify-start gap-4 overflow-hidden">
      {/* Input Chat Box */}
      <div className='flex space-x-3 w-full items-center'>
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
          <Button
            type="submit"
            className={cn("h-full px-5", (stateData?.length && prompt?.length && (prompt === searchPrompt)) && "hidden")}
            disabled={!prompt || isSubmitting}
            variant={"default"}
            onClick={handleSubmit}
          >
            <Icon name="check" size="md" />
          </Button>
        </form>
        <div className={cn("h-full flex flex-row items-center justify-center gap-3", (!stateData?.length) && "hidden")}>
          <Button
            className={cn("h-full px-5", prompt?.length && (prompt !== searchPrompt) && "hidden")}
            disabled={isSubmitting}
            variant={"default"}
            onClick={refreshSearch}
          >
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
          <Button
            className="h-full px-5"
            disabled={isSubmitting}
            variant={"muted"}
            onClick={clearSearch}
          >
            <Icon name="cross" size="sm" />
          </Button>
        </div>
      </div>
      {/* Suggested Prompts */}
      <Card className={cn(
        "w-full h-full flex flex-col overflow-hidden",
        searchPrompt && "hidden"
      )}>
        <CardHeader className="py-3.5 text-xl font-bold capitalize tracking-wider">
          Try These Prompts:
        </CardHeader>
        <div className="flex-1 overflow-auto">
          <CardContent className="w-full flex flex-wrap gap-x-5 gap-y-3">
            {suggestedPrompts?.map((prompt, index) => (
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
        {(isSubmitting || searchPrompt !== prompt) ?
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
      <Card className={cn("w-full h-full flex flex-col overflow-hidden", (!stateData?.length) && "hidden")}>
        <div className="flex-1 overflow-auto">
          <Results results={stateData} chartConfig={stateConfig} columns={columns} />
        </div>
      </Card>
    </section>
  )
}
