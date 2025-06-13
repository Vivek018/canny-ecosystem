import { LetterFooter } from "@/components/employees/employee/letters/letter-templates/letter-footer";
import { LetterHeader } from "@/components/employees/employee/letters/letter-templates/letter-header";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCannyCompanyIdByName,
  getCompanyById,
  getInvoiceById,
  getPayrollById,
  getPayrollEntriesByPayrollIdForPayrollRegister,
  getPrimaryLocationByCompanyId,
  getRelationshipsByParentAndChildCompanyId,
  getSalaryEntriesByPayrollIdForSalaryRegister,
  type EmployeeProjectAssignmentDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  CompanyDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  InvoiceDatabaseRow,
  LocationDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { Dialog, DialogContent } from "@canny_ecosystem/ui/dialog";
import {
  formatDate,
  numberToWords,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { months } from "@canny_ecosystem/utils/constant";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import {
  Document,
  Image,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { CANNY_NAME } from "../payroll-history+/$payrollId+/_reports+/create-invoice";
import {
  CANNY_MANAGEMENT_SERVICES_ADDRESS,
  CANNY_MANAGEMENT_SERVICES_NAME,
} from "@/constant";

const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    position: "absolute",
    top: 2,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
  },

  basicInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
  },
  companyDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 25,
  },
  subject: {
    marginTop: 20,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  mainHeader: {
    marginTop: 30,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainRows: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainTotal: {
    marginTop: 35,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
  },
  pageRegister: {
    fontSize: 12,
    padding: 10,
    fontFamily: "Helvetica",
  },
  titleText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  monthText: {
    fontSize: 12,
    color: "#444444",
  },
  tableHeader: {
    fontFamily: "Helvetica-Bold",
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    borderLeft: "1pt solid #000000",
    borderRight: "1pt solid #000000",
    borderBottom: "1pt solid #000000",
  },
  headerCell: {
    paddingVertical: 3,
    paddingHorizontal: "1",
    fontFamily: "Helvetica",
    fontSize: 8,
    textAlign: "center",
    borderLeft: "0.5pt solid #000000",
    borderRight: "0.5pt solid #000000",
  },

  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  companyAddress: {
    fontSize: 9,
    color: "#444444",
    marginBottom: 2,
  },
  form: {
    fontSize: 6,
    color: "#444444",
    marginTop: 2,
  },
  proof: {
    padding: 10,
  },
});

type DataTypeForRegister = {
  month?: string;
  year?: number;
  payrollData: PayrollDatabaseRow;
  companyData: CompanyDatabaseRow & LocationDatabaseRow;
  employeeData: {
    attendance?: {
      working_days: number;
      weekly_off: number;
      paid_holidays: number;
      paid_days: number;
      paid_leaves: number;
      casual_leaves: number;
      absents: number;
    };
    employeeData: EmployeeDatabaseRow;
    employeeProjectAssignmentData?: EmployeeProjectAssignmentDataType;
    employeeStatutoryDetails?: EmployeeStatutoryDetailsDatabaseRow;
    invoiceFields?: {
      name: string;
      amount: number;
    }[];
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  }[];
  invoiceDetails: InvoiceDatabaseRow & { payroll_data: any[] };
};

