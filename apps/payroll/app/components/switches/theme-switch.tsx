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
import { themes } from "@/utils/theme";

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

export const ThemeSwitch = ({ theme = "system" }: { theme?: Theme }) => {
  const location = useLocation();
  const submit = useSubmit();
  return (
    <div className="flex items-center relative">
      <Select
        defaultValue={theme}
        onValueChange={(value) =>
          submit(
            { theme: value, returnTo: location.pathname + location.search },
            {
              method: "POST",
              action: "/cookie",
            },
          )
        }
      >
        <SelectTrigger
          noIcon={true}
          className="w-full py-1.5 px-2.5 gap-2 rounded-full bg-transparent capitalize h-10 text-xs"
        >
          <ThemeIcon currentTheme={theme as Theme} />
        </SelectTrigger>
        <SelectContent>
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
