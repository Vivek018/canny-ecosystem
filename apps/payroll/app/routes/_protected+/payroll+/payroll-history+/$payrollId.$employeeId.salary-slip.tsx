// app/routes/salary-slip.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect } from 'react';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  employeeInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    borderBottom: 1,
    borderColor: '#000',
    paddingBottom: 10,
  },
  employeeInfoItem: {
    width: '50%',
    fontSize: 10,
    marginBottom: 5,
  },
  table: {
    flexDirection: 'row',
    borderTop: 1,
    borderColor: '#000',
  },
  column: {
    flex: 1,
    borderRight: 1,
    borderColor: '#000',
    padding: 5,
  },
  columnHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  columnContent: {
    fontSize: 9,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    flex: 1,
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  totalSection: {
    marginTop: 15,
    borderTop: 1,
    borderColor: '#000',
    paddingTop: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

// Types
interface EmployeeData {
  empId: string;
  name: string;
  designation: string;
  department: string;
  pfNo: string;
  esiNo: string;
  location: string;
  workingDays: {
    wd: number;
    wo: number;
    ph: number;
    pd: number;
    cl: number;
    pl: number;
  };
  earnings: {
    basic: number;
    hra: number;
    da: number;
    conv: number;
    bonus: number;
    other: number;
  };
  deductions: {
    pf: number;
    esi: number;
    pt: number;
    lwf: number;
    it: number;
    advance: number;
  };
}

// PDF Document Component
const SalarySlipPDF = ({ employeeData }: { employeeData: EmployeeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Salary Slip</Text>
        <Text style={styles.subtitle}>For The Month Of December - 2024</Text>
      </View>

      {/* Company Information */}
      <View style={styles.companyInfo}>
        <Text>CANNY MANAGEMENT SERVICES PVT.LTD.</Text>
        <Text>7, 2nd. FLOOR, V.K.COMPLEX, OPP.GURUDWARA, ODHAV, AHMEDABAD - 382415</Text>
        <Text>BARBIL-JODA HIGHWA AT/PO-SERENDA, VIA-BARBIL KEONJHAR,ODISHA</Text>
        <Text>COTECNA INSPECTION INDIA PVT.LTD.(BARBIL)</Text>
        <Text>Form IV B [ Rule 26(2) (b) ]</Text>
      </View>

      {/* Employee Information */}
      <View style={styles.employeeInfoContainer}>
        <View style={styles.employeeInfoItem}>
          <Text>Emp.Id: {employeeData.empId}</Text>
        </View>
        <View style={styles.employeeInfoItem}>
          <Text>Department: {employeeData.department}</Text>
        </View>
        <View style={styles.employeeInfoItem}>
          <Text>Designation: {employeeData.designation}</Text>
        </View>
        <View style={styles.employeeInfoItem}>
          <Text>Location: {employeeData.location}</Text>
        </View>
        <View style={styles.employeeInfoItem}>
          <Text>P.F. No: {employeeData.pfNo}</Text>
        </View>
        <View style={styles.employeeInfoItem}>
          <Text>ESI No: {employeeData.esiNo}</Text>
        </View>
      </View>

      {/* Main Content Tables */}
      <View style={styles.table}>
        {/* Working Details */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>WORKING DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>WD</Text>
            <Text style={styles.value}>{employeeData.workingDays.wd.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WO</Text>
            <Text style={styles.value}>{employeeData.workingDays.wo.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PH</Text>
            <Text style={styles.value}>{employeeData.workingDays.ph.toFixed(2)}</Text>
          </View>
        </View>

        {/* Earnings Details */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>EARNINGS DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Basic</Text>
            <Text style={styles.value}>{employeeData.earnings.basic.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>HRA</Text>
            <Text style={styles.value}>{employeeData.earnings.hra.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DA</Text>
            <Text style={styles.value}>{employeeData.earnings.da.toFixed(2)}</Text>
          </View>
        </View>

        {/* Deduction Details */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>DEDUCTION DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>P.F</Text>
            <Text style={styles.value}>{employeeData.deductions.pf.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ESI</Text>
            <Text style={styles.value}>{employeeData.deductions.esi.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>P.T</Text>
            <Text style={styles.value}>{employeeData.deductions.pt.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Totals Section */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text>Gross Income: Rs. {calculateGrossIncome(employeeData.earnings)}</Text>
          <Text>Total Deduction: Rs. {calculateTotalDeductions(employeeData.deductions)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Net Amount: Rs. {calculateNetAmount(employeeData)}</Text>
        </View>
        <Text style={{ fontSize: 10, marginTop: 5 }}>
          {convertToWords(calculateNetAmount(employeeData))}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>This is computer generated statement hence does not require a signature.</Text>
      </View>
    </Page>
  </Document>
);

// Utility functions for calculations
function calculateGrossIncome(earnings: EmployeeData['earnings']): number {
  return Object.values(earnings).reduce((sum, value) => sum + value, 0);
}

function calculateTotalDeductions(deductions: EmployeeData['deductions']): number {
  return Object.values(deductions).reduce((sum, value) => sum + value, 0);
}

function calculateNetAmount(employeeData: EmployeeData): number {
  const grossIncome = calculateGrossIncome(employeeData.earnings);
  const totalDeductions = calculateTotalDeductions(employeeData.deductions);
  return grossIncome - totalDeductions;
}

function convertToWords(amount: number): string {
  // Add your number to words conversion logic here
  return `Rupees ${amount.toFixed(2)} Only`;
}

// Loader function
export async function loader({ request, params }: LoaderFunctionArgs) {
  // In a real application, you would fetch this data from your backend
  const sampleEmployeeData: EmployeeData = {
    empId: "SVVBRAB718",
    name: "SHYAMASUNDAR PATRA",
    designation: "Sr. SAMPLER",
    department: "FACILITY SERVICES",
    pfNo: "GJNRD61115//19436",
    esiNo: "4407110619",
    location: "BARBIL",
    workingDays: {
      wd: 0,
      wo: 5,
      ph: 26,
      pd: 0,
      cl: 0,
      pl: 0,
    },
    earnings: {
      basic: 3000,
      hra: 2000,
      da: 0,
      conv: 0,
      bonus: 0,
      other: 0,
    },
    deductions: {
      pf: 1722,
      esi: 125,
      pt: 145,
      lwf: 0,
      it: 0,
      advance: 0,
    },
  };

  return { employeeData: sampleEmployeeData };
}

// Main Component
export default function SalarySlip() {
  const { employeeData } = useLoaderData<typeof loader>();
  const [isClient, setIsClient] = useState(false);
  const [PDFDownloadLink, setPDFDownloadLink] = useState<any>(null);
  const [PDFViewer, setPDFViewer] = useState<any>(null);

  useEffect(() => {
    import('@react-pdf/renderer').then((module) => {
      setPDFDownloadLink(() => module.PDFDownloadLink);
      setPDFViewer(() => module.PDFViewer);
    });
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* <div className="mb-4 flex gap-4 items-center">
        <h1 className="text-2xl font-bold">Employee Salary Slip</h1>
        {PDFDownloadLink && (
          <PDFDownloadLink
            document={<SalarySlipPDF employeeData={employeeData} />}
            fileName={`salary-slip-${employeeData.empId}.pdf`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Loading document...' : 'Download Salary Slip'
            }
          </PDFDownloadLink>
        )}
      </div> */}

      {PDFViewer && (
        <div className="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden">
          <PDFViewer width="100%" height="100%">
            <SalarySlipPDF employeeData={employeeData} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}