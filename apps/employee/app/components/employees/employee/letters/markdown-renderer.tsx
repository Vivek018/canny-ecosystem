import { styles } from "@canny_ecosystem/utils";
import { Image, Link, Text, View } from "@react-pdf/renderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => <Text style={styles.title}>{children}</Text>,
      h2: ({ children }) => <Text style={styles.h2Text}>{children}</Text>,
      h3: ({ children }) => <Text style={styles.h3Text}>{children}</Text>,
      h4: ({ children }) => <Text style={styles.h4Text}>{children}</Text>,
      h5: ({ children }) => <Text style={styles.h5Text}>{children}</Text>,
      h6: ({ children }) => <Text style={styles.h6Text}>{children}</Text>,
      p: ({ children }) => (
        <Text wrap style={styles.section}>
          {children}
        </Text>
      ),
      ul: ({ children }) => <View style={styles.list}>{children}</View>,
      ol: ({ children }) => <View style={styles.list}>{children}</View>,
      li: ({ children }) => <Text style={styles.listItem}>• {children}</Text>,
      strong: ({ children }) => <Text style={styles.boldText}>{children}</Text>,
      b: ({ children }) => <Text style={styles.boldText}>{children}</Text>,
      em: ({ children }) => <Text style={styles.italicText}>{children}</Text>,
      u: ({ children }) => <Text style={styles.underlineText}>{children}</Text>,
      del: ({ children }) => <Text style={styles.delText}>{children}</Text>,
      sup: ({ children }) => <Text style={styles.supText}>{children}</Text>,
      sub: ({ children }) => <Text style={styles.subText}>{children}</Text>,
      a: ({ children, href }) => (
        <Link href={href} style={styles.link}>
          {children}
        </Link>
      ),
      img: ({ src }) => <Image src={src} />,
      blockquote: ({ children }) => (
        <Text style={styles.blockquote}>{children}</Text>
      ),
      pre: ({ children }) => (
        <View style={styles.codeblock}>
          <Text style={styles.code}>{children}</Text>
        </View>
      ),
      code: ({ children }) => <Text style={styles.code}>{children}</Text>,
      table: ({ children }) => <View style={styles.table}>{children}</View>,
      thead: ({ children }) => (
        <View style={styles.tableHeader}>{children}</View>
      ),
      tbody: ({ children }) => <View style={styles.tableBody}>{children}</View>,
      tr: ({ children }) => <View style={styles.tableRow}>{children}</View>,
      th: ({ children }) => <Text style={styles.th}>{children}</Text>,
      td: ({ children }) => <Text style={styles.tableCell}>{children}</Text>,
    }}
  >
    {content}
  </ReactMarkdown>
);
