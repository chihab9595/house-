import Link from "next/link";
import { quickCommands } from "@/data/mockData";
import EkgTrace from "./EkgTrace";
import PulseCore from "./PulseCore";
import RecentActivityReal from "./RecentActivityReal";

export default function CenterPanel() {
  return (
    <div className="panel center-panel">
      <div className="hero-title">HOUSE</div>
      <div className="hero-sub">Assistant d&apos;étude en médecine</div>

      <div className="center-mid">
        <div className="panel side-card" style={{ alignSelf: "stretch" }}>
          <div className="panel-title">Activité récente</div>
          <RecentActivityReal />
        </div>

        <PulseCore />

        <div className="panel side-card" style={{ alignSelf: "stretch" }}>
          <div className="panel-title">Commandes rapides</div>
          {quickCommands.map((cmd) => (
            <Link href={cmd.href} className="row clickable" key={cmd.label}>
              <span className="label">{cmd.label}</span>
              <span className="tag">▸</span>
            </Link>
          ))}
        </div>
      </div>

      <EkgTrace />
      <div className="listening">HOUSE VOUS ÉCOUTE</div>
    </div>
  );
}
