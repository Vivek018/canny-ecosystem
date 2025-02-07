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

export function TerminationLetter({
  data,
  companyData,
}: {
  data: EmployeeWithLetterDataType | null;
  companyData: CompanyInfoDataType | null;
}) {
  const replacements = {
    employeeName: `${data?.employees.first_name} ${data?.employees.middle_name} ${data?.employees?.last_name}`,
    employeePosition:
      data?.employees.employee_project_assignment.position ?? "",
    employeeJoiningDate:
      data?.employees.employee_project_assignment.start_date ?? "",
    employeeLeavingDate:
      data?.employees.employee_project_assignment.end_date ?? "",
    companyName: companyData?.data?.name ?? "",
    companyAddress: companyData?.locationData?.address_line_1 ?? "",
    companyCity: companyData?.locationData?.city ?? "",
    companyState: companyData?.locationData?.state ?? "",
    companyPincode: companyData?.locationData?.pincode ?? "",
    issueDate: formatDate(data?.date ?? ""),
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
          {/* Date Section */}
          <View style={styles.headerDate}>
            <Text>Date: {formatDate(data?.date ?? "")}</Text>
          </View>

          {/* Recipient Details */}
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

          {/* Subject Section */}
          <View style={styles.title}>
            <Text style={styles.underlineText}>{data?.subject}</Text>
          </View>

          {/* Main Content Section */}
          <View style={styles.section}>
            <MarkdownRenderer
              content={replacePlaceholders(data?.content, replacements) ?? ""}
            />
          </View>

          {/* Closing Section */}
          {data?.include_signatuory && (
            <View style={styles.signatureBox}>
              <View>
                <Text>Yours faithfully,</Text>
                <View style={styles.section} />
                <Text style={styles.boldText}>
                  For, {companyData?.data?.name}
                </Text>
              </View>
              <Text>Director</Text>
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
