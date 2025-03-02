import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Employee" },
    { name: "description", content: "Welcome to Canny Employee!" },
  ];
};

export default function Index() {
  return <>Employee App Index</>;
}
