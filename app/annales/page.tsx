import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import AnnalesHub from "@/components/annales/AnnalesHub";

export const metadata: Metadata = {
  title: "Annales scannées — HOUSE",
};

export default function AnnalesPage() {
  return (
    <SectionLayout>
      <AnnalesHub />
    </SectionLayout>
  );
}
