import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, NavLink, useLocation } from "@remix-run/react";
export const SecondarySidebar = ({
  className,
  items,
}: {
  className: string;
  items: {name: string, link: string}[]
}) => {
  const { pathname } = useLocation();
 
  return (
    <aside
      className={cn(
        "flex h-full flex-col items-start justify-start overflow-hidden bg-background border-r",
        className
      )}
    >
      <nav
        className={cn(
          "no-scrollbar flex h-full flex-col px-4 gap-4 overflow-y-scroll overflow-x-hidden items-center"
        )}
      >
        <ul className="flex h-full flex-col gap-1.5 items-start">
          {items?.map(({ name, link }) => {
            return (
              <NavLink
                key={name + link}
                to={link ?? ""}
                prefetch="intent"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "flex cursor-pointer text-start text-sm justify-start w-44 px-3.5 rounded py-2.5 tracking-wide hover:bg-accent gap-3 transition-[width]",
                    isActive
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "",
                    link === pathname
                      ? "cursor-auto bg-primary/25  text-primary hover:bg-primary/25"
                      : ""
                  )
                }
              >
                {/* <span className="shrink-0">{name}</span> */}
                <span className={cn("min-w-max")}>
                  {name}
                </span>
              </NavLink>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};