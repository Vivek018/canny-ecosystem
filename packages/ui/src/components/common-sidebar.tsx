import { cn } from "@/utils";
import type { IconName } from "./icon";
import { Icon } from "./icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import type { NavList } from "@canny_ecosystem/types";
import { Logo } from "./logo";

type SidebarProps = {
  className?: string;
  list: NavList[];
  path: string;
  Link: React.ElementType;
  NavLink: React.ElementType;
};

export function CommonSidebar({
  className,
  list,
  path,
  Link,
  NavLink,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-3 overflow-hidden w-20",
        className,
      )}
    >
      <div className={cn("mt-6 flex w-min items-center gap-2 mx-auto")}>
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <nav
        className={cn(
          "no-scrollbar -mt-2.5 flex h-full flex-col gap-4 overflow-scroll items-center px-2.5",
        )}
      >
        <ul className="flex w-full flex-col py-6 gap-3 items-center">
          {list.map(({ icon, name, link }) => {
            return (
              <TooltipProvider key={name}>
                <Tooltip delayDuration={70}>
                  <TooltipTrigger tabIndex={-1}>
                    <NavLink
                      to={link ?? ""}
                      className={({ isActive }: { isActive: boolean }) =>
                        cn(
                          "flex cursor-pointer rounded w-min px-4 py-3.5 text-sm tracking-wide hover:bg-accent justify-center",
                          isActive
                            ? "bg-primary/15 text-primary shadow-sm hover:bg-primary/20"
                            : "",
                          link === path
                            ? "cursor-auto bg-primary/25  text-primary shadow-sm hover:bg-primary/25"
                            : "",
                        )
                      }
                    >
                      <Icon name={icon as IconName} className="scale-[1.3]" />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    sideOffset={8}
                    className={cn("flex")}
                  >
                    <span>{name}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
