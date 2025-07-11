import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { Dialog, DialogContent } from "@canny_ecosystem/ui/dialog";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  type EmployeeProjectAssignmentDataType,
  getCompanyById,
  getPrimaryLocationByCompanyId,
  getSalaryEntriesByPayrollIdForSalaryRegister,
} from "@canny_ecosystem/supabase/queries";
import {
  CANNY_MANAGEMENT_SERVICES_ADDRESS,
  CANNY_MANAGEMENT_SERVICES_NAME,
  numberToWordsIndian,
  SALARY_SLIP_TITLE,
} from "@/constant";
import type {
  CompanyDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  LocationDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  formatDate,
  getMonthNameFromNumber,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { useSalaryEntriesStore } from "@/store/salary-entries";

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: "20 10",
    fontFamily: "Helvetica",
    fontSize: 8,
    backgroundColor: "#FFFFFF",
  },
  titleText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginHorizontal: "auto",
    marginBottom: 5,
  },
  monthText: {
    fontSize: 10,
    color: "#444444",
  },
  companyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  companyAddress: {
    fontSize: 8,
    color: "#444444",
    marginBottom: 2,
  },
  form: {
    fontSize: 7,
    color: "#444444",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
  },
  cell: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 3,
  },
  header: {
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#999999",
    fontSize: 8,
    fontStyle: "italic",
  },
  dashedLine: {
    position: "relative",
    bottom: 9,
    borderBottom: "1pt dashed black",
  },
});

type DataType = {
  month: string;
  year: number;
  payrollData: PayrollDatabaseRow;
  companyData: CompanyDatabaseRow & LocationDatabaseRow;
  employeeData: {
    attendance: {
      working_days: number;
      weekly_off: number;
      paid_holidays: number;
      paid_days: number;
      paid_leaves: number;
      casual_leaves: number;
      absents: number;
    };
    bankDetails: { bank: string; account_number: number };
    employeeData: EmployeeDatabaseRow;
    employeeProjectAssignmentData: EmployeeProjectAssignmentDataType;
    employeeStatutoryDetails: EmployeeStatutoryDetailsDatabaseRow;
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  }[];
};

