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
    <nav className={cn(className)}>
      <ul className='flex space-x-6 text-sm overflow-auto no-scrollbar'>
        {items.map((item) => (
          <Link
            prefetch='intent'
            key={item.path}
            to={item.path}
            className={cn(
              "text-muted-foreground font-medium underline-offset-4",
              "hover:underline focus:underline focus:outline-none",
              item?.path && pathname.includes(item?.path) && "text-primary/80",
              item?.path &&
              pathname === item?.path &&
              "text-primary no-underline hover:no-underline focus:no-underline cursor-default"
            )}
          >
            <span className='capitalize'>{item.label}</span>
          </Link>
        ))}
      </ul>
    </nav>
  );
}
