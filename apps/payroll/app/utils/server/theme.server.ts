import type { Theme } from "@canny_ecosystem/types";
import * as cookie from "cookie";
const cookieName = "en_theme";

export function getTheme(request: Request): Theme | null {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[cookieName]
    : "light";
  if (parsed === "light" || parsed === "dark") return parsed;
  return null;
}

export function setTheme(theme: Theme | "system") {
  if (theme === "system") {
    return cookie.serialize(cookieName, "", { path: "/", maxAge: -1 });
  }
  return cookie.serialize(cookieName, theme, { path: "/", maxAge: 31536000 });
}
