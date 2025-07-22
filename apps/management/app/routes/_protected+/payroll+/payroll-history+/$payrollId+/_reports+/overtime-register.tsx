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
  getSalaryEntriesForSalaryRegisterAndAll,
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
import { getMonthNameFromNumber } from "@canny_ecosystem/utils";
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

const OvertimeRegisterPDF = ({ data }: { data: DataType }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ border: "2pt solid #000000" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: "5",
              alignItems: "baseline",
              paddingBottom: 5,
              borderBottom: "1pt solid #000000",
            }}
          >
            <View>
              <Text
                style={[
                  styles.titleText,
                  {
                    marginHorizontal: "auto",
                  },
                ]}
              >
                Contract Labour (Regulation & Abolition) Central Rules
              </Text>
              <Text
                style={[
                  styles.titleText,
                  {
                    marginVertical: "3",
                    marginHorizontal: "auto",
                  },
                ]}
              >
                FORM XXIII
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
                See Rule 78(1)(a)(ii)
              </Text>
              <Text
                style={[
                  styles.titleText,
                  {
                    marginVertical: "3",
                    marginHorizontal: "auto",
                  },
                ]}
              >
                Register of Overtime
              </Text>
            </View>
          </View>

          <View
            style={{
              paddingVertical: 7,
              paddingHorizontal: 5,
              borderBottom: "1pt solid #000000",
            }}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontSize: "8",
                },
              ]}
            >
              Name and address of Contractor -{CANNY_MANAGEMENT_SERVICES_NAME},{" "}
              {CANNY_MANAGEMENT_SERVICES_ADDRESS}
            </Text>
          </View>
          <View
            style={{
              paddingVertical: 7,
              paddingHorizontal: 5,
              borderBottom: "1pt solid #000000",
            }}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontSize: "8",
                },
              ]}
            >
              Nature and location of work - - AHMEDABAD
            </Text>
          </View>
          <View
            style={{
              paddingVertical: 7,
              paddingHorizontal: 5,
              borderBottom: "1pt solid #000000",
            }}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontSize: "8",
                  textTransform: "capitalize",
                },
              ]}
            >
              Name and address of establishment in/under contract is carried on
              - {data?.companyData?.name}, {data?.companyData?.address_line_1},{" "}
              {data?.companyData?.address_line_2 ?? ""},{" "}
              {data?.companyData?.city}, {data?.companyData?.state},
              {data?.companyData?.pincode}
            </Text>
          </View>

          <View
            style={{
              paddingVertical: 7,
              paddingHorizontal: 5,
              borderBottom: "1pt solid #000000",
            }}
          >
            <Text
              style={[
                {
                  textAlign: "center",
                  fontSize: "10",
                  fontFamily: "Helvetica-Bold",
                },
              ]}
            >
              {`For the month of  ${data.month} ${data.year}`}
            </Text>
          </View>

          <View
            style={[
              styles.tableHeader,
              { borderTop: "1pt solid #000000", marginTop: "3" },
            ]}
          >
            <View style={[styles.headerCell, { flex: 0.1 }]}>
              <Text>Sl. No.</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.5 }]}>
              <Text>Name of workman</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.5 }]}>
              <Text>Father's/Husband's name</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.1 }]}>
              <Text>Sex</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.4 }]}>
              <Text>Designation/nature of employment</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.2 }]}>
              <Text>Dates on which overtime worked</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>
                Total overtime worked or production in case of piece-rated
              </Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>Normal rates of wages</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>Overtime rate of wages</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>Overtime earnings</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>Date on which overtime wages paid</Text>
            </View>
            <View style={[styles.headerCell, { flex: 0.3 }]}>
              <Text>Remarks</Text>
            </View>
          </View>
        </View>
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
    await getSalaryEntriesForSalaryRegisterAndAll({
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

export default function OvertimeRegister() {
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
      month: getMonthNameFromNumber(attendanceData?.monthly_attendance.month),
      year: attendanceData?.monthly_attendance.year,
      companyData,
      employeeData,
    };
  }

  const slipData = transformData(updatedData);

  if (!isDocument) return <div>Loading...</div>;

  const handleOpenChange = () => {
    navigate(`/payroll/run-payroll/${payrollId}`);
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0"
        disableIcon={true}
      >
        <PDFViewer width="100%" height="100%">
          <OvertimeRegisterPDF data={slipData as unknown as DataType} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
