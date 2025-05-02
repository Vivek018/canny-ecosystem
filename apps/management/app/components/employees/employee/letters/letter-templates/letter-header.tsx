import { styles } from "@canny_ecosystem/utils";
import { Image } from "@react-pdf/renderer";
import Img from "./letters-header.png";

export const LetterHeader = () => <Image src={Img} style={styles.image} />;
