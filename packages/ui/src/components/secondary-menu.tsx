import { cn } from "@/utils";

export function SecondaryMenu({
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
    <nav className={cn("pt-4 pb-2", className)}>
      <ul className="flex space-x-6 text-sm overflow-auto no-scrollbar">
        {items?.map((item) => {
          if (!item?.path?.length) {
            return null;
          }
          return (
            <Link
              prefetch="intent"
              key={item.path}
              to={item.path}
              className={cn(
                "text-muted-foreground font-medium underline-offset-4",
                "hover:underline focus:underline focus:outline-none",
                pathname === item.path &&
                  "text-primary hover:no-underline focus:no-underline"
              )}
            >
              <span className="capitalize">{item.label}</span>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
}
