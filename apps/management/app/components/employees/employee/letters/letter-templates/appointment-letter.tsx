import type { CompanyInfoDataType } from "@/routes/_protected+/employees+/$employeeId+/letters+/$letterId";
import type { EmployeeWithLetterDataType } from "@canny_ecosystem/supabase/queries";
import {
  formatDate,
  replacePlaceholders,
  replaceUnderscore,
  styles,
} from "@canny_ecosystem/utils";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { LetterHeader } from "./letter-header";
import type { EmployeeAddressDatabaseRow } from "@canny_ecosystem/supabase/types";
import { MarkdownRenderer } from "../markdown-renderer";

export function AppointmentLetter({
  data,
  employeeAddressData,
  companyData,
  salaryData,
}: {
  data: EmployeeWithLetterDataType | null;
  employeeAddressData: Omit<
    EmployeeAddressDatabaseRow,
    "created_at" | "updated_at"
  > | null;
  companyData: CompanyInfoDataType | null;
  salaryData: any;
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
    employeePosition:
      data?.employees.employee_project_assignment?.position ?? "",
    companyName: companyData?.data?.name ?? "",
    compantAddress: companyData?.locationData?.address_line_1 ?? "",
    companyCity: companyData?.locationData?.city ?? "",
    siteName:
      data?.employees.employee_project_assignment?.project_sites?.name ?? "",
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
          <View>
            <Text style={styles.headerDate}>
              Date: {formatDate(data?.date ?? "")}
            </Text>
          </View>

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
          {data?.include_employee_address && employeeAddressData && (
            <View style={styles.recipient}>
              <Text>To,</Text>
              <Text style={styles.boldText}>
                {data.employees.first_name} {data.employees.middle_name ?? " "}{" "}
                {data.employees.last_name},
              </Text>
              <Text>{employeeAddressData?.address_line_1 ?? "-"},</Text>
              <Text>
                {employeeAddressData?.state ?? "-"},{" "}
                {employeeAddressData?.city ?? "-"},
              </Text>
              <Text>
                {employeeAddressData?.country ?? "-"} -{" "}
                {employeeAddressData?.pincode ?? "-"}
              </Text>
            </View>
          )}
          <View style={[styles.title, styles.underlineText]}>
            <Text>{data?.subject}</Text>
          </View>
          <View style={styles.text} />
          <View style={styles.section}>
            <MarkdownRenderer
              content={replacePlaceholders(data?.content, replacements) ?? ""}
            />
          </View>
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

      {/* Salary Structure Page */}
      <Page size="A4" style={styles.page}>
        {data?.include_letter_head && (
          <View style={styles.header} fixed>
            <LetterHeader />
          </View>
        )}
        <View style={styles.wrapper}>
          <View style={styles.title}>
            <Text style={[styles.boldText, styles.underlineText]}>
              SALARY STRUCTURE LETTER
            </Text>
          </View>
          <View style={styles.section} />
          <View style={styles.section}>
            <Text>
              Dear {data?.employees.gender === "male" ? "Mr." : "Ms."}{" "}
              {data?.employees.first_name} {data?.employees.middle_name ?? " "}{" "}
              {data?.employees.last_name},
            </Text>
            <Text>
              Date:{" "}
              {data?.employees.employee_project_assignment?.start_date
                ?.split("-")
                .reverse()
                .join("-")}
            </Text>
            <Text>
              Ref: {companyData?.data?.name}{" "}
              {data?.employees.employee_project_assignment?.project_sites
                ?.name ?? "--"}
            </Text>
            <Text>
              Further to your employment with us, your salary for the period of
              employment with effect is as follows:
            </Text>
          </View>

          {/* Salary Table */}
          {salaryData && (
            <View style={styles.tableContainer}>
              <View>
                <Text style={[styles.boldText, { marginHorizontal: "auto" }]}>
                  YOUR TOTAL COST OF COMPANY WILL BE AS BELOW:
                </Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <View style={styles.tableRow}>
                    <Text style={styles.th}>GROSS SALARY</Text>
                  </View>
                </View>
                <View style={styles.tableBody}>
                  {Object.entries(
                    Object.assign(
                      {},
                      salaryData?.earning ? salaryData?.earning : {},
                      salaryData?.statutory_contribution
                        ? salaryData?.statutory_contribution
                        : {},
                      salaryData?.others ? salaryData?.others : {},
                    ),
                  ).map((salary) => {
                    return (
                      <View key={salary[0]} style={styles.tableRow}>
                        <Text style={styles.tableCell}>
                          {replaceUnderscore(salary[0]) as string}
                        </Text>
                        <Text style={styles.tableCell}>
                          Rs. {salary[1] ? `${salary[1].toString()}/-` : "--"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.boldText]}>
                    Gross Salary
                  </Text>
                  <Text style={[styles.tableCell, styles.boldText]}>
                    Rs. 14127/-
                  </Text>
                </View>
                <View style={styles.tableHeader}>
                  <View style={styles.tableRow}>
                    <Text style={styles.th}>
                      CTC
                    </Text>
                  </View>
                </View>
                {Object.entries(
                  Object.assign(
                    {},
                    salaryData?.deduction !== undefined || salaryData?.deduction
                      ? salaryData?.deduction
                      : {},
                    salaryData?.statutory_contribution
                      ? salaryData?.statutory_contribution
                      : {},
                  ),
                ).map((salary) => {
                  return (
                    <View key={salary[0]} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {replaceUnderscore(salary[0])}
                      </Text>
                      <Text style={styles.tableCell}>
                        Rs. {salary[1] ? `${salary[1].toString()}/-` : "--"}
                      </Text>
                    </View>
                  );
                })}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.boldText]}>
                    Net Salary
                  </Text>
                  <Text style={[styles.tableCell, styles.boldText]}>
                    Rs. 12,232/-
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.boldText]}>
                    Total Gross C.T.C:
                  </Text>
                  <Text style={[styles.tableCell, styles.boldText]}>
                    Rs. 17,408/-
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Final Acceptance Section */}
          <View style={styles.section}>
            <Text>The net salary is subject to Income Tax.</Text>
            <Text style={styles.keyPoints}>
              All other terms and conditions as per your Work Assignment Letter
              & Letter of Engagement remain unchanged until further notice. You
              may sign a copy of this letter and return it back to us as an
              unconditional token of acceptance.
            </Text>
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
