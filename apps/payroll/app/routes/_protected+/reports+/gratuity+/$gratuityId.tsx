import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
    const employeeId = params.gratuityId;
    return redirect(`/employees/${employeeId}`);
}


export default function GratuityId() {
  return (
    <div>GratuityId</div>
  )
}
