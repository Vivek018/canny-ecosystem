import { styles } from "@canny_ecosystem/utils";
import { Image } from "@react-pdf/renderer";
import Img from "./letters-footer.png";

export const LetterFooter = () => <Image src={Img} style={styles.image} />;
