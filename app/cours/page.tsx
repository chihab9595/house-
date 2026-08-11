import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import CoursesLibrary from "@/components/cours/CoursesLibrary";

export const metadata: Metadata = {
  title: "Mes cours — HOUSE",
};

export default function CoursPage() {
  return (
    <SectionLayout>
      <CoursesLibrary />
    </SectionLayout>
  );
}
