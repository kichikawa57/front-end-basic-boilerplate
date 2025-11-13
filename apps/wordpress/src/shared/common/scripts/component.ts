import { verticalRollingText } from "../components/Advanced/Rebita/VerticalRollingText/script";
import { accordionProduct001 } from "../components/Basic/Accordion/Product001/script";
import { accordionProduct002 } from "../components/Basic/Accordion/Product002/script";
import { accordionProduct003 } from "../components/Basic/Accordion/Product003/script";
import { accordionProduct004 } from "../components/Basic/Accordion/Product004/script";
import { accordionProduct005 } from "../components/Basic/Accordion/Product005/script";
import { buttonProduct002 } from "../components/Basic/Button/Product002/script";
import { toggleProduct002 } from "../components/Basic/Toggle/Product002/script";

export const componentScripts = () => {
  toggleProduct002();
  buttonProduct002();
  accordionProduct001();
  accordionProduct002();
  accordionProduct003();
  accordionProduct004();
  accordionProduct005();
  verticalRollingText();
};
