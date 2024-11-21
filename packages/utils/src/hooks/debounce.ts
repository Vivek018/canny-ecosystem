import { useEffect, useMemo, useRef } from "react";
import { debounce } from "../misx";

export function useDebounce<
  Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>
>(callback: Callback, delay = 250) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, []);

  return useMemo(() => {
    return debounce(
      (...args: Parameters<Callback>) => callbackRef.current(...args),
      delay
    );
  }, [delay]);
}
