import { Link } from "@remix-run/react";
import { AssistantButton } from "./assistant/assistant-button";
import { FeedbackForm } from "./feedback-form";
import { ThemeSwitch } from "./switches/theme-switch";
import { UserMenu } from "./user-menu";
import type { Theme } from "@canny_ecosystem/types";
import { CompanySwitch } from "./switches/company-switch";
import type { Database } from "@canny_ecosystem/supabase/types";

export function Header({
  theme,
  user,
}: { theme: Theme; user: Database["public"]["Tables"]["user"]["Row"] }) {
  return (
    <header className="w-full h-[72px] -mx-4 md:m-0 z-10 px-4 md:px-2 md:border-b-[2px] border-b-accent flex justify-between pt-4 pb-2 md:pb-4 items-center sticky md:static top-0  md:backdrop-filter md:backdrop-blur-none">
      {/* <MobileMenu /> */}
      <AssistantButton />
      <div className="flex space-x-3 items-center no-drag">
        <CompanySwitch />
        <ThemeSwitch theme={theme} />
        <FeedbackForm />
        <UserMenu userData={user} Link={Link} />
      </div>
    </header>
  );
}
