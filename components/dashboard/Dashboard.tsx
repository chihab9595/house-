import LeftSidebar from "./LeftSidebar";
import CenterPanel from "./CenterPanel";
import RightSidebar from "./RightSidebar";
import BottomCards from "./BottomCards";
import IntroSequence from "./IntroSequence";

export default function Dashboard() {
  return (
    <>
      <IntroSequence />
      <div className="grid">
        <LeftSidebar />
        <CenterPanel />
        <RightSidebar />
      </div>

      <BottomCards />
    </>
  );
}
