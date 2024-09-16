import { Link } from "@remix-run/react";
import { AssistantButton } from "./assistant/assistant-button";
import { FeedbackForm } from "./feedback-form";
import { ThemeSwitch } from "./theme-switch";
import { UserMenu } from "./user-menu";
import type { Theme } from "@canny_ecosystem/types";

export function Header({ theme }: { theme: Theme }) {
  return (
    <header className="w-full h-[72px] -mx-4 md:m-0 z-10 px-4 md:px-2 md:border-b-[2px] border-b-accent flex justify-between pt-4 pb-2 md:pb-4 items-center sticky md:static top-0  md:backdrop-filter md:backdrop-blur-none">
      {/* <MobileMenu /> */}
      <AssistantButton />
      <div className="flex space-x-3 items-center no-drag ml-auto">
        <FeedbackForm />
        <ThemeSwitch theme={theme} />
        <UserMenu userData={{ full_name: "a" }} Link={Link} />
      </div>
    </header>
  );
}