const InvoicePDF = ({
  data,
  terms,
  type,
  proofType,
}: {
  type: string;
  data: DataTypeForRegister;
  terms: any;
  proofType: string;
}) => {
  const array = [
    {
      label: `Service Charge @ ${
        type === "salary" ? terms.service_charge : terms.reimbursement_charge
      }%`,
      border: false,
    },
    { label: "Total", border: true },
    { label: "C.G.S.T @ 9%", border: false },
    { label: "S.G.S.T @ 9%", border: false },
    { label: "I.G.S.T @ 18%", border: false },
    { label: "Grand Total", border: true, bold: true },
  ];

  const totalGross =
    data?.invoiceDetails?.payroll_data
      ?.filter((item) => item.type === "earning")
      ?.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;

  const beforeService =
    totalGross +
    Number(
      data?.invoiceDetails?.payroll_data?.find(
        (item) => item.field === "PF" || item.field === "EPF"
      )?.amount ?? 0
    ) +
    Number(
      data?.invoiceDetails?.payroll_data?.find(
        (item) => item.field === "ESIC" || item.field === "ESI"
      )?.amount ?? 0
    );

  const includedFields = terms?.include_service_charge
    ?.split(",")
    .map((f: string) => f.trim().toUpperCase());

  const sum = data?.invoiceDetails?.payroll_data
    ?.filter((item) => includedFields?.includes(item.field.toUpperCase()))
    ?.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0);

  const service_charge =
    type === "salary"
      ? data.invoiceDetails.include_charge
        ? includedFields?.includes("ALL")
          ? (beforeService * terms.service_charge) / 100
          : (sum * terms.service_charge) / 100
        : 0
      : data.invoiceDetails.include_charge
      ? (Number(
          data?.invoiceDetails?.payroll_data.reduce(
            (sum, item) => sum + Number(item.amount),
            0
          )
        ) *
          terms.reimbursement_charge) /
        100
      : 0;

  const total =
    type === "salary"
      ? beforeService + service_charge
      : Number(data?.invoiceDetails?.payroll_data[0].amount) + service_charge;

  const cgst =
    data.invoiceDetails.include_cgst &&
    data.invoiceDetails.include_sgst &&
    !data.invoiceDetails.include_igst
      ? (total * 9) / 100
      : 0;
  const sgst =
    data.invoiceDetails.include_cgst &&
    data.invoiceDetails.include_sgst &&
    !data.invoiceDetails.include_igst
      ? (total * 9) / 100
      : 0;
  const igst =
    !data.invoiceDetails.include_cgst &&
    !data.invoiceDetails.include_sgst &&
    data.invoiceDetails.include_igst
      ? (total * 18) / 100
      : 0;

  const grand_total = total + cgst + sgst + igst;

  const calculatedValues = {
    [`Service Charge @ ${
      type === "salary" ? terms.service_charge : terms.reimbursement_charge
    }%`]: service_charge,
    Total: total,
    "C.G.S.T @ 9%": cgst,
    "S.G.S.T @ 9%": sgst,
    "I.G.S.T @ 18%": igst,
    "Grand Total": grand_total,
  };

  return (
    <Document title="fdgzdfgfsg" subject="uhydhsu" author="dassaas">
      <Page size="A4" style={styles.page}>
        {data.invoiceDetails.include_header && (
          <View style={styles.header} fixed>
            <LetterHeader />
          </View>
        )}

        <View style={[styles.basicInfo]}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Invoice no : {data?.invoiceDetails?.invoice_number}
          </Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Tax-Invoice</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Date : {formatDate(data?.invoiceDetails?.date)}
          </Text>
        </View>

        <View style={[styles.companyDetails]}>
          <View style={{ gap: 1 }}>
            <Text>{data?.companyData?.name}</Text>
            <Text>{data?.companyData?.address_line_1}</Text>
            <Text>{data?.companyData?.address_line_2}</Text>
            <Text>
              {data?.companyData.city}-{data?.companyData.pincode},{" "}
              {data?.companyData?.state?.toUpperCase()}
            </Text>
            <Text>GSTIN : SE593484848</Text>
          </View>
        </View>

        <View style={[styles.mainHeader]}>
          <View
            style={{
              flex: 5,
              textAlign: "left",
              borderBottom: "1pt solid #000000",
              padding: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
              }}
            >
              Particulars
            </Text>
          </View>
          <View
            style={{
              flex: 5.5,
              flexDirection: "row",
              gap: 20,
              borderBottom: "1pt solid #000000",
            }}
          >
            <View
              style={{
                flex: 2,
                textAlign: "left",
                padding: 4,
              }}
            >
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Fields</Text>
            </View>
            <View
              style={{
                flex: 1,
                textAlign: "left",
                padding: 4,
              }}
            >
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Amount</Text>
            </View>
          </View>
        </View>

        {data?.invoiceDetails?.payroll_data.map((field, index) => (
          <View key={index.toString()} style={[styles.mainRows]}>
            {index === 0 ? (
              <View
                style={{
                  flex: 5,
                  textAlign: "left",
                  padding: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Helvetica",
                  }}
                >
                  {data?.invoiceDetails?.subject}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  flex: 5,
                  textAlign: "left",
                  padding: 4,
                }}
              />
            )}
            <View style={{ flex: 5.5, flexDirection: "row", gap: 20 }}>
              <View
                style={{
                  flex: 2,
                  textAlign: "left",
                  padding: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Helvetica",
                    textTransform: "capitalize",
                  }}
                >
                  {field.field === "REIMBURSEMENT"
                    ? replaceUnderscore(data?.invoiceDetails?.invoice_type)
                    : field.field}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: 4,
                }}
              >
                <Text style={{ fontFamily: "Helvetica" }}>
                  {field.field === "ESIC" || field.field === "ESI"
                    ? Number(
                        data?.invoiceDetails?.payroll_data?.find(
                          (item) =>
                            item.field === "ESIC" || item.field === "ESI"
                        )?.amount ?? 0
                      )
                    : field.field === "PF" || field.field === "EPF"
                    ? Number(
                        data?.invoiceDetails?.payroll_data?.find(
                          (item) => item.field === "PF" || item.field === "EPF"
                        )?.amount ?? 0
                      )
                    : field.amount}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View
          style={[
            styles.mainRows,
            data?.invoiceDetails?.payroll_data.length > 4
              ? { marginVertical: 10 }
              : { marginVertical: 40 },
          ]}
        >
          <View
            style={{
              flex: 5,
              textAlign: "left",
              padding: 4,
            }}
          />

          <View style={{ flex: 5.35, flexDirection: "row" }}>
            <View
              style={{
                flex: 2.5,
                textAlign: "center",
                padding: 4,
              }}
            />
            <View
              style={{
                flex: 2.5,
                textAlign: "center",
                padding: 4,
              }}
            />
          </View>
        </View>

        {array.map((field, index) => (
          <View key={index.toString()} style={[styles.mainRows]}>
            {index === 0 ? (
              <View
                style={{
                  flex: 5,
                  textAlign: "left",
                  padding: 4,
                }}
              />
            ) : (
              <View
                style={{
                  flex: 5,
                  textAlign: "left",
                  padding: 4,
                }}
              />
            )}
            <View style={{ flex: 5.5, flexDirection: "row" }}>
              <View
                style={{
                  flex: 2,
                  textAlign: "left",
                  padding: 4,
                }}
              >
                <Text style={{ fontFamily: "Helvetica" }}>{field.label}</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: field.bold ? "Helvetica-Bold" : "Helvetica",
                  }}
                >
                  {calculatedValues[
                    field.label as keyof typeof calculatedValues
                  ]?.toFixed(2) || 0}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={{ flex: 1, padding: 3, marginTop: -23 }}>
            <Text>HSN CODE NO. : </Text>
            <Text>PAN NO. : </Text>
            <Text>GSTIN : </Text>
            <Text>TOTAL GSTIN AMOUNT : </Text>
          </View>
          <View
            style={{ flex: 1.1, borderTop: "1pt solid #000000", padding: 3 }}
          >
            <Text
              style={{ textTransform: "capitalize", fontFamily: "Courier" }}
            >
              Rupees :- {numberToWords(grand_total)} Only
            </Text>
          </View>
        </View>

        <Text
          style={{
            marginTop: 10,
            borderTop: "1pt solid #000000",
            paddingTop: 10,
          }}
        >
          Note :- Payment made only cross Cheque or DD favour of Canny
          Management Services Pvt. Ltd. payable at Ahmedabad
        </Text>

        <View style={[styles.footer, { gap: 10 }]} fixed>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 30,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 3,
              }}
            >
              <Text>______________________________</Text>
              <Text>Receiver's signature with seal</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 40 }}>
              <Text>For. CANNY MANAGEMENT SERVICES PVT. LTD.</Text>
              <Text>Authorized signature</Text>
            </View>
          </View>

          {data.invoiceDetails.include_header && <LetterFooter />}
        </View>
      </Page>
      {type === "salary" ? (
        <Page size="A4" orientation="landscape" style={styles.pageRegister}>
          {/* Company Header */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.companyName}>{data.companyData?.name}</Text>
              <Text style={styles.companyAddress}>{`${
                data?.companyData?.address_line_1
              }, ${data?.companyData?.address_line_2 ?? ""} ${
                data?.companyData?.city
              }, ${data?.companyData?.state}, ${
                data?.companyData?.pincode
              }`}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>
                {CANNY_MANAGEMENT_SERVICES_NAME}
              </Text>
              <Text style={styles.companyAddress}>
                {CANNY_MANAGEMENT_SERVICES_ADDRESS}
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={[
                styles.monthText,
                {
                  marginVertical: "3",
                  marginHorizontal: "auto",
                },
              ]}
            >
              {`Salary For The Month of : ${data?.month} ${data?.year}`}
            </Text>
          </View>

          <View
            style={[
              styles.tableHeader,
              { borderTop: "1pt solid #000000", marginTop: "22" },
            ]}
          >
            <View style={[styles.headerCell, { flex: 0.1 }]}>
              <Text>Sr. No.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.6 }]}>
              <Text>EMP. CODE</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.5 }]}>
              <Text>ESIC No.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.6 }]}>
              <Text>UAN NO.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.7 }]}>
              <Text>EMPLOYEE NAME</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>Location</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>Designation</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.2 }]}>
              <Text>Present Days</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>BASIC</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>HRA</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>LTA</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>Others</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>GROSS</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>P.F. (12%)</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>ESIC (0.75%)</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.2 }]}>
              <Text>P.Tax</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>Total Ded.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>Bonus (8.33%)</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>Net Pay</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.15 }]}>
              <Text>Sign</Text>
            </View>
          </View>

          {data.employeeData.map((employee, index) => (
            <View
              key={index.toString()}
              style={[styles.tableHeader, { borderTop: "1pt solid #000000" }]}
            >
              <View style={[styles.headerCell, { flex: 0.1 }]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.6 }]}>
                <Text>{employee?.employeeData?.employee_code}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.5 }]}>
                <Text>{employee?.employeeStatutoryDetails?.esic_number}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.6 }]}>
                <Text>{employee?.employeeStatutoryDetails?.uan_number}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.7 }]}>
                <Text>
                  {employee?.employeeData?.first_name}{" "}
                  {employee?.employeeData?.middle_name}{" "}
                  {employee?.employeeData?.last_name}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>{}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>{employee.employeeProjectAssignmentData?.position}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.2 }]}>
                <Text>{employee?.attendance?.paid_days}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {Number(
                    employee?.earnings?.find((item) => item.name === "BASIC")
                      ?.amount ?? 0
                  ) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {Number(
                    employee?.earnings?.find((item) => item.name === "HRA")
                      ?.amount ?? 0
                  ) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {Number(
                    employee?.earnings?.find((item) => item.name === "LTA")
                      ?.amount ?? 0
                  ) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {Number(
                    employee?.earnings?.find((item) => item.name === "Others")
                      ?.amount ?? 0
                  ) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {Number(
                    employee?.earnings
                      .reduce((sum, earning) => sum + earning.amount, 0)
                      ?.toFixed(2)
                  )}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>
                  {Number(
                    employee?.deductions?.find(
                      (item) => item.name === "EPF" || item.name === "PF"
                    )?.amount ?? 0
                  ).toFixed(2) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {Number(
                    employee?.deductions?.find(
                      (item) => item.name === "ESI" || item.name === "ESIC"
                    )?.amount ?? 0
                  ).toFixed(2) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.2 }]}>
                <Text>
                  {Number(
                    employee?.deductions?.find((item) => item.name === "PT")
                      ?.amount ?? 0
                  ) || 0}
                </Text>
              </View>

              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>
                  {Number(
                    employee?.deductions.reduce(
                      (sum, earning) => sum + earning?.amount,
                      0
                    )
                  ).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>
                  {Number(
                    employee?.deductions?.find((item) => item.name === "BONUS")
                      ?.amount ?? 0
                  ).toFixed(2) || 0}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>
                  {(
                    Number(
                      employee?.earnings
                        .reduce((sum, earning) => sum + earning?.amount, 0)
                        ?.toFixed(2)
                    ) -
                    Number(
                      employee?.deductions
                        .reduce((sum, earning) => sum + earning?.amount, 0)
                        ?.toFixed(2)
                    )
                  )?.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.15 }]} />
            </View>
          ))}
          <View
            style={[
              styles.tableHeader,
              { borderTop: "1pt solid #000000", marginTop: 8 },
            ]}
          >
            <View style={[styles.headerCell, { flex: 0.1 }]} />
            <View style={[styles.headerCell, { flex: 0.6 }]} />
            <View style={[styles.headerCell, { flex: 0.5 }]} />
            <View style={[styles.headerCell, { flex: 0.6 }]} />
            <View style={[styles.headerCell, { flex: 0.7 }]} />
            <View style={[styles.headerCell, { flex: 0.4 }]} />
            <View style={[styles.headerCell, { flex: 0.4 }]} />
            <View style={[styles.headerCell, { flex: 0.2 }]} />
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "BASIC"
                  )?.amount ?? 0
                ) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "HRA"
                  )?.amount ?? 0
                ) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "LTA"
                  )?.amount ?? 0
                ) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "Others"
                  )?.amount ?? 0
                ) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {Number(
                  data.employeeData.reduce((sum, emp) => {
                    const earningSum = emp?.earnings?.reduce(
                      (acc, d) => acc + Number(d?.amount ?? 0),
                      0
                    );
                    return sum + earningSum;
                  }, 0)
                )}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "EPF" || item.field === "PF"
                  )?.amount ?? 0
                ).toFixed(2) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "ESI" || item.field === "ESIC"
                  )?.amount ?? 0
                ).toFixed(2) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.2 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "PT"
                  )?.amount ?? 0
                ) || 0}
              </Text>
            </View>

            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>
                {Number(
                  data.employeeData
                    .reduce((sum, emp) => {
                      const deductionSum = emp?.deductions?.reduce(
                        (acc, d) => acc + Number(d?.amount ?? 0),
                        0
                      );
                      return sum + deductionSum;
                    }, 0)
                    .toFixed(2)
                )}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>
                {Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "BONUS"
                  )?.amount ?? 0
                ).toFixed(2) || 0}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>
                {Number(
                  data.employeeData.reduce((sum, emp) => {
                    const earningSum = emp?.earnings?.reduce(
                      (acc, d) => acc + Number(d?.amount ?? 0),
                      0
                    );
                    return sum + earningSum;
                  }, 0)
                ) +
                  Number(
                    data?.invoiceDetails?.payroll_data?.find(
                      (item) => item.field === "BONUS"
                    )?.amount ?? 0
                  ) -
                  Number(
                    data.employeeData
                      .reduce((sum, emp) => {
                        const deductionSum = emp?.deductions?.reduce(
                          (acc, d) => acc + Number(d?.amount ?? 0),
                          0
                        );
                        return sum + deductionSum;
                      }, 0)
                      .toFixed(2)
                  )}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.15 }]} />
          </View>

          <View
            style={{
              fontSize: 9,
              width: 250,
              marginTop: 20,
              marginHorizontal: "auto",
              padding: 5,
              gap: 5,
              border: "1pt solid #000000",
              borderRadius: 10,
            }}
          >
            {[
              {
                label: "Basic",
                value: Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "BASIC"
                  )?.amount ?? 0
                ).toFixed(2),
              },
              {
                label: "HRA and Others",
                value:
                  totalGross -
                  Number(
                    data?.invoiceDetails?.payroll_data?.find(
                      (item) => item.field === "BASIC"
                    )?.amount ?? 0
                  ),
              },
              {
                label: "P.F. (13%)",
                value: Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "PF" || item.field === "EPF"
                  )?.amount ?? 0
                ),
              },
              {
                label: "ESIC (3.25%)",
                value: Number(
                  data?.invoiceDetails?.payroll_data?.find(
                    (item) => item.field === "ESIC" || item.field === "ESI"
                  )?.amount ?? 0
                ),
              },
              {
                label: `Service Charge (${
                  type === "salary"
                    ? terms.service_charge
                    : terms.reimbursement_charge
                }%)`,
                value: service_charge.toFixed(2),
              },
              { label: "Total C.T.C", value: total.toFixed(2) },
              {
                label: "IGST (18%)",
                value: igst === 0 ? (cgst + sgst).toFixed(2) : igst.toFixed(2),
              },
              {
                label: "Total Bill Amount",
                value: grand_total.toFixed(2),
                bold: true,
              },
            ].map((item, index) => (
              <View
                key={index.toString()}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Helvetica-Bold",
                    width: 150,
                    paddingHorizontal: 5,
                    borderBottom: "0.1pt solid #000000",
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    width: 100,
                    textAlign: "left",
                    borderBottom: "0.1pt solid #000000",
                    fontFamily: item.bold ? "Helvetica-Bold" : "Helvetica",
                  }}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      ) : (
        <Page size="A4" style={styles.pageRegister}>
          {/* Company Header */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.companyName}>{data.companyData?.name}</Text>
              <Text style={styles.companyAddress}>{`${
                data?.companyData?.address_line_1
              }, ${data?.companyData?.address_line_2 ?? ""} ${
                data?.companyData?.city
              }, ${data?.companyData?.state}, ${
                data?.companyData?.pincode
              }`}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>
                {CANNY_MANAGEMENT_SERVICES_NAME}
              </Text>
              <Text style={styles.companyAddress}>
                {CANNY_MANAGEMENT_SERVICES_ADDRESS}
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={[
                styles.monthText,
                {
                  marginVertical: "3",
                  marginHorizontal: "auto",
                  textTransform: "capitalize",
                },
              ]}
            >
              {type}
            </Text>
          </View>

          <View
            style={[
              styles.tableHeader,
              { borderTop: "1pt solid #000000", marginTop: "22" },
            ]}
          >
            <View style={[styles.headerCell, { flex: 1 }]}>
              <Text>Sr. No.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 3 }]}>
              <Text>EMP. CODE</Text>
            </View>
            <View style={[styles.headerCell, { flex: 5 }]}>
              <Text>Name</Text>
            </View>
            <View style={[styles.headerCell, { flex: 3 }]}>
              <Text>Amount</Text>
            </View>
            <View style={[styles.headerCell, { flex: 1 }]}>
              <Text>Signature</Text>
            </View>
          </View>

          {data.employeeData.map((employee, index) => (
            <View
              key={index.toString()}
              style={[styles.tableHeader, { borderTop: "1pt solid #000000" }]}
            >
              <View style={[styles.headerCell, { flex: 1 }]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 3 }]}>
                <Text>{employee?.employeeData?.employee_code}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 5 }]}>
                <Text>
                  {employee?.employeeData?.first_name}{" "}
                  {employee?.employeeData?.middle_name}{" "}
                  {employee?.employeeData?.last_name}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 3 }]}>
                <Text>{employee?.invoiceFields?.[0]?.amount ?? 0}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 1 }]} />
            </View>
          ))}
          <View
            style={[
              styles.tableHeader,
              { borderTop: "1pt solid #000000", marginTop: 8 },
            ]}
          >
            <View style={[styles.headerCell, { flex: 1 }]} />
            <View style={[styles.headerCell, { flex: 3 }]} />
            <View style={[styles.headerCell, { flex: 5 }]}>
              <Text>Total</Text>
            </View>
            <View style={[styles.headerCell, { flex: 3 }]}>
              <Text>{data?.invoiceDetails?.payroll_data[0]?.amount}</Text>
            </View>
            <View style={[styles.headerCell, { flex: 1 }]} />
          </View>
        </Page>
      )}

      {data?.invoiceDetails?.proof && proofType?.startsWith("image/") && (
        <Page size="A4" style={styles.page}>
          <Image src={`${data?.invoiceDetails?.proof}`} style={styles.proof} />
        </Page>
      )}
    </Document>
  );
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const invoiceId = params.invoiceId as string;
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: cannyData, error } = await getCannyCompanyIdByName({
    name: CANNY_NAME,
    supabase,
  });
  if (error) {
    throw new Error("Error fetching company ID");
  }

  let companyRelations = [] as any;
  if (cannyData?.id) {
    const { data } = await getRelationshipsByParentAndChildCompanyId({
      childCompanyId: cannyData?.id,
      parentCompanyId: companyId,
      supabase,
    });
    companyRelations = (data ?? []) as unknown as any;
  }

  let invoiceData = null;
  let invoiceError = null;
  if (invoiceId) {
    ({ data: invoiceData, error: invoiceError } = await getInvoiceById({
      supabase,
      id: invoiceId,
    }));
  }
  if (invoiceError) {
    console.error(invoiceError);
  }

  const { data: payroll } = await getPayrollById({
    payrollId: invoiceData?.payroll_id!,
    supabase,
  });

  const { data: employeeCompanyData } = await getCompanyById({
    supabase,
    id: companyId,
  });

  const { data: employeesCompanyLocationData } =
    await getPrimaryLocationByCompanyId({ supabase, companyId });

  let payrollDataAndOthers = [] as any[];

  if (payroll?.payroll_type === "salary") {
    const { data } = await getSalaryEntriesByPayrollIdForSalaryRegister({
      supabase,
      payrollId: invoiceData?.payroll_id!,
    });

    payrollDataAndOthers = data || [];
  }
  if (
    payroll?.payroll_type === "reimbursement" ||
    payroll?.payroll_type === "exit"
  ) {
    const { data } = await getPayrollEntriesByPayrollIdForPayrollRegister({
      supabase,
      payrollId: invoiceData?.payroll_id!,
    });
    payrollDataAndOthers = data || [];
  }

  let contentType: string | undefined = undefined;
  if (invoiceData?.proof) {
    const response = await fetch(invoiceData?.proof!);
    contentType = response.headers.get("Content-Type") || undefined;
  }

  return {
    data: {
      employeeCompanyData,
      employeesCompanyLocationData,
      payrollDataAndOthers,
      invoiceData,
    },
    payroll,
    companyRelations: companyRelations?.terms,
    contentType,
  };
}

