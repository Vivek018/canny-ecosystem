import { parseWithZod } from "@conform-to/zod";
import { useFetchers } from "@remix-run/react";
import { z } from "zod";
import { useRequestInfo } from "./request-info";
import { useHints } from "./client-hints";
import type { Theme } from "@canny_ecosystem/types";

export const themes = ["light", "dark", "system"] as const;

export const ThemeFormSchema = z.object({
  theme: z.enum(themes),
});

export function useTheme(): Theme {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return (optimisticMode === "system"
      ? hints?.theme
      : optimisticMode) as unknown as Theme;
  }
  return requestInfo?.userPrefs.theme ?? (hints?.theme as Theme);
}

export function useOptimisticThemeMode() {
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find((f) => f.formAction === "/");

  if (themeFetcher?.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: ThemeFormSchema,
    });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }
}
