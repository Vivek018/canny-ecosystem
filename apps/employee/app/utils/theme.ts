import { parseWithZod } from "@conform-to/zod";
import { useFetchers } from "@remix-run/react";
import { useRequestInfo } from "./request-info";
import { useHints } from "./client-hints";
import type { Theme } from "@canny_ecosystem/types";
import { ThemeFormSchema } from "@canny_ecosystem/utils";

export function useTheme(): { theme: Theme } {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return {
      theme: (optimisticMode === "system"
        ? hints?.theme
        : optimisticMode) as unknown as Theme,
    };
  }
  return { theme: requestInfo?.userPrefs.theme ?? (hints?.theme as Theme) };
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
