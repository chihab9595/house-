import Link from "next/link";
import { weather } from "@/data/mockData";
import ActiveModulesReal from "./ActiveModulesReal";
import NotificationsReal from "./NotificationsReal";

export default function RightSidebar() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="panel">
        <div className="panel-title">Notifications</div>
        <NotificationsReal />
      </div>

      <div className="panel">
        <div className="panel-title">Modules actifs</div>
        <ActiveModulesReal />
        <Link href="/cours" className="btn-ghost">
          GÉRER LES MODULES
        </Link>
      </div>

      <div className="panel">
        <div className="panel-title">Aujourd&apos;hui</div>
        <div className="weather-widget">
          <div>
            <div className="temp">{weather.temp}°</div>
            <div className="loc">{weather.location}</div>
          </div>
          <div style={{ fontSize: 34 }}>{weather.icon}</div>
        </div>
        <div className="week">
          {weather.week.map((day) => (
            <div key={day.day}>
              {day.day}
              <div className="d">{day.temp}°</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
