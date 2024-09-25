import type { SVGProps } from "react";
import { cn } from "@/utils/cn";
import type { IconName as NameOfIcons } from "./icons/name";
import href from "./icons/sprite.svg";

export { href };
export type IconName = NameOfIcons;

const sizeClassName = {
  font: "w-[1em] h-[1em]",
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
} as const;

export type Size = keyof typeof sizeClassName;

const childrenSizeClassName = {
  font: "gap-2",
  xs: "gap-1.5",
  sm: "gap-1.5",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
} satisfies Record<Size, string>;

/**
 * Renders an SVG icon. The icon defaults to the size of the font. To make it
 * align vertically with neighboring text, you can pass the text as a child of
 * the icon and it will be automatically aligned.
 * Alternatively, if you're not ok with the icon being to the left of the text,
 * you need to wrap the icon and text in a common parent and set the parent to
 * display "flex" (or "inline-flex") with "items-center" and a reasonable gap.
 */
export function Icon({
  name,
  size = "font",
  className,
  children,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: Size;
}) {
  if (children) {
    return (
      <span
        className={`inline-flex items-center ${childrenSizeClassName[size]}`}
      >
        <Icon name={name} size={size} className={className} {...props} />
        {children}
      </span>
    );
  }
  return (
    <svg className={cn(sizeClassName[size], "inline self-center", className)}>
      <use href={`${href}#${name}`} />
    </svg>
  );
}
