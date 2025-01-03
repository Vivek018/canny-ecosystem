import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const employeeId = params.id;
    return redirect(`/employees/${employeeId}`);
}


export default function GratuityId() {
  return (
    <div>GratuityId</div>
  )
}
