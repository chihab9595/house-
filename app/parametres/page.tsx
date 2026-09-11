import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import ThemePanel from "@/components/parametres/ThemePanel";
import AutoBackupPanel from "@/components/parametres/AutoBackupPanel";
import BackupPanel from "@/components/parametres/BackupPanel";

export const metadata: Metadata = {
  title: "Paramètres — HOUSE",
};

export default function ParametresPage() {
  return (
    <SectionLayout>
      <div className="flex flex-col gap-3.5">
        <ThemePanel />
        <AutoBackupPanel />
        <BackupPanel />
      </div>
    </SectionLayout>
  );
}
