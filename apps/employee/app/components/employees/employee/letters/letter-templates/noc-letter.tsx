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
import type { EmployeeAddressDatabaseRow } from "@canny_ecosystem/supabase/types";

export function NOCLetter({
  data,
  employeeAddressData,
  companyData,
}: {
  data: EmployeeWithLetterDataType | null;
  employeeAddressData: Omit<
    EmployeeAddressDatabaseRow,
    "created_at" | "updated_at"
  > | null;
  companyData: CompanyInfoDataType | null;
}) {
  const replacements = {
    employeeName: `${data?.employees.gender === "female" ? "Ms." : "Mr."} ${data?.employees.first_name} ${data?.employees.middle_name ?? ""} ${data?.employees?.last_name}`,
    employeeGender: data?.employees.gender ?? "",
    employeeJoiningDate: new Date(
      data?.employees.employee_project_assignment?.start_date ?? "",
    ).toLocaleDateString("en-IN"),

    employeeLeavingDate: new Date(
      data?.employees.employee_project_assignment?.end_date ?? "",
    ).toLocaleDateString("en-IN"),
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data?.include_letter_head ? (
          <View style={styles.header} fixed>
            <LetterHeader />
          </View>
        ) : <View fixed style={styles.indent} />}
        <View style={styles.wrapper}>
          {/* Date Section */}
          <View style={styles.headerDate}>
            <Text>Date: {formatDate(data?.date ?? "")}</Text>
          </View>

          {/* Recipient Details */}
          {data?.include_client_address &&
            companyData?.data &&
            companyData?.locationData && (
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

          {data?.include_employee_address &&
            data.employees &&
            employeeAddressData && (
              <View style={styles.recipient}>
                <Text>To,</Text>
                <Text style={styles.boldText}>
                  {data.employees.first_name}{" "}
                  {data.employees.middle_name ?? " "} {data.employees.last_name}
                  ,
                </Text>
                <Text>{employeeAddressData?.address_line_1},</Text>
                <Text>
                  {employeeAddressData?.state}, {employeeAddressData?.city},
                </Text>
                <Text>
                  {employeeAddressData?.country} -{" "}
                  {employeeAddressData?.pincode}
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
              content={replacePlaceholders(data?.content, replacements)}
            />
          </View>

          {/* Closing Section */}
          <View style={styles.signatureSection}>
            {data?.include_signatuory && (
              <View style={styles.signatureBox}>
                <View>
                  <Text style={styles.boldText}>Yours truly,</Text>
                  <Text style={styles.boldText}>
                    For Canny Management Services Pvt. Ltd
                  </Text>
                </View>
                <Text>Director</Text>
              </View>
            )}
            {data?.include_employee_signature && (
              <View style={styles.signatureBox}>
                <View>
                  <Text style={styles.boldText}>
                    I accept the contract of employment with the terms and
                    conditions contained thereto
                  </Text>
                </View>
                <Text>__________________________________________</Text>
              </View>
            )}
          </View>
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
