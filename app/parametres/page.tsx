import type { Metadata } from "next";
import SectionLayout from "@/components/dashboard/SectionLayout";
import AiStatusPanel from "@/components/parametres/AiStatusPanel";
import AutoBackupPanel from "@/components/parametres/AutoBackupPanel";
import BackupPanel from "@/components/parametres/BackupPanel";

export const metadata: Metadata = {
  title: "Paramètres — HOUSE",
};

export default function ParametresPage() {
  return (
    <SectionLayout>
      <div className="flex flex-col gap-3.5">
        <AiStatusPanel />
        <AutoBackupPanel />
        <BackupPanel />
      </div>
    </SectionLayout>
  );
}
