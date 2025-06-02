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
  getEmployeeProjectAssignmentByEmployeeId,
  getEmployeeStatutoryDetailsById,
  getPrimaryLocationByCompanyId,
  getSalaryEntriesByPayrollAndEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import {
  CANNY_MANAGEMENT_SERVICES_ADDRESS,
  CANNY_MANAGEMENT_SERVICES_NAME,
  numberToWordsIndian,
  SALARY_SLIP_TITLE,
} from "@/constant";
import { formatDate, formatDateTime } from "@canny_ecosystem/utils";
import type {
  CompanyDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  LocationDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { months } from "@canny_ecosystem/utils/constant";

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: "30 40",
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
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
  formNumber: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
    borderBottom: "1pt solid #EEEEEE",
    paddingBottom: 15,
  },
  monthTitle: {
    marginTop: "8",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  employeeSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  employeeDetails: {
    flex: 2,
  },
  employeeName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  employeeId: {
    color: "#666666",
    fontSize: 9,
  },
  department: {
    textTransform: "capitalize",
    fontSize: 9,
    color: "#444444",
    marginTop: 2,
  },
  workingDetails: {
    flex: 1,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    padding: 10,
    borderRadius: 4,
  },
  workingTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#333333",
  },
  workingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  workingLabel: {
    fontSize: 8,
    color: "#666666",
  },
  workingValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    borderBottom: "1pt solid #EEEEEE",
    paddingBottom: 15,
  },
  infoItem: {
    width: "25%",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#333333",
  },
  earningsSection: {
    flexDirection: "row",
    marginTop: 10,
  },
  column: {
    flex: 1,
    paddingHorizontal: 10,
  },
  columnHeader: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  columnTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
  },
  earningRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 9,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    fontFamily: "Helvetica-Bold",
  },
  netPayable: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 4,
  },
  netPayableAmount: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
    marginBottom: 4,
  },
  netPayableWords: {
    fontSize: 9,
    color: "#666666",
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
});

type DataType = {
  month: string;
  year: number;
  payrollData: PayrollDatabaseRow;
  companyData: CompanyDatabaseRow & LocationDatabaseRow;
  employee: {
    attendance: {
      overtime_hours: number;
      working_days: number;
    };
    employeeData: EmployeeDatabaseRow;
    employeeProjectAssignmentData: EmployeeProjectAssignmentDataType;
    employeeStatutoryDetails: EmployeeStatutoryDetailsDatabaseRow;
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  };
};

