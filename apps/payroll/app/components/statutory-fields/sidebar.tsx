import { cn } from "@canny_ecosystem/ui/utils/cn";
import { NavLink, useLocation } from "@remix-run/react";
import { useRef, useState } from "react";
import { statutorySideNavList } from "@/constant";
const Sidebar = ({ className }: { className: string }) => {
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
        "flex h-full flex-col overflow-hidden w-52 pt-5 bg-background border-r transition-[width]",
        isExpanded && "w-52 dark:shadow-foreground/10",
        className
      )}
      onMouseEnter={openSidebar}
      onMouseLeave={closeSidebar}
    >
      <nav
        className={cn(
          "no-scrollbar flex h-full flex-col gap-4 overflow-y-scroll overflow-x-hidden items-center"
        )}
      >
        <ul className="flex w-full h-full flex-col py-2.5 gap-1.5 items-start">
          {statutorySideNavList?.map(({ name, link }) => {
            if (!link && !name) return null;
            if (!link) {
              return <li key={name} className={cn("my-0.5 w-full border-t")} />;
            }
            return (
              <NavLink
                key={name}
                to={link ?? ""}
                prefetch="intent"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "flex mx-4 cursor-pointer text-start text-sm justify-start w-44 px-3.5 rounded py-2.5 tracking-wide hover:bg-accent gap-3 transition-[width]",
                    isActive
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "",
                    link === pathname
                      ? "cursor-auto bg-primary/25  text-primary hover:bg-primary/25"
                      : ""
                  )
                }
              >
                {!isExpanded && <span className="shrink-0">{name}</span>}
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
          "w-full flex flex-col items-start justify-start px-4 gap-4 pt-6 pb-[50vh]"
        )}
      ></div>
    </aside>
  );
};

export default Sidebar;
