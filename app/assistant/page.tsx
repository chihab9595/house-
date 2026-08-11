import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import AssistantHub from "@/components/assistant/AssistantHub";

export const metadata: Metadata = {
  title: "Assistant IA — HOUSE",
};

export default function AssistantPage() {
  return (
    <SectionLayout>
      <AssistantHub />
    </SectionLayout>
  );
}
