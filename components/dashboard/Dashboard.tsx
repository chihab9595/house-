import LeftSidebar from "./LeftSidebar";
import CenterPanel from "./CenterPanel";
import RightSidebar from "./RightSidebar";
import BottomCards from "./BottomCards";

export default function Dashboard() {
  return (
    <>
      <div className="grid">
        <LeftSidebar />
        <CenterPanel />
        <RightSidebar />
      </div>

      <BottomCards />
    </>
  );
}
