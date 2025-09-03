import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function FooterTabs({
  items,
  pathname,
  Link,
  className,
}: {
  items: { path?: string; label?: string }[];
  pathname: string;
  Link: React.ElementType;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "w-full fixed bottom-0 left-0 z-50 border-t md:hidden",
        className
      )}
    >
      <ul
        className={cn(
          "bg-card overflow-x-scroll mx-auto flex text-sm overflow-auto no-scrollbar border-muted border-1 rounded-md h-14 p-2 pr-10",
          items.length < 3 && "gap-2"
        )}
      >
        {items?.map((item) => (
          <Link
            prefetch="intent"
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center whitespace-nowrap text-ellipsis mx-1 text-center font-medium underline-offset-4 rounded-lg py-5 px-4 border-outset",
              "hover:bg-muted hover:out",
              item?.path && pathname.includes(item?.path) && "text-primary/80",
              item?.path &&
                pathname === item?.path &&
                "text-primary no-underline hover:no-underline focus:no-underline cursor-default"
            )}
          >
            <span className="capitalize">{item.label}</span>
          </Link>
        ))}
      </ul>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="muted"
            className={cn(
              "fixed right-0 h-14 z-50 bottom-0 p-3 text-center font-medium border-l rounded-none"
            )}
          >
            <Icon name="dots-vertical" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-max" align="start">
          <DropdownMenuGroup>
            {items?.map((item) => (
              <Link
                prefetch="intent"
                key={item.path}
                to={item.path}
                className={cn(
                  "block py-1 text-sm bg-card text-muted-foreground font-medium underline-offset-4 hover:bg-muted",
                  item?.path &&
                    pathname.includes(item?.path) &&
                    "text-primary/80",
                  item?.path &&
                    pathname === item?.path &&
                    "text-primary no-underline hover:no-underline focus:no-underline cursor-default"
                )}
              >
                <DropdownMenuItem className="capitalize pr-12">
                  {item.label}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
