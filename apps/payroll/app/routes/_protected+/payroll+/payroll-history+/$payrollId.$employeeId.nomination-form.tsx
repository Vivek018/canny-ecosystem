import { Dialog, DialogContent } from '@canny_ecosystem/ui/dialog';
import { formatDateTime } from '@canny_ecosystem/utils';
import { useIsDocument } from '@canny_ecosystem/utils/hooks/is-document';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { useNavigate } from '@remix-run/react';

const styles = StyleSheet.create({
  page: {
    padding: '40 50',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 15,
  },
  formField: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '25%',
    fontSize: 10,
  },
  value: {
    flex: 1,
    borderBottom: '1 solid black',
    marginLeft: 5,
    paddingBottom: 2,
  },
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTop: '1 solid black',
    borderLeft: '1 solid black',
    borderRight: '1 solid black',
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: '1 solid black',
    borderRight: '1 solid black',
    borderBottom: '1 solid black',
  },
  tableCell: {
    padding: '5 3',
    borderRight: '1 solid black',
    fontSize: 9,
  },
  certification: {
    fontSize: 9,
    marginTop: 10,
    marginBottom: 10,
  },
  signature: {
    marginTop: 20,
    fontSize: 9,
    textAlign: 'right',
  },
  employerSection: {
    marginTop: 30,
    borderTop: '1 dashed black',
    paddingTop: 10,
  },
});

export const NominationFormPDF = () => (
  <Document title={`Nomination Form - ${formatDateTime(Date.now())}`}>
    <Page size="A4" style={styles.page}>
      {/* Title Section */}
      <Text style={styles.title}>(FORM 2 REVISED)</Text>
      <Text style={styles.title}>NOMINATION AND DECLARATION FORM FOR UNEXEMPTED / EXEMPTED ESTABLISHMENTS</Text>
      <Text style={styles.subtitle}>
        Declaration and Nomination Form under the Employees Provident Funds and Employees Pension Schemes{'\n'}
        (Paragraph 33 and 61 (1) of the Employees Provident Fund Scheme 1952 and Paragraph 18 of the Employees{'\n'}
        Pension Scheme 1995)
      </Text>

      {/* Personal Information Fields */}
      <View style={styles.formField}>
        <Text style={styles.label}>1. Name (IN BLOCK LETTERS)</Text>
        <Text style={styles.value}>_____________________________________________________________________</Text>
      </View>

      <View style={styles.formField}>
        <Text style={styles.label}>2. Date of Birth</Text>
        <Text style={styles.value}>________________</Text>
        <Text style={[styles.label, { width: '15%', marginLeft: 20 }]}>3. Account No.</Text>
        <Text style={[styles.value, { flex: 0.5 }]}>________________</Text>
      </View>

      <View style={styles.formField}>
        <Text style={styles.label}>4. Sex : MALE/FEMALE</Text>
        <Text style={styles.value}>________________</Text>
        <Text style={[styles.label, { width: '15%', marginLeft: 20 }]}>5. Marital Status</Text>
        <Text style={[styles.value, { flex: 0.5 }]}>________________</Text>
      </View>

      <View style={styles.formField}>
        <Text style={styles.label}>6. Address Permanent / Temporary</Text>
        <Text style={styles.value}>_____________________________________________________________________</Text>
      </View>

      {/* Part A Section */}
      <Text style={[styles.title, { marginTop: 20 }]}>PART – A (EPF)</Text>
      <Text style={{ fontSize: 9, marginBottom: 10 }}>
        I hereby nominate the person(s)/cancel the nomination made by me previously and nominate the person(s) mentioned below
        to receive the amount standing to my credit in the Employees Provident Fund, in the event of my death.
      </Text>

      {/* EPF Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { width: '20%' }]}>Name of the Nominee(s)</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Address</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Nominee's relationship with the member</Text>
          <Text style={[styles.tableCell, { width: '10%' }]}>Date of Birth</Text>
          <Text style={[styles.tableCell, { width: '15%' }]}>Total amount or share of accumulations</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>If the nominee is minor, guardian details</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: '20%' }]} />
          <Text style={[styles.tableCell, { width: '20%' }]} />
          <Text style={[styles.tableCell, { width: '15%' }]} />
          <Text style={[styles.tableCell, { width: '10%' }]} />
          <Text style={[styles.tableCell, { width: '15%' }]} />
          <Text style={[styles.tableCell, { width: '20%' }]} />
        </View>
      </View>

      <Text style={styles.certification}>
        1. *Certified that I have no family as defined in para 2 (g) of the Employees Provident Fund Scheme 1952 and should I
        acquire a family hereafter the above nomination should be deemed as cancelled.{'\n'}
        2. *Certified that my father/mother is/are dependent upon me.
      </Text>

      <Text style={styles.signature}>Signature/or thumb impression{'\n'}of the subscriber</Text>

      {/* Part B Section */}
      <Text style={[styles.title, { marginTop: 20 }]}>PART – B (EPS)</Text>
      <Text style={{ fontSize: 9, marginBottom: 10 }}>Para 18</Text>
      <Text style={{ fontSize: 9, marginBottom: 10 }}>
        I hereby furnish below particulars of the members of my family who would be eligible to receive Widow/Children Pension in the
        event of my premature death in service.
      </Text>

      {/* EPS Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { width: '10%' }]}>Sr. No</Text>
          <Text style={[styles.tableCell, { width: '40%' }]}>Name & Address of the Family Member</Text>
          <Text style={[styles.tableCell, { width: '25%' }]}>Age</Text>
          <Text style={[styles.tableCell, { width: '25%' }]}>Relationship with the member</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: '10%' }]} />
          <Text style={[styles.tableCell, { width: '40%' }]} />
          <Text style={[styles.tableCell, { width: '25%' }]} />
          <Text style={[styles.tableCell, { width: '25%' }]} />
        </View>
      </View>

      {/* Employer Section */}
      <View style={styles.employerSection}>
        <Text style={{ fontSize: 9, marginBottom: 15 }}>CERTIFICATE BY EMPLOYER</Text>
        <Text style={{ fontSize: 9, marginBottom: 10 }}>
          Certified that the above declaration and nomination has been signed / thumb impressed before me by Shri / Smt./
          Miss_________________________________________________________________ employed in my establishment after he/she has
          read the entries / the entries have been read over to him/her by me and got confirmed by him/her.
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <View>
            <Text style={{ fontSize: 9 }}>Date: _____________________</Text>
            <Text style={{ fontSize: 9, marginTop: 10 }}>Place: _____________________</Text>
          </View>
          <View style={{ width: '50%', textAlign: 'center' }}>
            <Text style={{ fontSize: 9 }}>Signature of the employer or other authorised officer of the</Text>
            <Text style={{ fontSize: 9 }}>establishment</Text>
            <Text style={{ fontSize: 9, marginTop: 10 }}>Name & address of the Factory /Establishment</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default function NominationForm() {
  // const { data } = useLoaderData<{ data: DataType }>();
  const navigate = useNavigate();
  const { isDocument } = useIsDocument();

  if (!isDocument) return <div>Loading...</div>;

  const handleOpenChange = () => {
    navigate(-1);
  };

  return <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
    <DialogContent className="w-full max-w-2xl h-[90%] border border-gray-200 rounded-lg p-0" disableIcon={true}>
      <PDFViewer width="100%" height="100%">
        <NominationFormPDF />
      </PDFViewer>
    </DialogContent>
  </Dialog>
}