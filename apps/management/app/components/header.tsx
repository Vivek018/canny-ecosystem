import { Button } from "@canny_ecosystem/ui/button";
import { AssistantButton } from "./assistant/assistant-button";
import { CompanySwitch } from "./company/company-switch";
import type { CompanyDatabaseRow } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { Dispatch, SetStateAction } from "react";

export function Header({
  className,
  companies,
  setOpenNav,
}: {
  className?: string;
  companies: Pick<CompanyDatabaseRow, "id" | "name" | "logo">[];
  setOpenNav: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header
      className={cn(
        "w-full px-4 min-h-[72px] max-h-[72px] md:m-0 z-10 border-b flex justify-between items-center sticky md:static top-0 bg-background md:backdrop-filter md:backdrop-blur-none",
        className
      )}
    >
      <Button
        variant={"outline"}
        size="icon"
        className="flex sm:hidden h-10 px-0"
        onClick={() => setOpenNav(true)}
      >
        <Icon name="hamburger" className="h-5 w-10" />
      </Button>
      <AssistantButton />
      <div className="flex gap-4 items-center no-drag">
        <CompanySwitch companies={companies} />
      </div>
    </header>
  );
}
