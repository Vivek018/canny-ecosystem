import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useIsDocument } from '@canny_ecosystem/utils/hooks/is-document';
import { Dialog, DialogContent } from '@canny_ecosystem/ui/dialog';
import { getSupabaseWithHeaders } from '@canny_ecosystem/supabase/server';
import { getCompanyIdOrFirstCompany } from '@/utils/server/company.server';
import { type EmployeeProjectAssignmentDataType, getCompanyById, getEmployeeById, getEmployeeProjectAssignmentByEmployeeId, getEmployeeStatutoryDetailsById, getPaymentFieldById, getPaymentTemplateComponentById, getPaymentTemplateComponentIdsAndAmountByPayrollIdAndEmployeeId, getPayrollById, getPrimaryLocationByCompanyId } from '@canny_ecosystem/supabase/queries';
import { CANNY_MANAGEMENT_SERVICES_ADDRESS, CANNY_MANAGEMENT_SERVICES_NAME, numberToWordsIndian, SALARY_SLIP_TITLE } from '@/constant';
import { formatDateTime, formatDateToMonthYear } from '@canny_ecosystem/utils';
import type { CompanyDatabaseRow, EmployeeDatabaseRow, EmployeeStatutoryDetailsDatabaseRow, LocationDatabaseRow, PayrollDatabaseRow } from '@canny_ecosystem/supabase/types';

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: '30 40',
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 20,
    },
    companyName: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
    },
    companyAddress: {
        fontSize: 9,
        color: '#444444',
        marginBottom: 2,
    },
    formNumber: {
        fontSize: 8,
        color: '#666666',
        marginTop: 4,
    },
    documentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
        borderBottom: '1pt solid #EEEEEE',
        paddingBottom: 15,
    },
    monthTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
    },
    employeeSection: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    employeeDetails: {
        flex: 2,
    },
    employeeName: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
    },
    employeeId: {
        color: '#666666',
        fontSize: 9,
    },
    department: {
        fontSize: 9,
        color: '#444444',
        marginTop: 2,
    },
    workingDetails: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        padding: 10,
        borderRadius: 4,
    },
    workingTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
        color: '#333333',
    },
    workingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    workingLabel: {
        fontSize: 8,
        color: '#666666',
    },
    workingValue: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        borderBottom: '1pt solid #EEEEEE',
        paddingBottom: 15,
    },
    infoItem: {
        width: '25%',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 8,
        color: '#666666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 9,
        color: '#333333',
    },
    earningsSection: {
        flexDirection: 'row',
        marginTop: 10,
    },
    column: {
        flex: 1,
        paddingHorizontal: 10,
    },
    columnHeader: {
        backgroundColor: '#F8F8F8',
        padding: 8,
        marginBottom: 10,
        borderRadius: 4,
    },
    columnTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#333333',
    },
    earningRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        fontSize: 9,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        fontFamily: 'Helvetica-Bold',
    },
    netPayable: {
        marginTop: 25,
        padding: 15,
        backgroundColor: '#F8F8F8',
        borderRadius: 4,
    },
    netPayableAmount: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#333333',
        marginBottom: 4,
    },
    netPayableWords: {
        fontSize: 9,
        color: '#666666'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#999999',
        fontSize: 8,
        fontStyle: 'italic',
    },
});

type DataType = {
    employeeCompanyData: CompanyDatabaseRow,
    payrollData: PayrollDatabaseRow,
    employeeData: EmployeeDatabaseRow,
    employeeCompanyLocationData: LocationDatabaseRow,
    employeeProjectAssignmentData: EmployeeProjectAssignmentDataType,
    employeeStatutoryDetails: EmployeeStatutoryDetailsDatabaseRow,
    earnings: { name: string, amount: number }[],
    deductions: { name: string, amount: number }[]
}

