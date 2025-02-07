import type { CompanyInfoDataType } from "@/routes/_protected+/employees+/$employeeId+/letters+/$letterId";
import type { EmployeeWithLetterDataType } from "@canny_ecosystem/supabase/queries";
import { formatDate, replaceUnderscore, styles } from "@canny_ecosystem/utils";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { LetterHeader } from "./letter-header";

export function AppointmentLetter({
  data,
  companyData,
  salaryData,
}: {
  data: EmployeeWithLetterDataType | null;
  companyData: CompanyInfoDataType | null;
  salaryData: any;
}) {
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

          {/* Date Section */}
          {data?.include_letter_head && (
            <View>
              <Text style={styles.headerDate}>
                Date: {formatDate(data?.date ?? "")}
              </Text>
            </View>
          )}

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

          <View style={[styles.title, styles.underlineText]}>
            <Text>{data?.subject}</Text>
          </View>

          {/* Appointment Letter Section */}
          <View style={styles.section}>
            <Text>
              Dear {data?.employees.gender === "male" ? "Mr." : "Ms."}{" "}
              {data?.employees.first_name} {data?.employees.middle_name ?? " "}{" "}
              {data?.employees.last_name},
            </Text>
            <Text>
              With reference to your application and subsequent interview and
              discussion that you had with us, we are pleased to offer you the
              position of{" "}
              <Text style={styles.boldText}>
                "{data?.employees.employee_project_assignment.position}"
              </Text>{" "}
              in our organization Contract at {companyData?.data?.name}{" "}
              {data?.employees.employee_project_assignment.project_sites.name}{" "}
              w.e.f.{" "}
              <Text style={styles.boldText}>
                {data?.employees.employee_project_assignment.start_date
                  .split("-")
                  .reverse()
                  .join("-")}
              </Text>
              .
            </Text>
          </View>

          <View style={styles.text} />

          {/* Terms and Conditions */}
          <View style={styles.section}>
            <View style={styles.keyPoints}>
              <View>
                <Text style={[styles.boldText, styles.underlineText]}>
                  With the following terms and conditions:
                </Text>
              </View>

              <View>
                <Text>
                  With reference to your application and subsequent interview
                  and discussion that you had with us, we are pleased to offer
                  you the position of “
                  {data?.employees.employee_project_assignment.position}” in our
                  organization Contract {companyData?.data?.name}{" "}
                  {
                    data?.employees.employee_project_assignment.project_sites
                      .name
                  }{" "}
                  w.e.f.{" "}
                  <Text style={styles.boldText}>
                    {data?.employees.employee_project_assignment.start_date
                      .split("-")
                      .reverse()
                      .join("-")}
                  </Text>
                </Text>
              </View>
              <View>
                <Text style={styles.boldText}>
                  1. POSTING AND REPORTING STRUCTURE:
                </Text>
                <Text>
                  You will be posted at our Contract in{" "}
                  {companyData?.data?.name} and you would report to Site in
                  Charge for smooth functioning. You will interact directly with
                  other seniors/supervisors as well.
                </Text>
              </View>

              <View>
                <Text style={styles.boldText}>2. PROBATION:</Text>
                <Text>
                  You will be on probation for a period of three months from the
                  date of appointment. The probation period will be extendable
                  at the discretion of management until it is satisfied with
                  your work and conduct during the probationary period. You
                  shall be deemed to be on probation until a letter of
                  confirmation is issued to you in writing.
                </Text>
              </View>

              <View>
                <Text style={styles.boldText}>
                  3. RESIGNATION / TERMINATION:
                </Text>
                <Text>
                  During the period of probation, the company may terminate your
                  service on 24 hours' notice. Should you choose to resign
                  during the period of probation, you must provide 24 hours'
                  notice. After being confirmed, the company can terminate your
                  service without assigning any reason by giving one month's
                  notice or salary in lieu, and vice versa.
                </Text>
              </View>

              <View>
                <Text style={styles.boldText}>
                  4. PERFORMANCE EVALUATION - INCREMENT:
                </Text>
                <Text>
                  Annual increment will depend upon your consistent performance
                  and will not be a matter of right. The company reserves the
                  right to grant or withhold annual increment as it may deem
                  fit.
                </Text>
              </View>

              <View>
                <Text style={styles.boldText}>5. TRANSFER:</Text>
                <Text>
                  Your services are transferable to any other
                  site/department/branch/office, etc., as existing with us at
                  the time of transfer.
                </Text>

                <Text style={styles.boldText}>6. CONFIDENTIAL AGREEMENT:</Text>
                <Text>
                  Any employee should not disclose the confidential information
                  of the organization and clients with anybody outside the
                  organization during and after the service tenure. Any deed
                  done by the employee using his/her or somebody else's
                  system/workplace which may lead to damages/legal implications,
                  any liability arising out of such deeds will be borne by the
                  employee himself/herself.
                </Text>
              </View>

              <View>
                <Text style={styles.boldText}>7. JURISDICTION:</Text>
                <Text>
                  In case of any dispute, the courts in the city of Ahmedabad
                  will have jurisdiction.
                </Text>
              </View>

              <View>
                <Text style={styles.boldText}>
                  8. ABSENCE OR UNAUTHORIZED LEAVE:
                </Text>
                <Text>
                  Unauthorized leave or absence for a continuous period of 8
                  days would make you lose your lien in the service, and you
                  will be considered to have abandoned your service of your own
                  accord, and the same shall automatically come to an end
                  without any notice or intimation to you.
                </Text>
              </View>
            </View>
          </View>

          {/* Acceptance Section */}
          <View style={styles.section}>
            <Text>
              If the above terms and conditions are acceptable to you, please
              sign the duplicate copy of the appointment letter as an
              acknowledgment and submit the same along with the recruitment
              papers.
            </Text>
            <Text>
              With the best wishes for a happy and long association with Canny
              Management Services Pvt. Ltd.
            </Text>
          </View>

          {data?.include_signatuory && (
            <View style={styles.signatureSection}>
              <View style={styles.signatureBox}>
                <View>
                  <Text style={styles.boldText}>Yours truly,</Text>
                  <Text style={styles.boldText}>
                    For Canny Management Services Pvt. Ltd
                  </Text>
                </View>
                <Text>Director</Text>
              </View>
            </View>
          )}
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
              {data?.employees.employee_project_assignment.start_date
                .split("-")
                .reverse()
                .join("-")}
            </Text>
            <Text>
              Ref: {companyData?.data?.name}{" "}
              {data?.employees.employee_project_assignment.project_sites.name}
            </Text>
            <Text>
              Further to your employment with us, your salary for the period of
              employment with effect is as follows:
            </Text>
          </View>

          {/* Salary Table */}
          <View style={styles.tableContainer}>
            <View style={styles.table}>
              <View>
                <Text style={[styles.boldText, { marginHorizontal: "auto" }]}>
                  YOUR TOTAL COST OF COMPANY WILL BE AS BELOW:
                </Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={styles.boldText}>GROSS SALARY</Text>
              </View>
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
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.boldText]}>
                  Gross Salary
                </Text>
                <Text style={[styles.tableCell, styles.boldText]}>
                  Rs. 14127/-
                </Text>
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

          {data?.include_signatuory && (
            <View style={styles.signatureSection}>
              <View style={styles.signatureBox}>
                <Text>For, Canny Management Services Pvt Ltd.</Text>
                <Text>Authorized Signatory</Text>
              </View>

              <View style={styles.signatureBox}>
                <View>
                  <Text>
                    I accept the contract of employment with the terms and
                    conditions contained thereto.
                  </Text>
                  <View style={styles.text} />
                  <Text>
                    {data?.employees.first_name}{" "}
                    {data?.employees.middle_name ?? " "}{" "}
                    {data?.employees.last_name},
                  </Text>
                </View>
                <Text>(Signature & Date)</Text>
              </View>
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
