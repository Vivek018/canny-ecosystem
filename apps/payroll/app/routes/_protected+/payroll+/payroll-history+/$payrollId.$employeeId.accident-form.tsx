import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { useNavigate } from '@remix-run/react';
import { useIsDocument } from '@canny_ecosystem/utils/hooks/is-document';
import { Dialog, DialogContent } from '@canny_ecosystem/ui/dialog';
import { formatDateTime } from '@canny_ecosystem/utils';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inputField: {
    borderBottom: '1px solid black',
    marginBottom: 10,
    height: 15,
  },
  table: {
    display: 'flex',
    width: '100%',
    borderCollapse: 'collapse',
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '50%',
    padding: 5,
    borderBottom: '1px solid black',
    borderRight: '1px solid black',
    borderStyle: 'solid',
    borderColor: 'black',
  },
  tableColFull: {
    width: '100%',
    padding: 5,
    borderBottom: '1px solid black',
    borderStyle: 'solid',
    borderColor: 'black',
  },
  tableColSmall: {
    width: '25%',
    padding: 5,
    borderBottom: '1px solid black',
    borderRight: '1px solid black',
    borderStyle: 'solid',
    borderColor: 'black',
  },
  tableColLarge: {
    width: '75%',
    padding: 5,
    borderBottom: '1px solid black',
    borderStyle: 'solid',
    borderColor: 'black',
  },
  signature: {
    marginTop: 20,
    fontSize: 10,
    textAlign: 'right',
  },
  yesNo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yesNoLabel: {
    marginRight: 10,
  },
  yesNoInput: {
    width: 15,
    height: 15,
    borderBottom: '1px solid black',
    marginRight: 5,
  },
  largeInputField: {
    borderBottom: '1px solid black',
    marginBottom: 10,
    height: 30,
  },
});

// Define the PDF component
const AccidentReportForm = () => (
  <Document title={`Accident Form - ${formatDateTime(Date.now())}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>FORM 12 (REGULATION 68) E.S.I. CORPORATION ACCIDENT REPORT</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name of Employer Code No. Branch Office</Text>
        <View style={styles.inputField} />
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Nature of Industry/ business                                                       Address of premises where accident happened</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Name & Address of insured person</Text>
            <View style={styles.inputField} />
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Insurance No.</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>Sex</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Age (Last birthday)</Text>
            <View style={styles.inputField} />
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Occupation</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>Department</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Shift Hour</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Exact place of accident</Text>
            <View style={styles.inputField} />
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Date and hour of Accident</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>Hour at which work was started</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Nature and extent of injury (e.g., total loss of finger, fracture of leg. scald etc.)</Text>
            <View style={styles.inputField} />
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Location of injury (right/left hand, leg or eye etc.)</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Dispensary/IMP of injured person</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>If the accident is not fatal state whether the injured person has returned to work? If so, give date & hour of return to work</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Dr. or dispensary from where injured person received or receiving treatment.</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Date of Death in case the insured person died</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>Brief description of the accident Note: -In case the accident happened while meeting emergency. indicate in the description above its nature and also whether the injured person at time of accident was employed for the purpose of his employer's trade or business in or about the premises which the accident took place.</Text>
            <View style={styles.largeInputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.label}>Whether wages in full or part are payable to him for the day of accident</Text>
            <View style={styles.yesNo}>
              <View style={styles.yesNoLabel}>
                <Text>Yes</Text>
              </View>
              <View style={styles.yesNoInput} />
              <View style={styles.yesNoLabel}>
                <Text>No</Text>
              </View>
              <View style={styles.yesNoInput} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Whether the injured person was on the day accident an employee as defined in Sec 2 (9) of the Act and whether contribution was payable by him/her for the day on which the accident occurred.</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Name and address of witnesses</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>1.</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>2.</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>(a) CAUSE OF ACCIDENT if caused by Machinery</Text>
            <Text style={styles.label}>(1) Give name of machine and part causing the accident, and:</Text>
            <View style={styles.yesNo}>
              <View style={styles.yesNoLabel}>
                <Text>Yes</Text>
              </View>
              <View style={styles.yesNoInput} />
              <View style={styles.yesNoLabel}>
                <Text>No</Text>
              </View>
              <View style={styles.yesNoInput} />
            </View>
            <Text style={styles.label}>(a) State whether it was moved by mechanical power at that time?</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>(b) State exactly what the injured person was doing at that time?</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>(c) Was the injured person at that time of accident acting in contravention of?</Text>
            <Text style={styles.label}>the provisions of any law applicable to him or ................................................................ any orders given by or on behalf of his employer............................................................ acting without instruction from his employer..................................................................</Text>
            <View style={styles.inputField} />
            <Text style={styles.label}>(d) In case reply to C (1), (2) or (3) is YES, state whether the act was done for the purpose of and in connection with the employer's trade or business.</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>In case the accident happened while TRAVELLING in the employer's transport, state whether the injured person was travelling.</Text>
            <Text style={styles.label}>1. As a passenger to or from his place of work</Text>
            <View style={styles.yesNo}>
              <View style={styles.yesNoLabel}>
                <Text>Yes</Text>
              </View>
              <View style={styles.yesNoInput} />
              <View style={styles.yesNoLabel}>
                <Text>No</Text>
              </View>
              <View style={styles.yesNoInput} />
            </View>
            <Text style={styles.label}>2. With the express or implied permission of his employer</Text>
            <View style={styles.yesNo}>
              <View style={styles.yesNoLabel}>
                <Text>Yes</Text>
              </View>
              <View style={styles.yesNoInput} />
              <View style={styles.yesNoLabel}>
                <Text>No</Text>
              </View>
              <View style={styles.yesNoInput} />
            </View>
            <Text style={styles.label}>3. The transport was being operated or on behalf of the employer or some other person by whom it is provided in pursuance of arrangements made with the employer.</Text>
            <View style={styles.yesNo}>
              <View style={styles.yesNoLabel}>
                <Text>Yes</Text>
              </View>
              <View style={styles.yesNoInput} />
              <View style={styles.yesNoLabel}>
                <Text>No</Text>
              </View>
              <View style={styles.yesNoInput} />
            </View>
            <Text style={styles.label}>4. The vehicle was being/not being operated in the ordinary course of public transport</Text>
            <View style={styles.yesNo}>
              <View style={styles.yesNoLabel}>
                <Text>Yes</Text>
              </View>
              <View style={styles.yesNoInput} />
              <View style={styles.yesNoLabel}>
                <Text>No</Text>
              </View>
              <View style={styles.yesNoInput} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>I certify that to the best of my knowledge and belief the above particulars are correct in every respect.</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Date of dispatch of report</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Signature</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>TO Designation (With stamp)</Text>
            <View style={styles.inputField} />
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColFull}>
            <Text style={styles.label}>Diary No. & Date Branch Office Manager</Text>
            <View style={styles.inputField} />
          </View>
        </View>
      </View>
    </Page>
  </Document>
);


// Main component to render the PDF viewer
export default function AccidentForm() {
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
        <AccidentReportForm />
      </PDFViewer>
    </DialogContent>
  </Dialog>
}