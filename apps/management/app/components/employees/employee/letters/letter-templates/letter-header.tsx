import { styles } from "@canny_ecosystem/utils";
import { Rect, Svg } from "@react-pdf/renderer";

export const LetterHeader = () => (
  <Svg viewBox="0 0 70 10" style={styles.header}>
    <Rect width="100" height="100" fill="black" />
  </Svg>
);
