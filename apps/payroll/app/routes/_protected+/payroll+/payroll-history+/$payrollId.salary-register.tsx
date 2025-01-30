import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useIsDocument } from '@canny_ecosystem/utils/hooks/is-document';
import { Dialog, DialogContent } from '@canny_ecosystem/ui/dialog';
import { getSupabaseWithHeaders } from '@canny_ecosystem/supabase/server';
import { getCompanyIdOrFirstCompany } from '@/utils/server/company.server';
import { type EmployeeProjectAssignmentDataType, getCompanyById, getCompanyRegistrationDetailsByCompanyId, getEmployeeById, getEmployeeProjectAssignmentByEmployeeId, getEmployeeStatutoryDetailsById, getPaymentFieldById, getPaymentTemplateComponentById, getPaymentTemplateComponentIdsAndAmountByPayrollIdAndEmployeeId, getPayrollById, getPrimaryCompanyLocationById, getUniqueEmployeeIdsByPayrollId } from '@canny_ecosystem/supabase/queries';
import { CANNY_MANAGEMENT_SERVICES_ADDRESS, CANNY_MANAGEMENT_SERVICES_COMPANY_ID, CANNY_MANAGEMENT_SERVICES_NAME } from '@/constant';
import type { CompanyDatabaseRow, CompanyRegistrationDetailsRow, EmployeeDatabaseRow, EmployeeStatutoryDetailsDatabaseRow, LocationDatabaseRow, PayrollDatabaseRow } from '@canny_ecosystem/supabase/types';

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: '20 10',
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#FFFFFF',
    },
    title: {
        marginBottom: 15,
        textAlign: 'center',
    },
    titleText: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
    },
    monthText: {
        fontSize: 12,
        color: '#444444',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F6F6F6',
        borderBottom: '1pt solid #000000',
        borderTop: '1pt solid #000000',
    },
    headerCell: {
        padding: 4,
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        textAlign: 'center',
        borderRight: '0.5pt solid #000000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid #000000',
        minHeight: 35,
    },
    tableCell: {
        padding: 4,
        fontSize: 7,
        textAlign: 'center',
        borderRight: '0.5pt solid #000000',
    },
    employeeDetails: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },

    employeeName: {
        fontFamily: 'Helvetica-Bold',
        marginBottom: 1,
        textAlign: 'left',
    },
    employeeCode: {
        color: '#666666',
        textAlign: 'left',
    },
    statutoryDetails: {
        color: '#444444',
        fontSize: 6,
        marginTop: 1,
        textAlign: 'left',
    },
    amountCell: {
        fontFamily: 'Helvetica-Bold',
        color: '#333333',
    },
    componentList: {
        flexDirection: 'column',
    },
    componentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 6,
        marginBottom: 1,
    },
    signatureBox: {
        borderBottom: '0.5pt dotted #000000',
        minHeight: 20,
        margin: '8 4',
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
});

type DataType = {
    cannyData: CompanyRegistrationDetailsRow,
    payrollData: PayrollDatabaseRow,
    companyData: CompanyDatabaseRow,
    employeeCompanyLocationData: LocationDatabaseRow,
    employeeData: {
        employeeData: EmployeeDatabaseRow,
        employeeProjectAssignmentData: EmployeeProjectAssignmentDataType,
        employeeStatutoryDetails: EmployeeStatutoryDetailsDatabaseRow,
        earnings: { name: string, amount: number }[],
        deductions: { name: string, amount: number }[],
    }[],
}

