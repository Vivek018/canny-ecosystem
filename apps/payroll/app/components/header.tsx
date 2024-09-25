import { Link } from "@remix-run/react";
import { AssistantButton } from "./assistant/assistant-button";
import { FeedbackForm } from "./feedback-form";
import { ThemeSwitch } from "./theme-switch";
import { UserMenu } from "./user-menu";
import type { Theme } from "@canny_ecosystem/types";
import { CompanySwitch } from "./company/company-switch";
import type {
  CompaniesDatabaseRow,
  UserDatabaseRow,
} from "@canny_ecosystem/supabase/types";

export function Header({
  theme,
  user,
  companies,
}: {
  theme: Theme;
  user: UserDatabaseRow;
  companies: CompaniesDatabaseRow;
}) {
  return (
    <header className="w-full h-[72px] -mx-4 md:m-0 z-10 px-4 md:px-2 md:border-b-[2px] border-b-accent flex justify-between pt-4 pb-2 md:pb-4 items-center sticky md:static top-0 bg-background md:backdrop-filter md:backdrop-blur-none">
      {/* <MobileMenu /> */}
      <AssistantButton />
      <div className="flex gap-4 items-center no-drag">
        <CompanySwitch companies={companies} />
        <div className="bg-secondary w-[1.5px] py-1.5 mx-2 h-full">&nbsp;</div>
        <ThemeSwitch theme={theme} />
        <FeedbackForm />
        <UserMenu userData={user} Link={Link} />
      </div>
    </header>
  );
}
