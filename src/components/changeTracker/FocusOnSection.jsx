import { Crosshair } from "lucide-react";
import SectionWrapper from "../Global/SectionWrapper";

const FocusOnSection = ({symbols}) => {
  return (
    <SectionWrapper title="Focus On" description="Symbols actively traded - should trigger alerts when price deviates 1% vs original buy price." Icon={Crosshair}>

    </SectionWrapper>
  );
};

export default FocusOnSection;
