import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import PlanningHub from "@/components/planning/PlanningHub";

export const metadata: Metadata = {
  title: "Planning — HOUSE",
};

export default function PlanningPage() {
  return (
    <SectionLayout>
      <PlanningHub />
    </SectionLayout>
  );
}
