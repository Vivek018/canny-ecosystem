import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    paddingBottom: 75,
  },
  wrapper: {
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
    fontSize: 10,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    flexGrow: 1,
  },
  header: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  headerDate: {
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
    marginTop: 10,
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
    marginVertical: 20,
  },
  h1Text: {
    fontSize: "32px",
  },
  h2Text: {
    fontSize: "24px",
  },
  h3Text: {
    fontSize: "18.72px",
  },
  h4Text: {
    fontSize: "16px",
  },
  h5Text: {
    fontSize: "13.28px",
  },
  h6Text: {
    fontSize: "10.72px",
  },
  subject: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    marginVertical: 10,
  },
  section: {
    marginBottom: 10,
  },
  keyPoints: {
    marginLeft: 15,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  footer: {
    position: "absolute",
    bottom: -20,
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
    marginBottom: 10,
  },
  table: {
    marginVertical: 10,
    borderColor: "#000",
    width: "70%",
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: "3px",
    textAlign: "center",
    fontWeight: "bold",
    border: "1px solid #000",
  },
  tableRow: {
    justifyContent: "space-between",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: "3px",
    border: "1px solid #000",
  },
  tableCell: {
    textTransform: "capitalize",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: "3px",
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
    width: "40%",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 40,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  // List Styles
  list: {
    marginLeft: 20, // Indentation for lists
    marginBottom: 10,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 4,
    color: "#333", // Dark gray for list items
  },

  // Blockquote Styles
  blockquote: {
    borderLeft: "4px solid #ccc", // Subtle border for blockquotes
    paddingLeft: 10,
    marginLeft: 0,
    marginBottom: 10,
    fontSize: 12,
    color: "#555", // Lighter gray for blockquotes
    fontStyle: "italic",
  },

  // Code Block Styles
  codeblock: {
    backgroundColor: "#f4f4f4", // Light gray background for the entire block
    padding: 10, // Padding around the code block
    borderRadius: 4, // Rounded corners
    marginBottom: 10, // Space below the block
    overflowWrap: "break-word", // Prevents horizontal overflow
    fontFamily: "Courier", // Monospace font for code
    fontSize: 10, // Smaller font size for readability
    color: "#333", // Dark gray text for code
    whiteSpace: "pre-wrap", // Preserve whitespace but wrap long lines
  },
  code: {
    fontFamily: "Courier", // Monospace font for inline code
    fontSize: 10, // Consistent font size
    color: "#000", // Black text for inline code
  },

  // Inline Code Styles
  inlineCode: {
    backgroundColor: "#f4f4f4", // Light gray background for inline code
    padding: "2px 4px",
    borderRadius: 4,
    fontFamily: "Courier", // Monospace font for inline code
    fontSize: 10,
    color: "#000", // Black text for inline code
  },
  link: {
    color: "#007BFF", // Blue color for links
    textDecoration: "underline", // Underline for clickable links
  },
  // Image Styles
  image: {
    width: "100%", // Full-width images by default
    height: "auto", // Maintain aspect ratio
    marginBottom: 10,
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
  italicText: {
    fontStyle: "italic",
  },
  underlineText: {
    textDecoration: "underline",
  },
  delText: {
    textDecoration: "line-through",
  },
  supText: {
    verticalAlign: "super",
  },
  subText: {
    verticalAlign: "sub",
  },
  centerText: {
    textAlign: "center",
  },
});

export const replacePlaceholders = (
  content: string | null | undefined,
  replacements: any,
) => {
  return (
    content?.replace(/\$\{(\w+)\}/g, (_, key) => replacements[key] || "") ?? ""
  );
};
