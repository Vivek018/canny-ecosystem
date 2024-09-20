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
            prefetch
            key={item.path}
            to={item.path}
            className={cn(
              "text-muted-foreground",
              pathname === item.path &&
                "text-primary font-medium underline underline-offset-8",
            )}
          >
            <span className="capitalize">{item.label}</span>
          </Link>
        ))}
      </ul>
    </nav>
  );
}
