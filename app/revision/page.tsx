import type { Metadata } from "next";
import { Suspense } from "react";
import SectionLayout from "@/components/dashboard/SectionLayout";
import RevisionHub from "@/components/quiz/RevisionHub";

export const metadata: Metadata = {
  title: "Sessions de révision — HOUSE",
};

export default function RevisionPage() {
  return (
    <SectionLayout>
      <Suspense fallback={<div className="panel placeholder-panel" style={{ minHeight: 300 }} />}>
        <RevisionHub />
      </Suspense>
    </SectionLayout>
  );
}
