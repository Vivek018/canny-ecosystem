import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Site" },
    { name: "description", content: "Welcome to Canny Site!" },
  ];
};

export default function Index() {
  return <>Site App Index</>;
}