const SalarySlipPDF = ({ data }: { data: DataType }) => {
  return (
    <Document title={`Salary Slip - ${formatDateTime(Date.now())}`}>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.companyName}>{data.companyData.name}</Text>
            <Text
              style={styles.companyAddress}
            >{`${data?.companyData?.address_line_1}, ${data?.companyData?.address_line_2}, ${data?.companyData?.city}, ${data.companyData?.state}, ${data?.companyData?.pincode}`}</Text>
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
        <Text style={styles.formNumber}>{SALARY_SLIP_TITLE}</Text>

        {/* Document Header */}
        <View style={styles.documentHeader}>
          <View>
            <Text style={styles.monthTitle}>
              For {data.month} {data.year}
            </Text>
          </View>
        </View>

        {/* Employee Section */}
        <View style={styles.employeeSection}>
          <View style={styles.employeeDetails}>
            <Text style={styles.employeeName}>
              {`${data.employee?.employeeData?.first_name} ${data?.employee?.employeeData?.middle_name} ${data?.employee?.employeeData.last_name}`}{" "}
              <Text style={styles.employeeId}>
                (Employee Code: {data?.employee?.employeeData?.employee_code})
              </Text>
            </Text>
            <Text style={styles.department}>
              {data?.employee?.employeeProjectAssignmentData?.position}
            </Text>
            <Text style={styles.department}>
              Location: {data?.companyData?.city}
            </Text>
          </View>
          <View style={styles.workingDetails}>
            <Text style={styles.workingTitle}>WORKING DETAILS</Text>

            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Paid Days</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.working_days}
              </Text>
            </View>
            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Overtime Hours</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.overtime_hours}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>PF Number</Text>
            <Text style={styles.infoValue}>
              {data?.employee?.employeeStatutoryDetails?.pf_number}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ESI Number</Text>
            <Text style={styles.infoValue}>
              {data?.employee?.employeeStatutoryDetails?.esic_number}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>UAN Number</Text>
            <Text style={styles.infoValue}>
              {data?.employee?.employeeStatutoryDetails?.uan_number}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Joining</Text>
            <Text style={styles.infoValue}>
              {formatDate(
                data?.employee?.employeeProjectAssignmentData?.start_date
              )}
            </Text>
          </View>
        </View>

        {/* Earnings and Deductions */}
        <View style={styles.earningsSection}>
          {/* Earnings Column */}
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>EARNINGS DETAILS</Text>
            </View>
            {data?.employee?.earnings?.map((earning) => {
              return (
                <View style={styles.earningRow} key={earning.name}>
                  <Text>{earning?.name}</Text>
                  <Text>{earning?.amount.toFixed(2)}</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text>Gross Pay</Text>
              <Text>
                {Number(
                  data?.employee?.earnings
                    ?.reduce((sum, earning) => sum + earning.amount, 0)
                    .toFixed(2)
                )}
              </Text>
            </View>
          </View>

          {/* Deductions Column */}
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>DEDUCTION DETAILS</Text>
            </View>
            {data?.employee?.deductions?.map((deduction) => {
              return (
                <View style={styles.earningRow} key={deduction.name}>
                  <Text>{deduction?.name}</Text>
                  <Text>{deduction?.amount.toFixed(2)}</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text>Total Deductions</Text>
              <Text>
                {Number(
                  data?.employee?.deductions
                    ?.reduce((sum, deduction) => sum + deduction.amount, 0)
                    .toFixed(2)
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Net Payable */}
        <View style={styles.netPayable}>
          <Text style={styles.netPayableAmount}>{`Net Payable: Rs ${
            Number(
              data?.employee?.earnings
                ?.reduce((sum, earning) => sum + earning.amount, 0)
                .toFixed(2)
            ) -
            Number(
              data?.employee?.deductions
                ?.reduce((sum, deduction) => sum + deduction.amount, 0)
                .toFixed(2)
            )
          }`}</Text>
          <Text style={styles.netPayableWords}>
            {numberToWordsIndian(
              Number(
                data?.employee?.earnings
                  ?.reduce((sum, earning) => sum + earning.amount, 0)
                  .toFixed(2)
              ) -
                Number(
                  data?.employee?.deductions
                    ?.reduce((sum, deduction) => sum + deduction.amount, 0)
                    .toFixed(2)
                )
            )}
          </Text>
        </View>

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
  const employeeId = params.employeeId as string;
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: employeeCompanyData } = await getCompanyById({
    supabase,
    id: companyId,
  });
  const { data: payrollData } = await getSalaryEntriesByPayrollAndEmployeeId({
    supabase,
    payrollId,
    employeeId,
  });

  const { data: employeeProjectAssignmentData } =
    await getEmployeeProjectAssignmentByEmployeeId({ supabase, employeeId });
  const { data: employeeCompanyLocationData } =
    await getPrimaryLocationByCompanyId({ supabase, companyId });
  const { data: employeeStatutoryDetails } =
    await getEmployeeStatutoryDetailsById({ supabase, id: employeeId });

  return {
    data: {
      employeeCompanyData,
      employeeCompanyLocationData,
      employeeProjectAssignmentData,
      employeeStatutoryDetails,
      payrollData,
    },
    employeeId,
  };
}

export default function SalarySlip() {
  const { data,  employeeId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  function transformData(data: any) {
    const fullName = {
      first_name: data?.payrollData.first_name,
      middle_name: data?.payrollData.middle_name,
      last_name: data?.payrollData.last_name,
      employee_code: data?.payrollData.employee_code,
    };

    const companyData = {
      name: data?.employeeCompanyData?.name || "",
      address_line_1: data?.employeeCompanyLocationData?.address_line_1 || "",
      address_line_2: data?.employeeCompanyLocationData?.address_line_2 || "",
      city: data?.employeeCompanyLocationData?.city || "",
      state: data?.employeeCompanyLocationData?.state || "",
      pincode: data?.employeeCompanyLocationData?.pincode || "",
    };

    const projectAssignment = {
      position: data?.employeeProjectAssignmentData?.position || "",
      start_date: data?.employeeProjectAssignmentData?.start_date || "",
    };

    const statutoryDetails = {
      pf_number: data?.employeeStatutoryDetails?.pf_number || "",
      esic_number: data?.employeeStatutoryDetails?.esic_number || "",
      uan_number: data?.employeeStatutoryDetails?.uan_number || "",
    };

    function getMonthName(monthNumber: number) {
      const entry = Object.entries(months).find(
        ([, value]) => value === monthNumber
      );
      return entry ? entry[0] : undefined;
    }

    const attendanceData = data?.payrollData.salary_entries[0] || {};
    const salaryEntries = data?.payrollData.salary_entries || [];

    interface SalaryEntry {
      field_name: string;
      amount: number;
      type: string;
    }

    const earnings: { name: string; amount: number }[] = salaryEntries
      .filter((entry: SalaryEntry) => entry.type === "earning")
      .map((entry: SalaryEntry) => ({
        name: entry.field_name,
        amount: entry.amount,
      }));

    interface DeductionEntry {
      name: string;
      amount: number;
    }

    const deductions: DeductionEntry[] = salaryEntries
      .filter((entry: SalaryEntry) => entry.type === "statutory_contribution")
      .map((entry: SalaryEntry) => ({
        name: entry.field_name,
        amount: entry.amount,
      }));

    return {
      month: getMonthName(attendanceData?.month),
      year: attendanceData?.year,
      companyData,
      employee: {
        employeeData: fullName,
        employeeProjectAssignmentData: projectAssignment,
        employeeStatutoryDetails: statutoryDetails,
        attendance: {
          working_days: attendanceData?.present_days || 0,
          overtime_hours: attendanceData?.overtime_hours || 0,
        },
        earnings,
        deductions,
      },
    };
  }

  const slipData = transformData(data);

  if (!isDocument) return <div>Loading...</div>;

  const handleOpenChange = () => {
    navigate(`/employees/${employeeId}/salary`);
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0"
        disableIcon={true}
      >
        <PDFViewer width="100%" height="100%">
          <SalarySlipPDF data={slipData as unknown as DataType} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
