import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import ProgressionSummary from "@/components/progression/ProgressionSummary";
import ModuleProgressList from "@/components/progression/ModuleProgressList";

export const metadata: Metadata = {
  title: "Progression — HOUSE",
};

export default function ProgressionPage() {
  return (
    <SectionLayout>
      <div className="flex flex-col gap-3.5">
        <ProgressionSummary />
        <ModuleProgressList />
      </div>
    </SectionLayout>
  );
}