const SalaryRegisterPDF = ({ data }: { data: DataType }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Company Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.companyName}>{data.companyData.name}</Text>
                        <Text style={styles.companyAddress}>{`${data.employeeCompanyLocationData.address_line_1}, ${data.employeeCompanyLocationData.address_line_2}, ${data.employeeCompanyLocationData.city}, ${data.employeeCompanyLocationData.state}, ${data.employeeCompanyLocationData.pincode}`}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.companyName}>{CANNY_MANAGEMENT_SERVICES_NAME}</Text>
                        <Text style={styles.companyAddress}>{CANNY_MANAGEMENT_SERVICES_ADDRESS}</Text>
                    </View>
                </View>
                <Text style={styles.formNumber}>Salary Register</Text>

                <View style={[styles.tableHeader, { borderLeft: '0.5pt solid #000000' }]}>
                    <View style={[styles.headerCell, { flex: 0.5 }]}>
                        <Text>Sr No.</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 2 }]}>
                        <Text>Employee Details</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 1 }]}>
                        <Text>Working Details</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 2.5 }]}>
                        <Text>Earnings</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 0.8 }]}>
                        <Text>Gross Salary</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 2.5 }]}>
                        <Text>Deductions</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 0.8 }]}>
                        <Text>Total Deductions</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 0.8 }]}>
                        <Text>Net Salary</Text>
                    </View>
                    <View style={[styles.headerCell, { flex: 1, borderRight: 'none' }]}>
                        <Text>Signature / Thumb Impression</Text>
                    </View>
                </View>

                {data.employeeData.map((employee, index) => (
                    <View key={employee.employeeData.employee_code} style={[styles.tableRow, { borderLeft: '0.5pt solid #000000' }]}>
                        <View style={[styles.tableCell, { flex: 0.5 }]}>
                            <Text>{index + 1}</Text>
                        </View>

                        <View style={[styles.tableCell, { flex: 2 }]}>
                            <View style={styles.employeeDetails}>
                                <Text style={styles.employeeName}>
                                    {`${employee.employeeData.first_name} ${employee.employeeData.middle_name} ${employee.employeeData.last_name}`}
                                </Text>
                                <Text style={styles.employeeCode}>
                                    {employee.employeeData.employee_code}
                                </Text>
                                <Text style={styles.statutoryDetails}>
                                    {employee.employeeProjectAssignmentData.position}
                                </Text>
                                <Text style={styles.statutoryDetails}>
                                    PF: {employee.employeeStatutoryDetails.pf_number}
                                </Text>
                                <Text style={styles.statutoryDetails}>
                                    ESI: {employee.employeeStatutoryDetails.esic_number}
                                </Text>
                                <Text style={styles.statutoryDetails}>
                                    UAN: {employee.employeeStatutoryDetails.uan_number}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.tableCell, { flex: 1 }]}>
                            <Text>WORKING DETAILS</Text>
                        </View>

                        <View style={[styles.tableCell, { flex: 2.5 }]}>
                            <View style={styles.componentList}>
                                {employee.earnings.map((earning) => (
                                    <View key={earning.name} style={styles.componentItem}>
                                        <Text>{earning.name}</Text>
                                        <Text>₹{earning.amount.toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.tableCell, { flex: 0.8 }]}>
                            <Text style={styles.amountCell}>
                                ₹{employee.earnings.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                            </Text>
                        </View>

                        <View style={[styles.tableCell, { flex: 2.5 }]}>
                            <View style={styles.componentList}>
                                {employee.deductions.map((deduction) => (
                                    <View key={deduction.name} style={styles.componentItem}>
                                        <Text>{deduction.name}</Text>
                                        <Text>₹{deduction.amount.toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.tableCell, { flex: 0.8 }]}>
                            <Text style={styles.amountCell}>
                                ₹{employee.deductions.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                            </Text>
                        </View>

                        <View style={[styles.tableCell, { flex: 0.8 }]}>
                            <Text style={styles.amountCell}>
                                ₹{(
                                    employee.earnings.reduce((sum, item) => sum + item.amount, 0) -
                                    employee.deductions.reduce((sum, item) => sum + item.amount, 0)
                                ).toFixed(2)}
                            </Text>
                        </View>

                        <View style={[styles.tableCell, { flex: 1, borderRight: 'none' }]}>
                        </View>
                    </View>
                ))}

                {/* Footer */}
                <Text style={styles.footer}>
                    This is computer generated statement hence does not require a signature.
                </Text>
            </Page>
        </Document>
    );
};

export async function loader({ request, params }: LoaderFunctionArgs) {
    const payrollId = params.payrollId as string;
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const { data: cannyData } = await getCompanyRegistrationDetailsByCompanyId({ supabase, companyId: CANNY_MANAGEMENT_SERVICES_COMPANY_ID });
    const { data: employeeCompanyLocationData } = await getPrimaryCompanyLocationById({ supabase, id: companyId });
    const { data: uniqueEmployeeIdsData } = await getUniqueEmployeeIdsByPayrollId({ supabase, payrollId });
    const { data: companyData } = await getCompanyById({ supabase, id: companyId });
    const { data: payrollData } = await getPayrollById({ supabase, payrollId });

    const salaryRegister = {
        cannyData,
        payrollData,
        companyData,
        employeeCompanyLocationData,
        employeeData: [],
    };

    if (uniqueEmployeeIdsData?.length) {
        const employeeDataPromises = uniqueEmployeeIdsData.map(async (employeeId) => {
            const { data: employeeData } = await getEmployeeById({ supabase, id: employeeId as string });
            const { data: employeeProjectAssignmentData } = await getEmployeeProjectAssignmentByEmployeeId({ supabase, employeeId: employeeId as string });
            const { data: employeeStatutoryDetails } = await getEmployeeStatutoryDetailsById({ supabase, id: employeeId as string });

            const earnings: { amount: number; name: string }[] = [];
            const deductions: { amount: number; name: string }[] = [];

            const { data: payrollEntriesData } = await getPaymentTemplateComponentIdsAndAmountByPayrollIdAndEmployeeId({ supabase, employeeId: employeeId as string, payrollId });

            if (payrollEntriesData?.length) {
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

                            if (componentType === "deduction" || componentType === "statutory_contribution")
                                deductions.push({ name, amount });
                            else
                                earnings.push({ name, amount });
                        }
                    })
                );
            }

            return {
                employeeData,
                employeeProjectAssignmentData,
                employeeStatutoryDetails,
                earnings,
                deductions,
            };
        });

        salaryRegister.employeeData = await Promise.all(employeeDataPromises) as any;
    }

    return { salaryRegister };
}

export default function SalaryRegister() {
    const { salaryRegister: data } = useLoaderData<{ salaryRegister: DataType }>();
    const navigate = useNavigate();
    const { isDocument } = useIsDocument();

    if (!isDocument) return <div>Loading...</div>;

    const handleOpenChange = () => {
        navigate(-1);
    };

    return <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0" disableIcon={true}>
            <PDFViewer width="100%" height="100%"><SalaryRegisterPDF data={data as DataType} /></PDFViewer>
        </DialogContent>
    </Dialog>
}