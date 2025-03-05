import { StyleSheet } from "@react-pdf/renderer";
import { DEFAULT_APPOINTMENT_LETTER, DEFAULT_EXPERIENCE_LETTER, DEFAULT_NOC_LETTER, DEFAULT_OFFER_LETTER, DEFAULT_RELIEVING_LETTER, DEFAULT_TERMINATION_LETTER } from "../constant";

export const styles = StyleSheet.create({
  page: {
    paddingBottom: 75,
  },
  indent: {
    padding: 20,
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
    marginHorizontal: "auto",
    marginVertical: "5px",
    width: "60%",
    maxWidth: "80%",
    borderTop: "1px solid #000",
    borderLeft: "1px solid #000",
  },
  tableHeader: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "white",
  },
  tableBody: {
    display: "flex",
    backgroundColor: "white",
    flexDirection: "column",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 0
  },
  th: {
    textTransform: "capitalize",
    textAlign: "center",
    flex: 1,
    paddingTop: "2px",
    paddingHorizontal: "3px",
    borderBottom: "1px solid #000",
    borderRight: "1px solid #000",
  },
  tableCell: {
    textTransform: "capitalize",
    textAlign: "center",
    flex: 1,
    paddingTop: "2px",
    paddingHorizontal: "3px",
    borderBottom: "1px solid #000",
    borderRight: "1px solid #000",
  },
  tableCellAmount: {
    width: 100,
    textAlign: "right",
  },
  signatureSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
    width: "100%",
    height: "auto",
    // marginBottom: 10,
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
  replacements: Record<string, any>,
) => {
  return (
    content?.replace(/\$\{(\w+)\}/g, (_, key) => {
      let value = replacements[key];

      if (value === "Invalid Date") {
        value = "";
      }
      return value || "";
    }) || ""
  );
};

export const bringDefaultLetterContent = (letterType: string | undefined, data: any) => {
  const salaryTablemarkdownLines = [
    "| **Particulars**           | **Amount (Rs.)** |",
    "|---------------------------|-----------------|"
  ];
  let totalGrossEarning = 0;
  let totalDeductions = 0;

  if (data?.earning) {
    for (const [key, value] of Object.entries(data.earning)) {
      const amount = value as number;
      salaryTablemarkdownLines.push(`| ${key.charAt(0).toUpperCase() + key.slice(1)}                     | ${amount.toLocaleString()}/-           |`);
      totalGrossEarning += amount;
    }

    salaryTablemarkdownLines.push(`| **Gross Earning**         | **${totalGrossEarning.toLocaleString()}/-**     |`);
  }

  if (data?.statutory_contribution) {
    for (const [key, value] of Object.entries(data.statutory_contribution)) {
      const amount = value as number;
      salaryTablemarkdownLines.push(`| ${key.toUpperCase()}                       | ${amount.toLocaleString()}/-           |`);
      totalDeductions += amount;
    }
  }

  if (data?.deduction) {
    for (const [key, value] of Object.entries(data.deduction)) {
      const amount = value as number;
      salaryTablemarkdownLines.push(`| ${key}                 | ${amount.toLocaleString()}/-           |`);
      totalDeductions += amount;
    }
  }

  const netSalary = totalGrossEarning - totalDeductions;
  salaryTablemarkdownLines.push(`| **Net Salary**            | **${netSalary.toLocaleString()}/-** |`);

  const salaryTableMarkdown = `\n
  # YOUR TOTAL COST OF COMPANY WILL BE AS BELOW:

    ${salaryTablemarkdownLines.join('\n')}`

  switch (letterType) {
    case "appointment_letter":
      return DEFAULT_APPOINTMENT_LETTER + salaryTableMarkdown;

    case "experience_letter":
      return DEFAULT_EXPERIENCE_LETTER;

    case "offer_letter":
      return DEFAULT_OFFER_LETTER;

    case "noc_letter":
      return DEFAULT_NOC_LETTER;

    case "relieving_letter":
      return DEFAULT_RELIEVING_LETTER;

    case "termination_letter":
      return DEFAULT_TERMINATION_LETTER;

    default:
      return ""
  }
};