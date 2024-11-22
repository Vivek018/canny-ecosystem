import { sideNavList } from "@/constant";
import type { UserDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { Theme } from "@canny_ecosystem/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, NavLink, useLocation } from "@remix-run/react";
import { ThemeSwitch } from "./theme-switch";
import { UserMenu } from "./user-menu";
import { useRef, useState } from "react";
import { Logo } from "@canny_ecosystem/ui/logo";
import { Icon, type IconName } from "@canny_ecosystem/ui/icon";

export function Sidebar({
  className,
  theme,
  user,
}: {
  className: string;
  theme: Theme;
  user: Omit<UserDatabaseRow, "created_at" | "updated_at">;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { pathname } = useLocation();
  const selectContentRef = useRef<HTMLDivElement>(null);

  const openSidebar = () => {
    setIsExpanded(true);
  };

  const closeSidebar = () => {
    if (selectContentRef?.current?.getAttribute("data-state") === "open") {
      return;
    }
    setIsExpanded(false);
  };

  return (
    <aside
      className={cn(
        "fixed flex h-full flex-col overflow-hidden w-20 z-20 bg-background border-r transition-[width]",
        isExpanded && "w-52 shadow-2xl dark:shadow-foreground/10",
        className,
      )}
      onMouseEnter={openSidebar}
      onMouseLeave={closeSidebar}
    >
      <div
        className={cn(
          "min-h-[72px] max-h-[72px] my-auto justify-start flex items-center gap-2 px-[25px] border-b",
        )}
      >
        <Link prefetch="intent" to="/">
          <Logo />
        </Link>
      </div>
      <nav
        className={cn(
          "no-scrollbar flex h-full flex-col gap-4 overflow-y-scroll overflow-x-hidden items-center",
        )}
      >
        <ul className="flex w-full h-full flex-col py-2 gap-1.5 items-start">
          {sideNavList?.map(({ icon, name, link }) => {
            if (!icon && !link && !name) return null;
            if (!icon || !link) {
              return <li key={name} className={cn("my-0.5 w-full border-t")} />;
            }
            return (
              <NavLink
                key={icon + name}
                to={link ?? ""}
                prefetch="intent"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "flex mx-4 cursor-pointer text-start text-sm justify-start w-12 px-3.5 rounded py-2.5 tracking-wide hover:bg-accent gap-3 transition-[width]",
                    isExpanded && "w-44",
                    isActive
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "",
                    link === pathname
                      ? "cursor-auto bg-primary/25  text-primary hover:bg-primary/25"
                      : "",
                  )
                }
              >
                <Icon name={icon as IconName} size="md" className="shrink-0" />
                <span className={cn("min-w-max", !isExpanded && "hidden")}>
                  {name}
                </span>
              </NavLink>
            );
          })}
        </ul>
      </nav>
      <div
        className={cn(
          "w-full flex flex-col items-start justify-start px-4 gap-4 pt-6 pb-12 border-t",
        )}
      >
        <ThemeSwitch
          theme={theme}
          isExpanded={isExpanded}
          selectContentRef={selectContentRef}
        />
        <UserMenu
          userData={user}
          isExpanded={isExpanded}
          dropdownContentRef={selectContentRef}
          Link={Link}
        />
      </div>
    </aside>
  );
}
