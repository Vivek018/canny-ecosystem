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
} from "@/constant";
import type {
  CompanyDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  LocationDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  getMonthNameFromNumber,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { useSalaryEntriesStore } from "@/store/salary-entries";

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: "20 10",
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
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
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    borderLeft: "1pt solid #000000",
    borderRight: "1pt solid #000000",
    borderBottom: "1pt solid #000000",
  },
  headerCell: {
    paddingVertical: 3,
    paddingHorizontal: "1",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "center",
    borderLeft: "0.5pt solid #000000",
    borderRight: "0.5pt solid #000000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#999999",
    fontSize: 8,
    fontStyle: "italic",
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
    employeeData: EmployeeDatabaseRow;
    employeeProjectAssignmentData: EmployeeProjectAssignmentDataType;
    employeeStatutoryDetails: EmployeeStatutoryDetailsDatabaseRow;
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  }[];
};

const SalaryRegisterPDF = ({ data }: { data: DataType }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.companyName}>{data?.companyData?.name}</Text>
            <Text style={styles.companyAddress}>{`${
              data?.companyData?.address_line_1
            }, ${data?.companyData?.address_line_2 ?? ""}, ${
              data?.companyData?.city
            }, ${data?.companyData?.state}, ${
              data?.companyData?.pincode
            }`}</Text>
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
            justifyContent: "flex-end",
            gap: "5",
            alignItems: "baseline",
          }}
        >
          <View>
            <Text
              style={[
                styles.titleText,
                {
                  marginTop: "6",
                  marginHorizontal: "auto",
                },
              ]}
            >
              Salary Register
            </Text>
            <Text
              style={[
                styles.monthText,
                {
                  marginVertical: "3",
                  marginHorizontal: "auto",
                },
              ]}
            >
              {`For  ${data?.month} ${data?.year}`}
            </Text>
          </View>
          <View
            style={[
              styles.form,
              {
                marginBottom: "10",
                flexDirection: "column",
                alignItems: "flex-end",
              },
            ]}
          >
            <Text>(1) Form under Rule-6 of Equal Remuneration Rules 1976</Text>
            <Text>
              (2) Form under Rule-21(4), 25(2), 26(1) and 26(2) of Gujarat
              Minimum Wages Rules 196
            </Text>
            <Text>
              (3) Form under Rule-6 of Payment of Wages Gujarat Rules 1963
            </Text>
            <Text>
              (4) Form 17 under Rule-78 of Contract Labour (Regulation &
              Abolition) Gujarat, Rules 197
            </Text>
            <Text>
              (5) Form under Rule-52(2) of Inter State Migrant Workers (Gujarat)
              Rules 198
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tableHeader,
            { borderTop: "1pt solid #000000", marginTop: "3" },
          ]}
        >
          <View style={[styles.headerCell, { flex: 0.3 }]}>
            <Text>Sr. No.</Text>
          </View>
          <View
            style={[
              styles.headerCell,
              {
                flex: 2,
                fontSize: "7",
                alignItems: "flex-start",
                paddingLeft: "2",
                gap: "2",
              },
            ]}
          >
            <Text>Employee Name</Text>

            <Text>Employee Code</Text>

            <Text>Position</Text>
            <Text>UAN no.</Text>
            <Text>PF No.</Text>
            <Text>ESI No.</Text>
          </View>
          <View style={[styles.headerCell, { flex: 1 }]}>
            <Text>Working Details</Text>
          </View>
          <View
            style={[
              styles.headerCell,
              {
                flex: 1,
                fontSize: "7",
                flexDirection: "column",
                alignItems: "center",
                borderRight: "0.5pt solid #000000",
                gap: "2",
              },
            ]}
          >
            <Text
              style={{
                borderBottom: "1pt solid #000000",
                marginBottom: "2",
                fontSize: "8",
                alignSelf: "stretch",
                textAlign: "center",
              }}
            >
              Rate
            </Text>
            <Text>BASIC</Text>
            <Text>HRA</Text>
            <Text>LTA</Text>
            <Text>O.T</Text>
            <Text>BONUS</Text>
          </View>
          <View
            style={[
              styles.headerCell,
              {
                flex: 1,
                fontSize: "7",
                flexDirection: "column",
                alignItems: "center",
                borderRight: "0.5pt solid #000000",
                gap: "2",
              },
            ]}
          >
            <Text
              style={{
                borderBottom: "1pt solid #000000",
                marginBottom: "2",
                fontSize: "8",
                alignSelf: "stretch",
                textAlign: "center",
              }}
            >
              Earnings
            </Text>
            <Text>BASIC</Text>
            <Text>HRA</Text>
            <Text>LTA</Text>
            <Text>O.T</Text>
            <Text>BONUS</Text>
          </View>
          <View
            style={[
              styles.headerCell,
              { flex: 1.2, flexDirection: "column", gap: "5" },
            ]}
          >
            <Text>Gross Salary</Text>
            <Text>PF Wages</Text>
            <Text>ESI Wages</Text>
          </View>
          <View
            style={[
              styles.headerCell,
              {
                flex: 2.2,
                flexDirection: "column",
                borderLeft: "0.5pt solid #000000",
              },
            ]}
          >
            <Text
              style={{
                borderBottom: "1pt solid #000000",
                marginBottom: "2",
                fontSize: "8",
              }}
            >
              Deductions
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingRight: "5",
                  gap: "1",
                  borderRight: "0.5pt solid #000000", // <-- separator between left and right
                }}
              >
                <Text style={{ fontSize: "7" }}>EPF</Text>
                <Text style={{ fontSize: "7" }}>ESIC</Text>
                <Text style={{ fontSize: "7" }}>PT</Text>
                <Text style={{ fontSize: "7" }}>PF</Text>
                <Text style={{ fontSize: "7" }}>LWF</Text>
                <Text style={{ fontSize: "7" }}>Advances</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: "7" }}>Total</Text>
              </View>
            </View>
          </View>

          <View style={[styles.headerCell, { flex: 0.8 }]}>
            <Text>Net Salary Payable in Rs</Text>
          </View>
          <View style={[styles.headerCell, { flex: 1 }]}>
            <Text>Signature / Thumb Impression</Text>
          </View>
        </View>
        {data.employeeData.map((employee, index) => (
          <View style={[styles.tableHeader]} key={index.toString()}>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>{index + 1}</Text>
            </View>
            <View
              style={[
                styles.headerCell,
                {
                  flex: 2,
                  fontSize: "7",
                  alignItems: "flex-start",
                  paddingLeft: "2",
                  gap: "3",
                },
              ]}
            >
              <Text style={{ marginBottom: "8" }}>
                {employee?.employeeData?.first_name}{" "}
                {employee?.employeeData?.middle_name ?? ""}{" "}
                {employee?.employeeData?.last_name}
              </Text>

              <Text>{employee?.employeeData?.employee_code}</Text>

              <Text style={{ textTransform: "capitalize" }}>
                {replaceUnderscore(
                  employee?.employeeProjectAssignmentData?.position
                )}
                <Text>{employee?.employeeStatutoryDetails?.uan_number}</Text>
              </Text>
              <Text>{employee?.employeeStatutoryDetails?.pf_number}.</Text>
              <Text>{employee?.employeeStatutoryDetails?.esic_number}</Text>
            </View>
            <View
              style={[
                styles.headerCell,
                {
                  flex: 1,
                  paddingLeft: "1",
                  paddingRight: "1",
                  paddingVertical: 2,
                  justifyContent: "center",
                  gap: 2,
                },
              ]}
            >
              {[
                {
                  label: "WD",
                  value: Number(employee?.attendance?.working_days ?? 0),
                },
                {
                  label: "WO",
                  value: Number(employee?.attendance?.weekly_off ?? 5),
                },
                {
                  label: "PH",
                  value: Number(employee?.attendance?.paid_holidays ?? 0),
                },
                {
                  label: "PD",
                  value: Number(employee?.attendance?.paid_days ?? 0),
                },
                {
                  label: "PL",
                  value: Number(employee?.attendance?.paid_leaves ?? 0),
                },
                {
                  label: "CL",
                  value: Number(employee?.attendance?.casual_leaves ?? 0),
                },
                {
                  label: "AB",
                  value: Number(employee?.attendance?.absents ?? 0),
                },
              ].map((item, index) => (
                <View
                  key={index.toString()}
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    paddingHorizontal: "3",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 8 }}>{item.label}</Text>
                  <Text style={{ fontSize: 8 }}>{item.value}</Text>
                </View>
              ))}
            </View>
            <View
              style={[
                styles.headerCell,
                {
                  flex: 1,
                  fontSize: "7",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRight: "0.5pt solid #000000",
                  gap: "4",
                },
              ]}
            >
              <Text>{0}</Text>
              <Text>{0}</Text>
              <Text>{0}</Text>
              <Text>{0}</Text>
              <Text>{0}</Text>
            </View>
            <View
              style={[
                styles.headerCell,
                {
                  flex: 1,
                  fontSize: "7",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRight: "0.5pt solid #000000",
                  gap: "4",
                },
              ]}
            >
              <Text>
                {Number(
                  employee?.earnings
                    .find((e) => e?.name === "BASIC")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text>
                {Number(
                  employee?.earnings
                    .find((e) => e?.name === "HRA")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text>
                {Number(
                  employee?.earnings
                    .find((e) => e?.name === "LTA")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text>
                {Number(
                  employee?.earnings
                    .find((e) => e.name === "Others")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text>
                {Number(
                  employee?.earnings
                    .find((e) => e?.name === "BONUS")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
            </View>
            <View
              style={[
                styles.headerCell,
                { flex: 1.2, flexDirection: "column", gap: "5" },
              ]}
            >
              <Text>
                {Number(
                  employee?.earnings
                    .reduce((sum, earning) => sum + earning.amount, 0)
                    ?.toFixed(2)
                )}
              </Text>
              <Text>
                {Number(
                  employee?.earnings
                    .find((e) => e?.name === "BASIC")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text>0</Text>
            </View>
            <View
              style={[
                styles.headerCell,
                {
                  flex: 1.12,
                  fontSize: "7",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRight: "0.5pt solid #000000",
                  gap: "2",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .find((e) => e?.name === "EPF" || "PF")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .find((e) => e?.name === "ESIC")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .find((e) => e?.name === "PT")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .find((e) => e?.name === "PF")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .find((e) => e?.name === "LWF")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .find((e) => e.name === "Advances")
                    ?.amount?.toFixed(2) ?? 0.0
                )}
              </Text>
            </View>
            <View
              style={[
                styles.headerCell,
                {
                  flex: 1.02,
                  fontSize: "7",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: "0.5pt solid #000000",
                  gap: "2",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: "7",
                }}
              >
                {Number(
                  employee?.deductions
                    .reduce((sum, earning) => sum + earning?.amount, 0)
                    ?.toFixed(2)
                )}
              </Text>
            </View>
            <View
              style={[
                styles.headerCell,
                { flex: 0.8, justifyContent: "center" },
              ]}
            >
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
            <View style={[styles.headerCell, { flex: 1 }]} />
          </View>
        ))}
        {/* Footer */}
        <Text style={styles.footer}>
          This is computer generated statement hence does not require a
          signature.
        </Text>
      </Page>
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

export default function SalaryRegister() {
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
      type: "earning" | "deduction";
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

    interface TransformedEmployeeData {
      employeeData: EmployeeData;
      employeeProjectAssignmentData: EmployeeProjectAssignment;
      employeeStatutoryDetails: EmployeeStatutoryDetails;
      attendance: EmployeeAttendance;
      earnings: EmployeeEarningsOrDeductions[];
      deductions: EmployeeEarningsOrDeductions[];
    }

    const attendanceData =
      data?.payrollDataAndOthers[0]?.salary_entries[0] || {};

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
            } else if (entry.type === "deduction") {
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
              position: emp.employee_project_assignment?.position || "",
              department: emp.employee_project_assignment?.department || "",
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
            earnings,
            deductions,
          };
        }
      );

    return {
      month: getMonthNameFromNumber(attendanceData?.monthly_attendance?.month),
      year: attendanceData?.monthly_attendance?.year,
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
          <SalaryRegisterPDF data={slipData as unknown as DataType} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
