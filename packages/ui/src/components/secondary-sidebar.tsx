import { cn } from "@canny_ecosystem/ui/utils/cn";
import { NavLink, useLocation } from "@remix-run/react";
export const SecondarySidebar = ({
  items,
  className,
  navLinkClassName,
  bottomItem,
}: {
  items: { name: string; link: string }[];
  className?: string;
  navLinkClassName?: string;
  bottomItem?: React.ReactNode;
}) => {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "flex py-4 flex-col items-start justify-start overflow-hidden bg-background border-r",
        className,
        !items?.length && "hidden",
      )}
    >
      <nav
        className={cn(
          "no-scrollbar h-full overflow-x-hidden overflow-y-scroll flex flex-col justify-between px-4 pb-4 gap-4 items-center",
        )}
      >
        <ul className="h-full flex flex-col gap-1.5 items-start pb-4">
          {items?.map(({ name, link }) => {
            return (
              <NavLink
                key={name + link}
                to={link ?? ""}
                prefetch="intent"
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    "min-h-max flex cursor-pointer text-start text-sm justify-start w-44 px-3.5 rounded py-2.5 tracking-wide hover:bg-accent gap-3 transition-[width] overflow-hidden",
                    isActive
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "",
                    link === pathname
                      ? "cursor-auto bg-primary/25 text-primary hover:bg-primary/25"
                      : "",
                    navLinkClassName,
                  )
                }
              >
                <span className={cn("w-44 truncate", navLinkClassName)}>
                  {name}
                </span>
              </NavLink>
            );
          })}
        </ul>
        {bottomItem}
      </nav>
    </aside>
  );
};
