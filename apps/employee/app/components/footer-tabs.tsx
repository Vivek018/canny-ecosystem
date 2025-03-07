import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useRef, useState } from "react";

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
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const containerRef = useRef<HTMLElement>(null);

	const visibleTabs = 3;
	const visibleItems = items;
	const dropdownItems = items.slice(visibleTabs);

	const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
		if (!containerRef.current?.contains(e.relatedTarget as Node)) {
			setIsDropdownOpen(false);
		}
	};

	return (
		<nav
			ref={containerRef}
			onBlur={handleBlur}
			className={cn(
				"w-full fixed bottom-0 left-0 z-50 dark:border-muted-secondary rounded-md dark:shadow-card shadow-xl",
				className
			)}
		>
			<ul className="overflow-x-scroll mx-auto flex justify-between md:text-sm text-sm overflow-auto no-scrollbar border-secondary-foreground border-1 rounded-md p-3 dark:bg-card">
				{visibleItems.map((item) => (
					<Link
						prefetch="intent"
						key={item.path}
						to={item.path}
						className={cn(
							"flex items-center whitespace-nowrap text-ellipsis mx-1 text-center font-medium underline-offset-4 rounded-lg py-5 px-4 border-outset",
							"hover:bg-muted hover:out",
							item?.path && pathname.includes(item?.path) && "text-primary/80",
							item?.path && pathname === item?.path && "text-primary no-underline hover:no-underline focus:no-underline cursor-default"
						)}
					>
						<span className="capitalize">{item.label}</span>
					</Link>
				))}

				{dropdownItems.length > 0 && (
					<button
						type="button"
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className={cn(
							"fixed right-0 bottom-0 p-3 h-[83px] text-center text-primary font-medium underline-offset-4 border-outset rounded-tr-md rounded-br-md shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)]",
							"active:text-primary active:text-white dark:text-foreground dark:bg-accent dark:[&:active]:bg-text-primary dark:[&:active]:text-foreground",
							"hover:bg-muted hover:out"
						)}
					>
						<Icon name="dots-vertical" className="h-[18px] w-[18px]" />
					</button>
				)}
			</ul>

			{isDropdownOpen && (
				<div
					className="absolute bottom-full right-1 mb-2 w-1/3 dark:bg-card border border-muted rounded-md shadow-lg"
				>
					{dropdownItems.map((item) => (
						<Link
							prefetch="intent"
							key={item.path}
							to={item.path}
							className={cn(
								"block p-3 text-sm hover:bg-muted",
								item?.path && pathname.includes(item?.path) && "text-primary/80",
								item?.path && pathname === item?.path && "text-primary no-underline hover:no-underline focus:no-underline cursor-default"
							)}
							onClick={() => setIsDropdownOpen(false)}
						>
							<span className="capitalize">{item.label}</span>
						</Link>
					))}
				</div>
			)}
		</nav>
	);
}