export default function PreviewInvoice() {
  const { data, payroll, companyRelations, contentType } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  let registerData = [] as any;

  if (payroll?.payroll_type === "salary") {
    function transformDataForSalary(data: any) {
      const company = data.employeeCompanyData;
      const location = data.employeesCompanyLocationData;
      const invoice = data.invoiceData;

      const companyData = {
        name: company?.name,
        address_line_1: location?.address_line_1,
        address_line_2: location?.address_line_2,
        city: location?.city,
        state: location?.state,
        pincode: location?.pincode,
      };
      const invoiceDetails = {
        invoice_number: invoice?.invoice_number,
        date: invoice?.date,
        subject: invoice?.subject,
        payroll_data: invoice?.payroll_data,
        include_cgst: invoice?.include_cgst,
        include_sgst: invoice?.include_sgst,
        include_igst: invoice?.include_igst,
        include_charge: invoice?.include_charge,
        include_proof: invoice?.include_proof,
        include_header: invoice?.include_header,
        invoice_type: invoice?.invoice_type,
        proof: invoice?.proof,
      };

      interface SalaryEntry {
        field_name: string;
        amount: number;
        type: "earning" | "statutory_contribution";
        present_days: number;
        month: number;
        year: number;
      }
      interface Leaves {
        start_date: string;
        end_date: string;
        leave_type:
          | "casual_leave"
          | "paid_leave"
          | "sick_leave"
          | "paternity_leave"
          | "unpaid_leave";
      }

      interface EmployeeProjectAssignment {
        position: string;
        department: string;
      }

      interface EmployeeStatutoryDetails {
        pf_number: string;
        esic_number: string;
        uan_number: string;
      }

      interface EmployeeAttendance {
        working_days: number;
        absents: number;
      }

      interface EmployeeData {
        first_name: string;
        middle_name: string;
        last_name: string;
        employee_code: string;
      }

      interface TransformedEmployeeData {
        employeeData: EmployeeData;
        employeeProjectAssignmentData: EmployeeProjectAssignment;
        employeeStatutoryDetails: EmployeeStatutoryDetails;
        attendance: EmployeeAttendance;
      }
      interface EmployeeEarningsOrDeductions {
        name: string;
        amount: number;
      }
      function getMonthName(monthNumber: number) {
        const entry = Object.entries(months).find(
          ([, value]) => value === monthNumber
        );
        return entry ? entry[0] : undefined;
      }

      const attendanceData =
        data?.payrollDataAndOthers[0].salary_entries[0] || {};

      const employeeData: TransformedEmployeeData[] =
        data.payrollDataAndOthers.map(
          (emp: {
            first_name: string;
            middle_name: string;
            last_name: string;
            employee_code: string;
            employee_project_assignment?: EmployeeProjectAssignment;
            employee_statutory_details?: EmployeeStatutoryDetails;
            salary_entries: SalaryEntry[];
            leaves: Leaves[];
          }) => {
            const earnings: EmployeeEarningsOrDeductions[] = [];
            const deductions: EmployeeEarningsOrDeductions[] = [];

            for (const entry of emp.salary_entries) {
              const entryItem: EmployeeEarningsOrDeductions = {
                name: entry.field_name,
                amount: entry.amount,
              };

              if (entry.type === "earning") {
                earnings.push(entryItem);
              } else if (entry.type === "statutory_contribution") {
                deductions.push(entryItem);
              }
            }
            const targetYear = emp.salary_entries[0]?.year;
            const targetMonth = emp.salary_entries[0]?.month;

            const monthStart = new Date(targetYear, targetMonth - 1, 1);
            const monthEnd = new Date(targetYear, targetMonth, 0);

            const stripTime = (d: Date) =>
              new Date(d.getFullYear(), d.getMonth(), d.getDate());

            const casualLeaves =
              emp.leaves?.reduce((total, leave) => {
                if (leave.leave_type === "casual_leave") {
                  const leaveStart = stripTime(new Date(leave?.start_date));
                  const leaveEnd = stripTime(new Date(leave?.end_date));

                  const overlapStart =
                    leaveStart < monthStart
                      ? stripTime(monthStart)
                      : leaveStart;
                  const overlapEnd =
                    leaveEnd > monthEnd ? stripTime(monthEnd) : leaveEnd;

                  if (overlapStart > overlapEnd) return total;

                  const timeDiff =
                    overlapEnd.getTime() - overlapStart.getTime();
                  const daysInMonth =
                    Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

                  return total + daysInMonth;
                }
                return total;
              }, 0) || 0;

            const paidLeaves =
              emp.leaves?.reduce((total, leave) => {
                if (leave.leave_type === "paid_leave") {
                  const leaveStart = stripTime(new Date(leave?.start_date));
                  const leaveEnd = stripTime(new Date(leave?.end_date));

                  const overlapStart =
                    leaveStart < monthStart
                      ? stripTime(monthStart)
                      : leaveStart;
                  const overlapEnd =
                    leaveEnd > monthEnd ? stripTime(monthEnd) : leaveEnd;

                  if (overlapStart > overlapEnd) return total;

                  const timeDiff =
                    overlapEnd.getTime() - overlapStart.getTime();
                  const daysInMonth =
                    Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

                  return total + daysInMonth;
                }
                return total;
              }, 0) || 0;

            return {
              employeeData: {
                first_name: emp?.first_name,
                middle_name: emp?.middle_name,
                last_name: emp?.last_name,
                employee_code: emp?.employee_code,
              },
              employeeProjectAssignmentData: {
                position: emp.employee_project_assignment?.position || "",
                department: emp.employee_project_assignment?.department || "",
              },
              employeeStatutoryDetails: {
                pf_number: emp.employee_statutory_details?.pf_number || "",
                esic_number: emp.employee_statutory_details?.esic_number || "",
                uan_number: emp.employee_statutory_details?.uan_number || "",
              },
              attendance: {
                working_days: 26,
                weekly_off: 5,
                paid_holidays: 0,
                paid_days: emp?.salary_entries[0]?.present_days,
                paid_leaves: paidLeaves,
                casual_leaves: casualLeaves,
                absents: 26 - Number(emp?.salary_entries[0]?.present_days),
              },
              earnings,
              deductions,
            };
          }
        );

      return {
        month: getMonthName(attendanceData?.month),
        year: attendanceData?.year,
        companyData,
        employeeData,
        invoiceDetails,
      };
    }

    registerData = transformDataForSalary(data);
  }
  if (
    payroll?.payroll_type === "reimbursement" ||
    payroll?.payroll_type === "exit"
  ) {
    function transformDataForPayroll(data: any, type: string) {
      const company = data.employeeCompanyData;
      const location = data.employeesCompanyLocationData;
      const invoice = data.invoiceData;

      const companyData = {
        name: company?.name,
        address_line_1: location?.address_line_1,
        address_line_2: location?.address_line_2,
        city: location?.city,
        state: location?.state,
        pincode: location?.pincode,
      };

      const invoiceDetails = {
        invoice_number: invoice?.invoice_number,
        date: invoice?.date,
        subject: invoice?.subject,
        payroll_data: invoice?.payroll_data,
        include_cgst: invoice?.include_cgst,
        include_sgst: invoice?.include_sgst,
        include_igst: invoice?.include_igst,
        include_charge: invoice?.include_charge,
        include_proof: invoice?.include_proof,
        include_header: invoice?.include_header,
        invoice_type: invoice?.invoice_type,
        proof: invoice?.proof,
      };

      interface EmployeeData {
        first_name: string;
        middle_name: string;
        last_name: string;
        employee_code: string;
      }
      interface TransformedEmployeeEntry {
        employeeData: EmployeeData;
        invoiceFields: EmployeeEarningsOrDeductions[];
      }

      interface EmployeeEarningsOrDeductions {
        name: string;
        amount: number;
      }

      const employeeData: TransformedEmployeeEntry[] = [];

      for (const emp of data.payrollDataAndOthers) {
        for (const entry of emp.payroll_entries) {
          employeeData.push({
            employeeData: {
              first_name: emp?.first_name,
              middle_name: emp?.middle_name,
              last_name: emp?.last_name,
              employee_code: emp?.employee_code,
            },
            invoiceFields: [
              {
                name: type.toUpperCase(),
                amount: entry.amount,
              },
            ],
          });
        }
      }

      return {
        companyData,
        employeeData,
        invoiceDetails,
      };
    }

    registerData = transformDataForPayroll(data, payroll?.payroll_type);
  }

  if (!isDocument) return <div>Loading...</div>;

  const handleOpenChange = () => {
    navigate("/payroll/invoices");
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0"
        disableIcon={true}
      >
        <PDFViewer width="100%" height="100%">
          <InvoicePDF
            data={registerData as unknown as DataTypeForRegister}
            terms={companyRelations}
            type={payroll?.payroll_type!}
            proofType={contentType as string}
          />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