const SalarySlipPDF = ({ data }: { data: DataType }) => {
    const netPay = Number.parseInt((
        data.earnings.reduce((sum, earning) => sum + earning.amount, 0) -
        data.deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
    ).toFixed(2));
    return <Document title={`Salary Slip - ${formatDateTime(Date.now())}`}>
        <Page size="A4" style={styles.page}>
            {/* Company Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.companyName}>{data.employeeCompanyData.name}</Text>
                    <Text style={styles.companyAddress}>{`${data.employeeCompanyLocationData.address_line_1}, ${data.employeeCompanyLocationData.address_line_2}, ${data.employeeCompanyLocationData.city}, ${data.employeeCompanyLocationData.state}, ${data.employeeCompanyLocationData.pincode}`}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{CANNY_MANAGEMENT_SERVICES_NAME}</Text>
                    <Text style={styles.companyAddress}>{CANNY_MANAGEMENT_SERVICES_ADDRESS}</Text>
                </View>
            </View>
            <Text style={styles.formNumber}>{SALARY_SLIP_TITLE}</Text>

            {/* Document Header */}
            <View style={styles.documentHeader}>
                <View>
                    <Text style={styles.monthTitle}>For The Month Of {formatDateToMonthYear(data.payrollData.run_date)}</Text>
                </View>
            </View>

            {/* Employee Section */}
            <View style={styles.employeeSection}>
                <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>
                        {`${data.employeeData.first_name} ${data.employeeData.middle_name} ${data.employeeData.last_name}`} <Text style={styles.employeeId}>(Employee Code: {data.employeeData.employee_code})</Text>
                    </Text>
                    <Text style={styles.department}>{data.employeeProjectAssignmentData.position}</Text>
                    <Text style={styles.department}>Location: {data.employeeCompanyLocationData.city}</Text>
                </View>
                <View style={styles.workingDetails}>
                    <Text style={styles.workingTitle}>WORKING DETAILS</Text>
                    <View style={styles.workingRow}>
                        <Text style={styles.workingLabel}>Working Days</Text>
                        <Text style={styles.workingValue}>{123}</Text>
                    </View>
                    <View style={styles.workingRow}>
                        <Text style={styles.workingLabel}>Weekly Off</Text>
                        <Text style={styles.workingValue}>{123}</Text>
                    </View>
                    <View style={styles.workingRow}>
                        <Text style={styles.workingLabel}>Public Holiday</Text>
                        <Text style={styles.workingValue}>{123}</Text>
                    </View>
                    <View style={styles.workingRow}>
                        <Text style={styles.workingLabel}>Paid Days</Text>
                        <Text style={styles.workingValue}>{123}</Text>
                    </View>
                </View>
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>PF Number</Text>
                    <Text style={styles.infoValue}>{data.employeeStatutoryDetails.pf_number}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ESI Number</Text>
                    <Text style={styles.infoValue}>{data.employeeStatutoryDetails.esic_number}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>UAN Number</Text>
                    <Text style={styles.infoValue}>{data.employeeStatutoryDetails.uan_number}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Date of Joining</Text>
                    <Text style={styles.infoValue}>{data.employeeProjectAssignmentData.start_date}</Text>
                </View>
            </View>

            {/* Earnings and Deductions */}
            <View style={styles.earningsSection}>
                {/* Earnings Column */}
                <View style={styles.column}>
                    <View style={styles.columnHeader}>
                        <Text style={styles.columnTitle}>EARNINGS DETAILS</Text>
                    </View>
                    {
                        data.earnings.map((earning) => {
                            return <View style={styles.earningRow} key={earning.name}>
                                <Text>{earning.name}</Text>
                                <Text>₹{earning.amount.toFixed(2)}</Text>
                            </View>
                        })
                    }
                    <View style={styles.totalRow}>
                        <Text>Gross Pay</Text>
                        <Text>₹{data.earnings.reduce((sum, earning) => sum + earning.amount, 0).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Deductions Column */}
                <View style={styles.column}>
                    <View style={styles.columnHeader}>
                        <Text style={styles.columnTitle}>DEDUCTION DETAILS</Text>
                    </View>
                    {
                        data.deductions.map((deduction) => {
                            return <View style={styles.earningRow} key={deduction.name}>
                                <Text>{deduction.name}</Text>
                                <Text>₹{deduction.amount.toFixed(2)}</Text>
                            </View>
                        })
                    }
                    <View style={styles.totalRow}>
                        <Text>Total Deductions</Text>
                        <Text>₹{data.deductions.reduce((sum, deduction) => sum + deduction.amount, 0).toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            {/* Net Payable */}
            <View style={styles.netPayable}>
                <Text style={styles.netPayableAmount}>{`Net Payable: Rs ${netPay}`}</Text>
                <Text style={styles.netPayableWords}>{numberToWordsIndian(netPay)}</Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                This is computer generated statement hence does not require a signature.
            </Text>
        </Page>
    </Document>
};

export async function loader({ request, params }: LoaderFunctionArgs) {
    const payrollId = params.payrollId as string;
    const employeeId = params.employeeId as string;
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    // refer which data we have to fetch from the Notepad
    const { data: employeeCompanyData } = await getCompanyById({ supabase, id: companyId });
    const { data: payrollData } = await getPayrollById({ supabase, payrollId });
    const { data: employeeData } = await getEmployeeById({ supabase, id: employeeId });
    const { data: employeeProjectAssignmentData } = await getEmployeeProjectAssignmentByEmployeeId({ supabase, employeeId });
    const { data: employeeCompanyLocationData } = await getPrimaryLocationByCompanyId({ supabase, companyId });
    const { data: employeeStatutoryDetails } = await getEmployeeStatutoryDetailsById({ supabase, id: employeeId });

    // const workingDetails = []; 
    const earnings: { amount: number, name: string }[] = [];
    const deductions: { amount: number, name: string }[] = [];

    const { data: payrollEntriesData } = await getPaymentTemplateComponentIdsAndAmountByPayrollIdAndEmployeeId({ supabase, employeeId, payrollId });

    if (payrollEntriesData) {
        await Promise.all(
            payrollEntriesData.map(async (payrollEntryData) => {
                if (payrollEntryData?.payment_template_components_id) {
                    const { data: paymentTemplateComponentData } = await getPaymentTemplateComponentById({
                        supabase,
                        id: payrollEntryData.payment_template_components_id,
                    });
                    if (!paymentTemplateComponentData) return;

                    let name = "";
                    const amount = payrollEntryData.amount as number;
                    const componentType = paymentTemplateComponentData.component_type;

                    // Determine the name based on target type
                    if (paymentTemplateComponentData.target_type === "payment_field") {
                        const { data: paymentFieldData } = await getPaymentFieldById({
                            supabase,
                            id: paymentTemplateComponentData.payment_field_id as string,
                        });
                        name = paymentFieldData?.name || "";
                    }
                    else if (paymentTemplateComponentData.target_type === "bonus") name = "Bonus";
                    else if (paymentTemplateComponentData.target_type === "epf") name = "Employee Provident Fund";
                    else if (paymentTemplateComponentData.target_type === "esi") name = "Employee State Insurance";
                    else if (paymentTemplateComponentData.target_type === "lwf") name = "Labour Welfare Fund";
                    else if (paymentTemplateComponentData.target_type === "pt") name = "Professional Tax";

                    // Categorize into deductions or earnings
                    if (componentType === "deduction" || componentType === "statutory_contribution")
                        deductions.push({ name, amount });
                    else
                        earnings.push({ name, amount });
                }
            })
        );
    }

    return { data: { employeeCompanyData, payrollData, employeeData, employeeCompanyLocationData, employeeProjectAssignmentData, employeeStatutoryDetails, earnings, deductions } };
}

export default function SalarySlip() {
    const { data } = useLoaderData<{ data: DataType }>();
    const navigate = useNavigate();
    const { isDocument } = useIsDocument();

    if (!isDocument) return <div>Loading...</div>;

    const handleOpenChange = () => {
        navigate(-1);
    };

    return <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0" disableIcon={true}>
            <PDFViewer width="100%" height="100%">
                <SalarySlipPDF data={data as DataType} />
            </PDFViewer>
        </DialogContent>
    </Dialog>
}