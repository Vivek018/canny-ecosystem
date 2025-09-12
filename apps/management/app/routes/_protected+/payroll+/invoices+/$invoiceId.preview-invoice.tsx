import { LetterFooter } from "@/components/employees/employee/letters/letter-templates/letter-footer";
import { LetterHeader } from "@/components/employees/employee/letters/letter-templates/letter-header";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCannyCompanyIdByName,
  getCompanyById,
  getInvoiceById,
  getReimbursementEntriesByInvoiceIdForInvoicePreview,
  getRelationshipsByParentAndChildCompanyId,
  type EmployeeProjectAssignmentDataType,
  getExitEntriesByPayrollIdForInvoicePreview,
  getLocationById,
  getSalaryEntriesForInvoiceByInvoiceId,
  getUserById,
  getPrimaryLocationByCompanyId,
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
  formatNumber,
  getMonthNameFromNumber,
  numberToWords,
  replaceUnderscore,
  roundToNearest,
} from "@canny_ecosystem/utils";
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
  CANNY_MANAGEMENT_SERVICES_GSTIN,
  CANNY_MANAGEMENT_SERVICES_HSN_CODE_NUMBER,
  CANNY_MANAGEMENT_SERVICES_NAME,
  CANNY_MANAGEMENT_SERVICES_PAN_NUMBER,
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
    marginTop: 20,
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
  location,
  companyAddress,
}: {
  type: string;
  data: DataTypeForRegister;
  terms: any;
  proofType: string;
  location: LocationDatabaseRow;
  companyAddress: LocationDatabaseRow | null;
}) => {
  const allEarningFields = Array.from(
    new Set(
      data.employeeData.flatMap(
        (emp) => emp?.earnings?.map((e) => e.name) ?? []
      )
    )
  );
  const allDeductionFields = Array.from(
    new Set(
      data.employeeData.flatMap(
        (emp) => emp?.deductions?.map((e) => e.name) ?? []
      )
    )
  );
  const earningTotals: Record<string, number> = {};
  const deductionTotals: Record<string, number> = {};

  for (const emp of data.employeeData) {
    if (emp?.earnings) {
      for (const e of emp.earnings) {
        const key = e.name;
        const amount = Number(e.amount ?? 0);
        earningTotals[key] = (earningTotals[key] || 0) + amount;
      }
    }

    if (emp?.deductions) {
      for (const d of emp.deductions) {
        const key = d.name;
        const amount = Number(d.amount ?? 0);
        deductionTotals[key] = (deductionTotals[key] || 0) + amount;
      }
    }
  }

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
    roundToNearest(totalGross) +
    roundToNearest(
      Number(
        data?.invoiceDetails?.payroll_data?.find(
          (item) => item.field.trim() === "PF" || item.field.trim() === "EPF"
        )?.amount ?? 0
      )
    ) +
    roundToNearest(
      Number(
        data?.invoiceDetails?.payroll_data?.find(
          (item) => item.field.trim() === "ESIC" || item.field.trim() === "ESI"
        )?.amount ?? 0
      )
    );

  const sum = data?.invoiceDetails?.payroll_data
    ?.filter((item) => item.in_service_charge === true)
    ?.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0);

  const service_charge =
    type === "salary"
      ? data.invoiceDetails?.include_charge
        ? roundToNearest((sum * terms.service_charge) / 100)
        : 0
      : data.invoiceDetails?.include_charge
        ? roundToNearest(
            (Number(
              data?.invoiceDetails?.payroll_data.reduce(
                (sum, item) => sum + Number(item.amount),
                0
              )
            ) *
              terms.reimbursement_charge) /
              100
          )
        : 0;

  const total =
    type === "salary"
      ? roundToNearest(beforeService) + roundToNearest(service_charge)
      : roundToNearest(
          Number(data?.invoiceDetails?.payroll_data[0].amount) + service_charge
        );

  const cgst =
    data.invoiceDetails?.include_cgst &&
    data.invoiceDetails?.include_sgst &&
    !data.invoiceDetails?.include_igst
      ? roundToNearest((total * 9) / 100)
      : 0;
  const sgst =
    data.invoiceDetails?.include_cgst &&
    data.invoiceDetails?.include_sgst &&
    !data.invoiceDetails?.include_igst
      ? roundToNearest((total * 9) / 100)
      : 0;
  const igst =
    !data.invoiceDetails?.include_cgst &&
    !data.invoiceDetails?.include_sgst &&
    data.invoiceDetails?.include_igst
      ? roundToNearest((total * 18) / 100)
      : 0;

  const grand_total = total + cgst + sgst + igst;

  const calculatedValues = {
    [`Service Charge @ ${
      type === "salary" ? terms?.service_charge : terms?.reimbursement_charge
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
        {data.invoiceDetails?.include_header && (
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
            Date :{" "}
            {data?.invoiceDetails?.date
              ? String(formatDate(data?.invoiceDetails?.date))
              : ""}
          </Text>
        </View>

        <View style={[styles.companyDetails]}>
          <View style={{ gap: 1 }}>
            <Text>{data?.companyData?.name}</Text>
            <Text>{location?.address_line_1}</Text>
            <Text>{location?.address_line_2}</Text>
            <Text>
              {location?.city}-{location?.pincode},{" "}
              {location?.state?.toUpperCase()}
            </Text>
            <Text>GSTIN : {location?.gst_number}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <Text>Contact Person :- {data.invoiceDetails?.user_id}</Text>
          <Text>{data.invoiceDetails?.additional_text}</Text>
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

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flex: 5,
              paddingVertical: 2,
              paddingRight: 12,
              paddingLeft: 4,
            }}
          >
            <Text style={{ fontFamily: "Helvetica" }}>
              {data?.invoiceDetails?.subject}
            </Text>
            {type === "salary" && (
              <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 25 }}>
                Total Employees : {data.employeeData.length ?? 0}
              </Text>
            )}
          </View>

          <View style={{ flex: 5.5, flexDirection: "row" }}>
            <View style={{ flex: 2 }}>
              {data?.invoiceDetails?.payroll_data?.map((field, index) => (
                <View
                  key={(index + 1).toString()}
                  style={{ paddingVertical: 2, paddingHorizontal: 4 }}
                >
                  <Text
                    style={{
                      fontFamily: "Helvetica",
                      textTransform: "capitalize",
                    }}
                  >
                    {field.field}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }}>
              {data?.invoiceDetails?.payroll_data?.map((field, index) => {
                let amount = field.amount;
                const trimmed = field.field.trim();
                if (trimmed === "ESIC" || trimmed === "ESI") {
                  amount =
                    data?.invoiceDetails?.payroll_data?.find(
                      (item) =>
                        item.field.trim() === "ESIC" ||
                        item.field.trim() === "ESI"
                    )?.amount ?? 0;
                } else if (trimmed === "PF" || trimmed === "EPF") {
                  amount =
                    data?.invoiceDetails?.payroll_data?.find(
                      (item) =>
                        item.field.trim() === "PF" ||
                        item.field.trim() === "EPF"
                    )?.amount ?? 0;
                }

                return (
                  <View
                    key={(index + 2).toString()}
                    style={{ paddingVertical: 2, paddingHorizontal: 6 }}
                  >
                    <Text style={{ fontFamily: "Helvetica" }}>
                      {Number(amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

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

        {array?.map((field, index) => (
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
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: field.bold ? "Helvetica-Bold" : "Helvetica",
                  }}
                >
                  {field.label}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  textAlign: "left",
                  paddingLeft: 4,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: field.bold ? "Helvetica-Bold" : "Helvetica",
                  }}
                >
                  {calculatedValues[
                    field.label as keyof typeof calculatedValues
                  ] || 0}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={{ flex: 1, padding: 3, marginTop: -23 }}>
            <Text>
              HSN CODE NO. :- {CANNY_MANAGEMENT_SERVICES_HSN_CODE_NUMBER}
            </Text>
            <Text>PAN NO. :- {CANNY_MANAGEMENT_SERVICES_PAN_NUMBER}</Text>
            <Text>GSTIN :- {CANNY_MANAGEMENT_SERVICES_GSTIN}</Text>
            <Text>
              TOTAL GSTIN AMOUNT :-{" "}
              {igst === 0 ? (cgst + sgst).toFixed(0) : igst.toFixed(0)}
            </Text>
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

          {data.invoiceDetails?.include_header && <LetterFooter />}
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
                companyAddress?.address_line_1
              }, ${companyAddress?.address_line_2 ?? ""} ${
                companyAddress?.city
              }, ${companyAddress?.state}, ${companyAddress?.pincode}`}</Text>
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
            <View style={[styles.headerCell, { flex: 0.13 }]}>
              <Text>Sr.no.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.5 }]}>
              <Text>EMP. CODE</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.5 }]}>
              <Text>ESIC No.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.53 }]}>
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
            {data.employeeData?.[0]?.earnings.map((earningField, index) => (
              <View
                key={index.toString()}
                style={[styles.headerCell, { flex: 0.3 }]}
              >
                <Text>{earningField.name}</Text>
              </View>
            ))}
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>GROSS</Text>
            </View>
            {data.employeeData?.[0]?.deductions.map((deductionField, index) => (
              <View
                key={index.toString()}
                style={[styles.headerCell, { flex: 0.3 }]}
              >
                <Text>{deductionField.name}</Text>
              </View>
            ))}
            <View style={[styles.headerCell, { flex: 0.22 }]}>
              <Text>Total Ded.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.35 }]}>
              <Text>Net Pay</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.15 }]}>
              <Text>Sign</Text>
            </View>
          </View>

          {data.employeeData?.map((employee, index) => (
            <View
              key={index.toString()}
              style={[styles.tableHeader, { borderTop: "1pt solid #000000" }]}
            >
              <View style={[styles.headerCell, { flex: 0.13 }]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.5 }]}>
                <Text>{employee?.employeeData?.employee_code}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.5 }]}>
                <Text>{employee?.employeeStatutoryDetails?.esic_number}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.53 }]}>
                <Text>{employee?.employeeStatutoryDetails?.uan_number}</Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.7 }]}>
                <Text>
                  {employee?.employeeData?.first_name}{" "}
                  {employee?.employeeData?.last_name}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.4 }]}>
                <Text>{location.city}</Text>
              </View>
              <View
                style={[
                  styles.headerCell,
                  { flex: 0.4, textTransform: "capitalize" },
                ]}
              >
                <Text>
                  {replaceUnderscore(
                    employee.employeeProjectAssignmentData?.position
                  )}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.2 }]}>
                <Text>{employee?.attendance?.paid_days}</Text>
              </View>
              {employee?.earnings.map((earningField, index) => (
                <View
                  key={index.toString()}
                  style={[styles.headerCell, { flex: 0.3 }]}
                >
                  <Text>{formatNumber(earningField.amount)}</Text>
                </View>
              ))}

              <View style={[styles.headerCell, { flex: 0.3 }]}>
                <Text>
                  {roundToNearest(
                    Number(
                      employee?.earnings.reduce(
                        (sum, earning) => sum + earning.amount,
                        0
                      )
                    )
                  )}
                </Text>
              </View>
              {employee?.deductions.map((deductionField, index) => (
                <View
                  key={index.toString()}
                  style={[styles.headerCell, { flex: 0.3 }]}
                >
                  <Text>{formatNumber(deductionField.amount)}</Text>
                </View>
              ))}

              <View style={[styles.headerCell, { flex: 0.22 }]}>
                <Text>
                  {roundToNearest(
                    Number(
                      employee?.deductions.reduce(
                        (sum, deduction) => sum + deduction?.amount,
                        0
                      )
                    )
                  )}
                </Text>
              </View>
              <View style={[styles.headerCell, { flex: 0.35 }]}>
                <Text>
                  {roundToNearest(
                    Number(
                      employee?.earnings.reduce(
                        (sum, earning) => sum + earning?.amount,
                        0
                      )
                    ) -
                      Number(
                        employee?.deductions.reduce(
                          (sum, deduction) => sum + deduction?.amount,
                          0
                        )
                      )
                  )}
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
            <View style={[styles.headerCell, { flex: 0.13 }]} />
            <View style={[styles.headerCell, { flex: 0.5 }]} />
            <View style={[styles.headerCell, { flex: 0.5 }]} />
            <View style={[styles.headerCell, { flex: 0.53 }]} />
            <View style={[styles.headerCell, { flex: 0.7 }]} />
            <View style={[styles.headerCell, { flex: 0.4 }]} />
            <View style={[styles.headerCell, { flex: 0.4 }]} />
            <View style={[styles.headerCell, { flex: 0.2 }]} />
            {allEarningFields.map((field, index) => (
              <View
                key={index.toString()}
                style={[styles.headerCell, { flex: 0.3 }]}
              >
                <Text>{earningTotals[field] ?? 0}</Text>
              </View>
            ))}

            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                {roundToNearest(
                  Number(
                    data.employeeData.reduce((sum, emp) => {
                      const earningSum = emp?.earnings?.reduce(
                        (acc, d) => acc + Number(d?.amount ?? 0),
                        0
                      );
                      return sum + earningSum;
                    }, 0)
                  )
                )}
              </Text>
            </View>
            {allDeductionFields.map((field, index) => (
              <View
                key={index.toString()}
                style={[styles.headerCell, { flex: 0.3 }]}
              >
                <Text>{deductionTotals[field] ?? 0}</Text>
              </View>
            ))}

            <View style={[styles.headerCell, { flex: 0.22 }]}>
              <Text>
                {roundToNearest(
                  Number(
                    data.employeeData.reduce((sum, emp) => {
                      const deductionSum = emp?.deductions?.reduce(
                        (acc, d) => acc + Number(d?.amount ?? 0),
                        0
                      );
                      return sum + deductionSum;
                    }, 0)
                  )
                )}
              </Text>
            </View>

            <View style={[styles.headerCell, { flex: 0.35 }]}>
              <Text>
                {roundToNearest(
                  Number(
                    data.employeeData.reduce((sum, emp) => {
                      const earningSum = emp?.earnings?.reduce(
                        (acc, d) => acc + Number(d?.amount ?? 0),
                        0
                      );
                      return sum + earningSum;
                    }, 0)
                  ) -
                    Number(
                      data.employeeData.reduce((sum, emp) => {
                        const deductionSum = emp?.deductions?.reduce(
                          (acc, d) => acc + Number(d?.amount ?? 0),
                          0
                        );
                        return sum + deductionSum;
                      }, 0)
                    )
                )}
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.15 }]} />
          </View>

          <View
            wrap={false}
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
                ),
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
                value: service_charge,
              },
              { label: "Total C.T.C", value: total },
              {
                label: "IGST (18%)",
                value: igst === 0 ? cgst + sgst : igst,
              },
              {
                label: "Total Bill Amount",
                value: grand_total,
                bold: true,
              },
            ]?.map((item, index) => (
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

          {data.employeeData?.map((employee, index) => (
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

  const { data: companyAddress } = await getPrimaryLocationByCompanyId({
    companyId,
    supabase,
  });

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

  const { data: employeeCompanyData } = await getCompanyById({
    supabase,
    id: companyId,
  });
  let userData = null;
  if (invoiceData?.user_id) {
    const { data } = await getUserById({
      id: invoiceData?.user_id,
      supabase,
    });

    userData = data;
  }

  const { data: locationData } = await getLocationById({
    id: invoiceData?.company_address_id!,
    supabase,
  });

  let payrollDataAndOthers = [] as any[];

  if (invoiceData?.type === "salary") {
    const { data } = await getSalaryEntriesForInvoiceByInvoiceId({
      supabase,
      invoiceId: invoiceData?.id!,
    });

    payrollDataAndOthers = data || [];
  }
  if (invoiceData?.type === "reimbursement" || invoiceData?.type === "exit") {
    const { data: reimb } =
      await getReimbursementEntriesByInvoiceIdForInvoicePreview({
        supabase,
        invoiceId: invoiceData?.id!,
      });
    const { data: exit }: { data: any } =
      await getExitEntriesByPayrollIdForInvoicePreview({
        supabase,
        invoiceId: invoiceData?.id!,
      });
    payrollDataAndOthers =
      invoiceData?.type === "reimbursement" ? (reimb ?? []) : (exit ?? []);
  }

  let contentType: string | undefined = undefined;

  if (invoiceData?.proof) {
    const response = await fetch(invoiceData?.proof!);
    contentType = response.headers.get("Content-Type") || undefined;
  }

  return {
    data: {
      employeeCompanyData,
      locationData,
      payrollDataAndOthers,
      invoiceData,
    },
    userData,
    locationData,
    companyAddress,
    companyRelations: companyRelations?.terms,
    contentType,
  };
}

export default function PreviewInvoice() {
  const {
    data,
    companyRelations,
    locationData,
    contentType,
    userData,
    companyAddress,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  let registerData = [] as any;

  if (data?.invoiceData?.type === "salary") {
    function transformDataForSalary(data: any) {
      const company = data.employeeCompanyData;
      const invoice = data.invoiceData;

      const companyData = {
        name: company?.name,
      };

      const invoiceDetails = {
        invoice_number: invoice?.invoice_number,
        date: invoice?.date,
        subject: invoice?.subject,
        company_address_id: invoice?.company_address_id,
        payroll_data: invoice?.payroll_data,
        include_cgst: invoice?.include_cgst,
        include_sgst: invoice?.include_sgst,
        include_igst: invoice?.include_igst,
        include_charge: invoice?.include_charge,
        include_proof: invoice?.include_proof,
        include_header: invoice?.include_header,
        invoice_type: invoice?.invoice_type,
        proof: invoice?.proof,
        additional_text: invoice?.additional_text,
        user_id: `${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`,
      };

      interface EmployeeEarningsOrDeductions {
        name: string;
        amount: number;
      }

      // Preferred order for earnings and deductions
      const preferredEarningsOrder = ["BASIC", "DA", "HRA"];
      const preferredDeductionsOrder = ["PF", "ESIC", "PT"];

      const employeeData: any[] = data.payrollDataAndOthers?.map((emp: any) => {
        const earnings: EmployeeEarningsOrDeductions[] = [];
        const deductions: EmployeeEarningsOrDeductions[] = [];

        // Collect all earnings and deductions
        const allEarnings: EmployeeEarningsOrDeductions[] = [];
        const allDeductions: EmployeeEarningsOrDeductions[] = [];
        for (const entry of emp.salary_entries.salary_field_values) {
          const entryItem: EmployeeEarningsOrDeductions = {
            name: entry.payroll_fields.name,
            amount: entry.amount,
          };
          if (entry.payroll_fields.type === "earning") {
            allEarnings.push(entryItem);
          } else if (entry.payroll_fields.type === "deduction") {
            allDeductions.push(entryItem);
          }
        }

        const earningsMap = new Map(allEarnings.map((e) => [e.name, e]));
        for (const field of preferredEarningsOrder) {
          if (earningsMap.has(field)) {
            earnings.push(earningsMap.get(field)!);
          }
        }
        for (const e of allEarnings) {
          if (!preferredEarningsOrder.includes(e.name)) {
            earnings.push(e);
          }
        }

        const deductionsMap = new Map(allDeductions.map((d) => [d.name, d]));
        for (const field of preferredDeductionsOrder) {
          if (deductionsMap.has(field)) {
            deductions.push(deductionsMap.get(field)!);
          }
        }
        for (const d of allDeductions) {
          if (!preferredDeductionsOrder.includes(d.name)) {
            deductions.push(d);
          }
        }

        return {
          employeeData: {
            first_name: emp?.employee?.first_name,
            middle_name: emp?.employee?.middle_name,
            last_name: emp?.employee?.last_name,
            employee_code: emp?.employee?.employee_code,
          },
          employeeProjectAssignmentData: {
            position: emp.employee?.employee_project_assignment?.position || "",
            department:
              emp.employee?.employee_project_assignment?.department || "",
          },
          employeeStatutoryDetails: {
            pf_number:
              emp.employee?.employee_statutory_details?.pf_number || "",
            esic_number:
              emp.employee?.employee_statutory_details?.esic_number || "",
            uan_number:
              emp.employee?.employee_statutory_details?.uan_number || "",
          },
          attendance: {
            working_days: emp?.working_days ?? 0,
            weekly_off: 5,
            paid_holidays: emp?.paid_holidays ?? 0,
            paid_days: emp?.present_days,
            paid_leaves: emp?.paid_leaves ?? 0,
            casual_leaves: emp?.casual_leaves ?? 0,
            absents: emp?.absent_days ?? 0,
          },
          earnings,
          deductions,
        };
      });

      return {
        month: getMonthNameFromNumber(data.payrollDataAndOthers[0]?.month),
        year: data.payrollDataAndOthers[0]?.year,
        companyData,
        employeeData,
        invoiceDetails,
      };
    }

    registerData = transformDataForSalary(data);
  }

  if (
    data?.invoiceData?.type === "reimbursement" ||
    data?.invoiceData?.type === "exit"
  ) {
    function transformReimbursementDataForPayroll(data: any, type: string) {
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
        company_address_id: invoice?.company_address_id,
        payroll_data: invoice?.payroll_data,
        include_cgst: invoice?.include_cgst,
        include_sgst: invoice?.include_sgst,
        include_igst: invoice?.include_igst,
        include_charge: invoice?.include_charge,
        include_proof: invoice?.include_proof,
        include_header: invoice?.include_header,
        type: invoice?.type,
        proof: invoice?.proof,
        additional_text: invoice?.additional_text,
        user_id: `${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`,
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
      if (type === "reimbursement") {
        for (const emp of data.payrollDataAndOthers) {
          for (const entry of emp.reimbursements) {
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
                  amount: entry?.amount,
                },
              ],
            });
          }
        }
      }
      if (type === "exit") {
        for (const emp of data.payrollDataAndOthers) {
          for (const entry of emp.exits) {
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
      }
      return {
        companyData,
        employeeData,
        invoiceDetails,
      };
    }

    registerData = transformReimbursementDataForPayroll(
      data,
      data?.invoiceData?.type
    );
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
            location={locationData as unknown as LocationDatabaseRow}
            type={data?.invoiceData?.type!}
            companyAddress={companyAddress as unknown as LocationDatabaseRow}
            proofType={contentType as string}
          />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
