import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./isomorphic-layout-effect";

export function useIsDocument() {
  const [isDocument, setIsDocument] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsDocument(true);
  }, []);

  return { isDocument };
}
