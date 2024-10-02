import { cn } from "@/utils";

export function SecondaryMenu({
  items,
  pathname,
  Link,
}: {
  items: { path: string; label: string }[];
  pathname: string;
  Link: React.ElementType;
}) {
  return (
    <nav className="py-4">
      <ul className="flex space-x-6 text-sm overflow-auto scrollbar-hide">
        {items.map((item) => (
          <Link
            prefetch="intent"
            key={item.path}
            to={item.path}
            className={cn(
              "text-muted-foreground font-medium underline-offset-4",
              "hover:underline focus:underline focus:outline-none",
              pathname === item.path &&
                "text-primary hover:no-underline focus:no-underline",
            )}
          >
            <span className="capitalize">{item.label}</span>
          </Link>
        ))}
      </ul>
    </nav>
  );
}
