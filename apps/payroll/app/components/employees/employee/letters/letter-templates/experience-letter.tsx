import type { EmployeeWithLetterDataType } from "@canny_ecosystem/supabase/queries";
import {
  formatDate,
  replacePlaceholders,
  styles,
} from "@canny_ecosystem/utils";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { MarkdownRenderer } from "../markdown-renderer";
import type { CompanyInfoDataType } from "@/routes/_protected+/employees+/$employeeId+/letters+/$letterId";
import { LetterHeader } from "./letter-header";

export function ExperienceLetter({
  data,
  companyData,
}: {
  data: EmployeeWithLetterDataType | null;
  companyData: CompanyInfoDataType | null;
}) {
  const replacements = {
    employeeName: `${data?.employees.gender === "female" ? "Ms." : "Mr."} ${data?.employees.first_name} ${data?.employees.middle_name} ${data?.employees?.last_name}`,
    employeeGender: data?.employees.gender ?? "",
    employeeJoiningDate: new Date(
      data?.employees.employee_project_assignment.start_date ?? "",
    ).toLocaleDateString("en-IN"),

    employeeLeavingDate: new Date(
      data?.employees.employee_project_assignment.end_date ?? "",
    ).toLocaleDateString("en-IN"),
    employeePosition:
      data?.employees.employee_project_assignment.position ?? "",
    companyName: companyData?.data?.name ?? "",
    compantAddress: companyData?.locationData?.address_line_1 ?? "",
    companyCity: companyData?.locationData?.city ?? "",
    siteName:
      data?.employees.employee_project_assignment.project_sites.name ?? "",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data?.include_letter_head && (
          <View style={styles.header} fixed>
            <LetterHeader />
          </View>
        )}

        <View style={styles.wrapper}>
          {/* Header Section */}
          <View style={styles.headerDate}>
            <Text>Date: {formatDate(data?.date ?? "")}</Text>
          </View>

          {data?.include_client_address && (
            <View style={styles.recipient}>
              <Text>{companyData?.data?.name}</Text>
              <Text>{companyData?.locationData?.address_line_1},</Text>
              <Text>{companyData?.locationData?.city},</Text>
              <Text>
                {companyData?.locationData?.state} -{" "}
                {companyData?.locationData?.pincode}
              </Text>
            </View>
          )}

          {data?.include_employee_address && (
            <View style={styles.recipient}>
              <Text>To,</Text>
              <Text style={styles.boldText}>
                {data.employees.first_name} {data.employees.middle_name ?? " "}{" "}
                {data.employees.last_name},
              </Text>
              <Text>
                {data?.employees.employee_addresses[0].address_line_1},
              </Text>
              <Text>
                {data?.employees.employee_addresses[0].state},{" "}
                {data?.employees.employee_addresses[0].city},
              </Text>
              <Text>
                {data?.employees.employee_addresses[0].country} -{" "}
                {data?.employees.employee_addresses[0].pincode}
              </Text>
            </View>
          )}

          <View style={styles.title}>
            <Text style={styles.underlineText}>{data?.subject}</Text>
          </View>

          {/* Main Content Section */}
          <View style={styles.section}>
            <MarkdownRenderer
              content={replacePlaceholders(data?.content, replacements) ?? ""}
            />
          </View>
          <View style={styles.section} />
          <View style={styles.section} />
          {data?.include_signatuory && (
            <View style={styles.signatureBox}>
              <View>
                <View style={styles.section} />
                <Text>Yours faithfully,</Text>
                <Text style={styles.boldText}>
                  For, {companyData?.data?.name}
                </Text>
              </View>
              <Text>Authorised Signatory</Text>
            </View>
          )}
        </View>
        {data?.include_letter_head && (
          <View style={styles.footer} fixed>
            <LetterHeader />
          </View>
        )}
      </Page>
    </Document>
  );
}
