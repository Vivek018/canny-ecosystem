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
import {
  formatDate,
  formatDateTime,
  formatNumber,
  getMonthNameFromNumber,
  replaceUnderscore,
  roundToNearest,
} from "@canny_ecosystem/utils";
import type {
  CompanyDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  LocationDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";

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
  },
  employeeId: {
    color: "#666666",
    fontSize: 9,
    marginBottom: 10,
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
      paid_days: number;
      overtime_hours: number;
      working_days: number;
      paid_leaves: number;
      casual_leaves: number;
      absents: number;
    };
    employeeData: EmployeeDatabaseRow;
    employeeProjectAssignmentData: {
      position: string;
      start_date: string;
      site: string;
      location: string;
      project: string;
      salary_entry_site: string;
      salary_entry_location: string;
      salary_entry_department: string;
      salary_entry_site_project: string;
      salary_location: {
        address_line_1: string;
        address_line_2: string;
        city: string;
        state: string;
        pincode: string;
      };
      project_assignment_location: {
        address_line_1: string;
        address_line_2: string;
        city: string;
        state: string;
        pincode: string;
      };
    };
    employeeStatutoryDetails: EmployeeStatutoryDetailsDatabaseRow;
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  };
};

const SalarySlipPDF = ({ data }: { data: DataType }) => {
  const getFullAddress = (emp: any) => {
    const address =
      emp?.employeeProjectAssignmentData?.salary_location ||
      emp?.employeeProjectAssignmentData?.project_assignment_location ||
      data?.companyData;

    if (!address) return null;

    return `${address.address_line_1 ?? ""}, ${address.address_line_2 ?? ""}, ${address.city ?? ""}, ${address.state ?? ""}, ${address.pincode ?? ""}`;
  };

  return (
    <Document title={`Salary Slip - ${formatDateTime(Date.now())}`}>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.companyName}>{data.companyData.name}</Text>
            <Text style={styles.companyAddress}>
              {getFullAddress(data?.employee)}
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
              {`${data.employee?.employeeData?.first_name} ${
                data?.employee?.employeeData?.middle_name ?? ""
              } ${data?.employee?.employeeData.last_name}`}{" "}
            </Text>
            <Text style={styles.employeeId}>
              (Employee Code: {data?.employee?.employeeData?.employee_code})
            </Text>
            <Text style={styles.department}>
              Location:{" "}
              {data?.employee?.employeeProjectAssignmentData
                ?.salary_entry_location ??
                data?.employee?.employeeProjectAssignmentData?.location}
            </Text>
            <Text style={styles.department}>
              Site:{" "}
              {data?.employee?.employeeProjectAssignmentData
                ?.salary_entry_site ??
                data?.employee?.employeeProjectAssignmentData?.site}
            </Text>
            <Text style={styles.department}>
              Department:{" "}
              {data?.employee?.employeeProjectAssignmentData
                ?.salary_entry_department ??
                data?.employee?.employeeProjectAssignmentData
                  ?.salary_entry_site_project ??
                data?.employee?.employeeProjectAssignmentData?.project}
            </Text>
            <Text style={styles.department}>
              Designation:{" "}
              {replaceUnderscore(
                data?.employee?.employeeProjectAssignmentData?.position
              )}
            </Text>
          </View>
          <View style={styles.workingDetails}>
            <Text style={styles.workingTitle}>WORKING DETAILS</Text>

            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Working Days</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.working_days}
              </Text>
            </View>
            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Paid Days</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.paid_days}
              </Text>
            </View>
            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Absents</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.absents}
              </Text>
            </View>
            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Overtime Hours</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.overtime_hours}
              </Text>
            </View>
            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Casual Leaves</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.casual_leaves}
              </Text>
            </View>
            <View style={styles.workingRow}>
              <Text style={styles.workingLabel}>Paid Leaves</Text>
              <Text style={styles.workingValue}>
                {data?.employee?.attendance?.paid_leaves}
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
                  <Text>{formatNumber(earning?.amount)}</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text>Gross Pay</Text>
              <Text>
                {roundToNearest(
                  Number(
                    data?.employee?.earnings
                      ?.reduce((sum, earning) => sum + earning.amount, 0)
                      .toFixed(2)
                  )
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
                  <Text>{formatNumber(deduction?.amount)}</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text>Total Deductions</Text>
              <Text>
                {roundToNearest(
                  Number(
                    data?.employee?.deductions
                      ?.reduce((sum, deduction) => sum + deduction.amount, 0)
                      .toFixed(2)
                  )
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Net Payable */}
        <View style={styles.netPayable}>
          <Text
            style={styles.netPayableAmount}
          >{`Net Payable: Rs ${roundToNearest(
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
          )}`}</Text>
          <Text style={styles.netPayableWords}>
            {numberToWordsIndian(
              roundToNearest(
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
    payrollId,
  };
}

export default function SalarySlip() {
  const { data, payrollId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  function transformData(data: any) {
    const fullName = {
      first_name: data?.payrollData?.employee?.first_name,
      middle_name: data?.payrollData?.employee?.middle_name,
      last_name: data?.payrollData?.employee?.last_name,
      employee_code: data?.payrollData?.employee?.employee_code,
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
      location:
        data?.employeeProjectAssignmentData?.sites?.company_locations?.name ||
        "",
      site: data?.employeeProjectAssignmentData?.sites?.name || "",
      project: data?.employeeProjectAssignmentData?.sites?.projects?.name || "",
      salary_entry_site: data?.payrollData?.salary_entries?.site?.name,
      salary_entry_location:
        data?.payrollData?.salary_entries?.site?.company_locations?.name,
      salary_entry_department:
        data?.payrollData?.salary_entries?.department?.name,
      salary_entry_site_project:
        data?.payrollData?.salary_entries?.site?.projects?.name,
      salary_location: {
        address_line_1:
          data?.payrollData?.salary_entries?.site?.company_locations
            ?.address_line_1,
        address_line_2:
          data?.payrollData?.salary_entries?.site?.company_locations
            ?.address_line_2,
        city: data?.payrollData?.salary_entries?.site?.company_locations?.city,
        state:
          data?.payrollData?.salary_entries?.site?.company_locations?.state,
        pincode:
          data?.payrollData?.salary_entries?.site?.company_locations?.pincode,
      },
      project_assignment_location: {
        address_line_1:
          data?.employeeProjectAssignmentData?.sites?.company_locations
            ?.address_line_1,
        address_line_2:
          data?.employeeProjectAssignmentData?.sites?.company_locations
            ?.address_line_2,
        city: data?.employeeProjectAssignmentData?.sites?.company_locations
          ?.city,
        state:
          data?.employeeProjectAssignmentData?.sites?.company_locations?.state,
        pincode:
          data?.employeeProjectAssignmentData?.sites?.company_locations
            ?.pincode,
      },
    };

    const statutoryDetails = {
      pf_number: data?.employeeStatutoryDetails?.pf_number || "",
      esic_number: data?.employeeStatutoryDetails?.esic_number || "",
      uan_number: data?.employeeStatutoryDetails?.uan_number || "",
    };

    const salaryEntries =
      data?.payrollData?.salary_entries?.salary_field_values || [];

    const preferredEarningOrder = ["BASIC", "DA", "HRA"];
    const preferredDeductionOrder = ["PF", "ESIC", "PT"];

    const earningFields = new Map<string, true>();
    const deductionFields = new Map<string, true>();
    const earningsMap: Record<string, number> = {};
    const deductionsMap: Record<string, number> = {};
    for (const entry of salaryEntries) {
      const name = entry?.payroll_fields?.name;
      const type = entry?.payroll_fields?.type ?? "earning";
      if (!name) continue;
      if (type === "deduction") {
        if (!deductionFields.has(name)) deductionFields.set(name, true);
        deductionsMap[name] = entry?.amount;
      } else {
        if (!earningFields.has(name)) earningFields.set(name, true);
        earningsMap[name] = entry?.amount;
      }
    }

    const orderedEarnings = preferredEarningOrder.filter((f) =>
      earningFields.has(f)
    );
    const remainingEarnings = [...earningFields.keys()].filter(
      (f) => !preferredEarningOrder.includes(f)
    );
    const orderedDeductions = preferredDeductionOrder.filter((f) =>
      deductionFields.has(f)
    );
    const remainingDeductions = [...deductionFields.keys()].filter(
      (f) => !preferredDeductionOrder.includes(f)
    );

    const earnings = [...orderedEarnings, ...remainingEarnings].map((name) => ({
      name,
      amount: earningsMap[name],
    }));
    const deductions = [...orderedDeductions, ...remainingDeductions].map(
      (name) => ({ name, amount: deductionsMap[name] })
    );
    return {
      month: getMonthNameFromNumber(data?.payrollData?.month),
      year: data?.payrollData?.year,
      companyData,
      employee: {
        employeeData: fullName,
        employeeProjectAssignmentData: projectAssignment,
        employeeStatutoryDetails: statutoryDetails,
        attendance: {
          working_days: data?.payrollData?.working_days || 0,
          paid_days: data?.payrollData?.present_days || 0,
          overtime_hours: data?.payrollData?.overtime_hours || 0,
          paid_leaves: data?.payrollData?.paid_leaves || 0,
          casual_leaves: data?.payrollData?.casual_leaves || 0,
          absents: data?.payrollData?.absent_days || 0,
        },
        earnings,
        deductions,
      },
    };
  }

  const slipData = transformData(data);

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
          <SalarySlipPDF data={slipData as unknown as DataType} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
