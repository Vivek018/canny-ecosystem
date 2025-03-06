import { Icon } from "./icon";

export function Logo({ theme }: { theme?: "dark" | "light" | "system" }) {
  return theme === "dark" ? (
    <Icon name="logo-dark" className="w-9 h-9" />
  ) : (
    <Icon name="logo-light" className="w-9 h-9" />
  );
}
