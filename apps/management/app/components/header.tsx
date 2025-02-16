import { AssistantButton } from "./assistant/assistant-button";
import { CompanySwitch } from "./company/company-switch";
import type { CompaniesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function Header({
  className,
  companies,
}: {
  className?: string;
  companies: CompaniesDatabaseRow;
}) {
  return (
    <header
      className={cn(
        "w-full min-h-[72px] max-h-[72px] md:m-0 z-10 border-b flex justify-between items-center sticky md:static top-0 bg-background md:backdrop-filter md:backdrop-blur-none",
        className,
      )}
    >
      <AssistantButton />

      <div className="flex gap-4 items-center no-drag">
        <CompanySwitch companies={companies} />
      </div>
    </header>
  );
}
