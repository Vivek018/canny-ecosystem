import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import {
  type ActionFunctionArgs,
  createCookieSessionStorage,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { parseWithZod, getZodConstraint } from "@conform-to/zod";
import { FormButtons } from "@/components/form/form-buttons";
import { ReimbursementImportStep1 } from "@/components/reimbursements/reimbursement-import-step-1";
import ReimbursementImportStep2 from "@/components/reimbursements/reimbursement-import-step-2";
import { ImportReimbursementSchema } from "@canny_ecosystem/utils";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "my-session",
    secrets: ["your-secret-here"],
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const mappingData = session.get("submissionData");
  

  const headers = {
    "Set-Cookie": await sessionStorage.commitSession(
      await sessionStorage.getSession()
    ),
  };

  if (!mappingData) {
    return json({ mappingData: null, fileData: null }, { headers });
  }

  return json({ mappingData}, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ImportReimbursementSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  session.set("submissionData", submission.value);
  

  return redirect("/approvals/reimbursements/import-data", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export default function ReimbursementImportFieldMapping() {
  const { mappingData, fileData } = useLoaderData() as {
    mappingData: any | null;
    fileData: any | null;
  };

  const location = useLocation();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [array, setArray] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    constraint: getZodConstraint(ImportReimbursementSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ImportReimbursementSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    const file = location.state?.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);

        Papa.parse(file, {
          skipEmptyLines: true,
          complete: (results:any) => {
            const headers = results.data[0].filter(
              (header: string) => header !== null && header.trim() !== ""
            );
            setArray(headers);
          },
        });
      };
      reader.readAsText(file);
    }
  }, [location.state?.file]);

  const [parsedData, setParsedData] = useState({});

  useEffect(() => {
    if (mappingData) {
      const fieldMapping = Object.fromEntries(
        Object.entries(mappingData).map(([key, value]) => [value, key])
      );

      const fileToUse = fileContent || fileData;

      setParsedData({ fieldMapping, file: fileToUse});
      setFormSubmitted(true);
    }
  }, [mappingData, fileContent, fileData]);

  return (
    <section className="w-full">
      {!formSubmitted ? (
        <FormProvider context={form.context}>
          <Form method="POST" {...getFormProps(form)} className="flex flex-col">
            
            <ReimbursementImportStep1
              key={resetKey}
              fields={fields}
              array={array}
            />
            <FormButtons
              setResetKey={setResetKey}
              form={form}
              isSingle={true}
            />
          </Form>
        </FormProvider>
      ) : (
        <ReimbursementImportStep2 parsedData={parsedData} />
      )}
    </section>
  );
}