function chunkArray(array: any, size: number) {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

const SalarySlipsPDF = ({ data }: { data: DataType }) => {
  const employeeChunks = chunkArray(data.employeeData, 2);

  return (
    <Document>
      {employeeChunks.map((chunk, pageIndex) => (
        <Page key={pageIndex.toString()} size="A4" style={styles.page}>
          {/* Header */}

          {chunk.map((emp: any, i: number) => {
            const earningsTotal = emp.earnings.reduce(
              (acc: number, e: any) => acc + e.amount,
              0
            );
            const deductionTotal = emp.deductions.reduce(
              (acc: number, d: any) => acc + d.amount,
              0
            );
            const netAmount = earningsTotal - deductionTotal;

            return (
              <View key={i.toString()} wrap={false}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.companyName}>
                      {data?.companyData?.name}
                    </Text>
                    <Text style={styles.companyAddress}>
                      {`${data?.companyData?.address_line_1 || ""}, ${
                        data?.companyData?.address_line_2 || ""
                      }, ${data?.companyData?.city}, ${
                        data?.companyData?.state
                      }, ${data?.companyData?.pincode}`}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>
                      {CANNY_MANAGEMENT_SERVICES_NAME}
                    </Text>
                    <Text style={styles.companyAddress}>
                      {CANNY_MANAGEMENT_SERVICES_ADDRESS}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ flex: 1 }} />
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        textAlign: "right",
                      }}
                    >
                      Salary Slip -{" "}
                    </Text>
                    <Text
                      style={{
                        color: "#444444",
                        fontSize: 8,
                        textAlign: "left",
                      }}
                    >
                      {SALARY_SLIP_TITLE}
                    </Text>
                  </View>
                  <Text style={[{ fontSize: 8, flex: 1, textAlign: "right" }]}>
                    For the Month of {data.month} - {data.year}
                  </Text>
                </View>

                <View style={styles.section}>
                  <View style={styles.row}>
                    <Text style={[styles.cell, { flex: 1 }]}>Emp.Id</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp.employeeData.employee_code}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>P.F. No.</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp.employeeStatutoryDetails.pf_number}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.cell, { flex: 1 }]}>Emp. Name</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp.employeeData.first_name}{" "}
                      {emp.employeeData.middle_name}{" "}
                      {emp.employeeData.last_name}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>UAN No.</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp.employeeStatutoryDetails.uan_number}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.cell, { flex: 1 }]}>Designation</Text>
                    <Text
                      style={[
                        styles.cell,
                        { flex: 2, textTransform: "capitalize" },
                      ]}
                    >
                      {replaceUnderscore(
                        emp.employeeProjectAssignmentData.position
                      )}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>ESI No.</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp.employeeStatutoryDetails.esic_number || "-"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.cell, { flex: 1 }]}>Location</Text>
                    <Text
                      style={[
                        styles.cell,
                        { flex: 2, textTransform: "capitalize" },
                      ]}
                    >
                      {data.companyData.city}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Bank</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp?.bankDetails?.bank ?? "-"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.cell, { flex: 1 }]}>D.O.J</Text>
                    <Text
                      style={[
                        styles.cell,
                        { flex: 2, textTransform: "capitalize" },
                      ]}
                    >
                      <>
                        {formatDate(
                          emp.employeeProjectAssignmentData.date_of_joining
                        )}
                      </>
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>A/c No.</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>
                      {emp?.bankDetails?.account_number ?? "-"}
                    </Text>
                  </View>
                  <View style={[styles.row]}>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      Working Days : {emp.attendance.working_days}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      Paid Days : {emp.attendance.paid_days}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      Absents : {emp.attendance.absents}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      Paid Leaves : {emp.attendance.paid_leaves}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      Casual Leaves : {emp.attendance.casual_leaves}
                    </Text>
                  </View>
                  <View style={[styles.row, styles.header, { marginTop: 10 }]}>
                    <Text style={[styles.cell, { flex: 1 }]}>Earnings</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Amount</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Deductions</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Amount</Text>
                  </View>
                  {Array.from({
                    length: Math.max(
                      emp.earnings.length,
                      emp.deductions.length
                    ),
                  }).map((_, idx) => (
                    <View style={styles.row} key={idx.toString()}>
                      <Text style={[styles.cell, { flex: 1 }]}>
                        {emp.earnings[idx]?.name || ""}
                      </Text>
                      <Text style={[styles.cell, { flex: 1 }]}>
                        {emp.earnings[idx]?.amount?.toFixed(2) || ""}
                      </Text>
                      <Text style={[styles.cell, { flex: 1 }]}>
                        {emp.deductions[idx]?.name || ""}
                      </Text>
                      <Text style={[styles.cell, { flex: 1 }]}>
                        {emp.deductions[idx]?.amount?.toFixed(2) || ""}
                      </Text>
                    </View>
                  ))}

                  <View style={[styles.row, { backgroundColor: "#d0ebff" }]}>
                    <Text style={[styles.cell, { flex: 1 }]}>Gross Income</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      {earningsTotal.toFixed(2)}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      Total Deductions
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>
                      {deductionTotal.toFixed(2)}
                    </Text>
                  </View>
                  <View
                    style={[styles.row, { borderTop: "1pt solid #000000" }]}
                  >
                    <View style={{ flex: 2, flexDirection: "row" }}>
                      <Text
                        style={[
                          styles.cell,
                          { flex: 2, fontFamily: "Courier" },
                        ]}
                      >
                        Rupees
                      </Text>
                      <Text
                        style={[
                          styles.cell,
                          {
                            flex: 2,
                            textTransform: "capitalize",
                            fontFamily: "Courier",
                          },
                        ]}
                      >
                        {numberToWordsIndian(Number(netAmount.toFixed(2)))}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 2,
                        backgroundColor: "#d0f0c0",
                      }}
                    >
                      <Text style={[styles.cell, { flex: 2 }]}>Net Amount</Text>
                      <Text style={[styles.cell, { flex: 2 }]}>
                        Rs. {netAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.footer}>
                    This is computer generated statement hence does not require
                    a signature.
                  </Text>
                </View>
                <View style={{ marginVertical: 7 }}>
                  <View style={[styles.dashedLine]} />
                </View>
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payrollId = params.payrollId as string;
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: employeeCompanyData } = await getCompanyById({
    supabase,
    id: companyId,
  });
  const { data: employeesCompanyLocationData } =
    await getPrimaryLocationByCompanyId({ supabase, companyId });

  const { data: payrollDataAndOthers } =
    await getSalaryEntriesByPayrollIdForSalaryRegister({
      supabase,
      payrollId,
    });

  return {
    data: {
      employeeCompanyData,
      employeesCompanyLocationData,
      payrollDataAndOthers,
    },
    payrollId,
  };
}

