import { useSearchParams } from "@remix-run/react";

export function useURLParamToggle(param: string): [boolean, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const isActive = searchParams.has(param);

  const toggleParam = () => {
    const newParams = new URLSearchParams(searchParams);
    if (isActive) {
      newParams.delete(param);
    } else {
      newParams.set(param, "true");
    }
    setSearchParams(newParams);
  };

  return [isActive, toggleParam];
}
