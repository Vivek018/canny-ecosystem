import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 10,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  headerDate: {
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    marginVertical: 20,
  },
  recipient: {
    width: "35%",
    marginBottom: 14,
  },
  text: {
    marginBottom: 5,
  },
  title: {
    marginHorizontal: "auto",
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 20,
  },
  subject: {
    marginBottom: 20,
  },
  paragraphTitle: {
    fontFamily: "Helvetica-Bold",
    marginVertical: 10,
  },
  paragraph: {
    marginBottom: 10,
  },
  keyPoints: {
    marginLeft: 15,
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
  },
  addressSection: {
    marginBottom: 15,
  },
  reference: {
    marginBottom: 15,
  },
  content: {
    marginBottom: 15,
  },
  normalText: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  table: {
    marginVertical: 10,
    borderColor: "#000",
    width: "70%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: "3px",
    border: "1px solid #000",
  },
  tableCell: {
    flex: 1,
  },
  tableCellAmount: {
    width: 100,
    textAlign: "right",
  },
  signatureSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureBox: {
    width: 200,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 40,
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
  underlineText: {
    textDecoration: "underline",
  },
  centerText: {
    textAlign: "center",
  },
});
