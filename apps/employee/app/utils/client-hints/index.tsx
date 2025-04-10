import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { useRequestInfo } from "../request-info";
import {
  clientHints as colorSchemeHint,
  subscribeToSchemeChange,
} from "./color-scheme";
import { getHintsUtils } from "./hints";

const hintsUtils = getHintsUtils({
  theme: colorSchemeHint,
});

export const { getHints } = hintsUtils;

export function useHints() {
  const requestInfo = useRequestInfo();
  return requestInfo?.hints;
}

export function ClientHintCheck({ nonce }: { nonce: string }) {
  const { revalidate } = useRevalidator();
  useEffect(() => subscribeToSchemeChange(() => revalidate()), [revalidate]);

  return (
    <script
      nonce={nonce}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}
