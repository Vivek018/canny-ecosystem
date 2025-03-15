import { getEmployeeIdsByEmployeeCodes } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Field } from "@canny_ecosystem/ui/forms";
import { Icon } from "@canny_ecosystem/ui/icon";
import { StatusButton } from "@canny_ecosystem/ui/status-button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { EmployeeLoginSchema } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect, useActionData, useNavigate, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { employeeRoleCookie } from "@/utils/server/user.server";



export async function action({ request }: ActionFunctionArgs): Promise<Response> {
	try {
		const { supabase } = getSupabaseWithHeaders({ request });
		const formData = await request.formData();
		const submission = parseWithZod(formData, { schema: EmployeeLoginSchema });

		if (submission.status !== "success") {
			return json(
				{ result: submission.reply() },
				{ status: submission.status === "error" ? 400 : 200 },
			);
		}

		const employeeData = submission.value;

		const { data, error } = await getEmployeeIdsByEmployeeCodes({
			supabase,
			employeeCodes: [employeeData.employee_code],
		})

		if (error || !data || data.length === 0) {
			return json({ error: error || "No employee data found", employeeId: null, }, { status: 400 });
		}

		if (typeof window !== "undefined") {
			window.localStorage.setItem("employeeId", JSON.stringify(data?.[0].id));
		}


		return redirect(`/employees/${data[0].id}/overview`, {
			headers: {
				"Set-Cookie": await employeeRoleCookie.serialize({
					role: "employee",
					employeeId: data[0].id,
				}),
			},
		});
	} catch (error) {
		return json({ error, employeeId: null }, { status: 500 });
	}
}

export default function ChooseRole() {
	const navigate = useNavigate();
	const navigation = useNavigation();
	const [form, fields] = useForm({
		id: "choose-role",
		constraint: getZodConstraint(EmployeeLoginSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: EmployeeLoginSchema });
		},
		shouldValidate: "onInput",
		shouldRevalidate: "onInput",
	});
	const { toast } = useToast();
	const actionData = useActionData<typeof action>();

	useEffect(() => {
		if (actionData?.error) {
			toast({
				title: "Error",
				description: actionData?.error ?? "Failed to load employee details",
				variant: "destructive",
			})
		}
	}, [actionData]);

	return (
		<div className="flex mx-auto mt-56">
			<div className="flex flex-col  gap-5 justify-center items-left mx-auto">
				<FormProvider context={form.context}>
					<Form method="POST" {...getFormProps(form)} className="flex flex-col">
						<div className="flex items-start gap-2">
							<Field
								inputProps={{
									...getInputProps(fields.employee_code, {
										type: "text",
									}),
									className: "p-5 text-md w-56",
									placeholder: "Employee Code"
								}}
								errors={fields.employee_code.errors}
							/>
							<StatusButton
								status={navigation.state === "submitting" ? "pending" : "idle"}
								form={form.id}
								disabled={!form.valid}
								variant="default"
								size="full"
								type="submit"
								name="_action"
								value="submit"
								className={cn(
									" mt-[7px] px-4 py-5",
								)}
							>
								<Icon name="chevron-right" className="mb-1" />
							</StatusButton>
						</div>
					</Form>
				</FormProvider>
				<span className="self-center mr-10">or</span>
				<Button onClick={() => navigate("/login")} className="p-6 cursor-pointer mt-7 w-56">
					Login as Supervisor
				</Button>
			</div>
		</div>
	)
}
