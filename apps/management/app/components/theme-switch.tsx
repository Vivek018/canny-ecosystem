import { Icon, type Size } from "@canny_ecosystem/ui/icon";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@canny_ecosystem/ui/select";
import type { Theme } from "@canny_ecosystem/types";
import { useLocation, useSubmit } from "@remix-run/react";
import { themes } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

type Props = {
  currentTheme?: Theme;
  size?: Size;
  className?: string;
};

const ThemeIcon = ({ currentTheme, size = "md", className }: Props) => {
  switch (currentTheme) {
    case "dark":
      return <Icon name="moon" size={size} className={className} />;
    case "system":
      return <Icon name="laptop" size={size} className={className} />;
    default:
      return <Icon name="sun" size={size} className={className} />;
  }
};

export const ThemeSwitch = ({
  theme = "system",
  isExpanded,
  selectContentRef,
}: {
  theme?: Theme;
  isExpanded?: boolean;
  selectContentRef?: React.RefObject<HTMLDivElement>;
}) => {
  const location = useLocation();
  const submit = useSubmit();

  return (
    <div className="flex w-full items-center relative">
      <Select
        defaultValue={theme}
        onValueChange={(value) => {
          clearExactCacheEntry(cacheKeyPrefix.root);
          submit(
            { theme: value, returnTo: location.pathname + location.search },
            {
              method: "POST",
              action: "/cookie",
            },
          );
        }}
      >
        <SelectTrigger
          noIcon={!isExpanded}
          className={cn(
            "py-5 px-[13px] gap-2.5 h-12 w-12 rounded-full capitalize text-sm tracking-wide flex items-center justify-start transition-[width]",
            isExpanded && "w-full",
            "max-sm:w-full",
          )}
        >
          <ThemeIcon
            currentTheme={theme as Theme}
            className={cn("shrink-0")}
            size="md"
          />
          <p className={cn(!isExpanded && "hidden", "max-sm:flex")}>{theme}</p>
        </SelectTrigger>
        <SelectContent ref={selectContentRef}>
          <SelectGroup>
            {themes.map((theme) => (
              <SelectItem key={theme} value={theme} className="capitalize">
                <ThemeIcon
                  currentTheme={theme as Theme}
                  size="font"
                  className="mr-2 mb-[2.5px]"
                />
                {theme}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