export default function SalarySlips() {
  const { data, payrollId } = useLoaderData<typeof loader>();
  const { selectedRows } = useSalaryEntriesStore();

  const updatedData = {
    ...data,
    payrollDataAndOthers: data?.payrollDataAndOthers?.filter((emp1) =>
      selectedRows.some((emp2) => emp2.id === emp1.id)
    ),
  };
  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  function transformData(data: any) {
    const company = data?.employeeCompanyData;
    const location = data?.employeesCompanyLocationData;

    const companyData = {
      name: company?.name,
      address_line_1: location?.address_line_1,
      address_line_2: location?.address_line_2,
      city: location?.city,
      state: location?.state,
      pincode: location?.pincode,
    };

    interface SalaryEntry {
      field_name: string;
      amount: number;
      type: "earning" | "statutory_contribution";
      monthly_attendance: {
        working_days: number;
        present_days: number;
        month: number;
        year: number;
        working_hours: number;
        absent_days: number;
        overtime_hours: number;
        paid_holidays: number;
        paid_leaves: number;
        casual_leaves: number;
      };
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
      start_date?: string;
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

    interface EmployeeEarningsOrDeductions {
      name: string;
      amount: number;
    }

    interface EmployeeData {
      first_name: string;
      middle_name: string;
      last_name: string;
      employee_code: string;
    }
    interface BankDetails {
      bank_name: string;
      account_number: number;
    }

    interface TransformedEmployeeData {
      employeeData: EmployeeData;
      employeeProjectAssignmentData: EmployeeProjectAssignment;
      employeeStatutoryDetails: EmployeeStatutoryDetails;
      attendance: EmployeeAttendance;
      earnings: EmployeeEarningsOrDeductions[];
      deductions: EmployeeEarningsOrDeductions[];
      bankDetails: BankDetails;
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
          employee_bank_details: BankDetails;
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

          return {
            employeeData: {
              first_name: emp?.first_name,
              middle_name: emp?.middle_name,
              last_name: emp?.last_name,
              employee_code: emp?.employee_code,
            },
            employeeProjectAssignmentData: {
              position: emp?.employee_project_assignment?.position || "",
              department: emp?.employee_project_assignment?.department || "",
              date_of_joining:
                emp.employee_project_assignment?.start_date || "",
            },
            employeeStatutoryDetails: {
              pf_number: emp.employee_statutory_details?.pf_number || "",
              esic_number: emp.employee_statutory_details?.esic_number || "",
              uan_number: emp.employee_statutory_details?.uan_number || "",
            },
            attendance: {
              working_days:
                emp?.salary_entries[0]?.monthly_attendance.working_days ?? 0,
              weekly_off: 5,
              paid_holidays:
                emp?.salary_entries[0]?.monthly_attendance.paid_holidays ?? 0,
              paid_days:
                emp?.salary_entries[0]?.monthly_attendance.present_days,
              paid_leaves:
                emp?.salary_entries[0]?.monthly_attendance.paid_leaves ?? 0,
              casual_leaves:
                emp?.salary_entries[0]?.monthly_attendance.casual_leaves ?? 0,
              absents:
                emp?.salary_entries[0]?.monthly_attendance.absent_days ?? 0,
            },
            bankDetails: {
              bank: emp.employee_bank_details?.bank_name,
              account_number: emp.employee_bank_details?.account_number,
            },
            earnings,
            deductions,
          };
        }
      );

    return {
      month: getMonthNameFromNumber(attendanceData?.monthly_attendance.month),
      year: attendanceData?.monthly_attendance.year,
      companyData,
      employeeData,
    };
  }

  const slipData = transformData(updatedData);

  if (!isDocument) return <div>Loading...</div>;

  const handleOpenChange = () => {
    navigate(`/payroll/payroll-history/${payrollId}`);
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0"
        disableIcon={true}
      >
        <PDFViewer width="100%" height="100%">
          <SalarySlipsPDF data={slipData as unknown as DataType} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
