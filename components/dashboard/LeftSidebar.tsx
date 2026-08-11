import ModuleNavPanel from "./ModuleNavPanel";
import RealMasteryPanel from "./RealMasteryPanel";

export default function LeftSidebar() {
  return (
    <div className="flex flex-col gap-3.5">
      <ModuleNavPanel />
      <RealMasteryPanel />
    </div>
  );
}
