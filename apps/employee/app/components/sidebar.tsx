import { sideNavList } from "@/constant";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, NavLink, useLocation } from "@remix-run/react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { Logo } from "@canny_ecosystem/ui/logo";
import { Icon, type IconName } from "@canny_ecosystem/ui/icon";

export function Sidebar({
  className,
  setOpenNav,
}: {
  className: string;
  setOpenNav: Dispatch<SetStateAction<boolean>>;
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
        "fixed flex h-full flex-col overflow-hidden w-20 z-50 bg-background border-r transition-[width]",
        isExpanded && "w-60 shadow-2xl dark:shadow-foreground/10",
        "max-sm:w-60 max-sm:shadow-2xl max-sm:dark:shadow-foreground/10",
        className,
      )}
      onMouseEnter={openSidebar}
      onMouseLeave={closeSidebar}
    >
      <div
        className={cn(
          "min-h-[72px] max-h-[72px] my-auto justify-start flex items-center gap-2 px-[22px] border-b",
        )}
      >
        <Link prefetch="intent" to="/" onClick={() => setOpenNav(false)}>
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
                    isExpanded && "w-[200px]",
                    "max-sm:w-[200px]",
                    isActive &&
                      "bg-primary/15 text-primary hover:bg-primary/20",
                    link === pathname &&
                      "cursor-auto bg-primary/25  text-primary hover:bg-primary/25",
                  )
                }
                onClick={() => setOpenNav(false)}
              >
                <Icon name={icon as IconName} size="md" className="shrink-0" />
                <span
                  className={cn(
                    "w-40 truncate",
                    !isExpanded && "hidden",
                    "max-sm:flex",
                  )}
                >
                  {name}
                </span>
              </NavLink>
            );
          })}
          <div className="my-0.5">&nbsp;</div>
        </ul>
      </nav>
    </aside>
  );
}
