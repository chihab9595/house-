// Jeu d'icônes vectorielles pour le thème "Lumière" — remplace les emoji
// (jugés peu professionnels) par des traits fins cohérents, dans le style
// demandé par l'utilisateur. Volontairement scindé du thème "Jarvis", qui
// garde ses emoji d'origine : ces icônes ne sont importées que par des
// composants exclusifs au thème clair (SidebarShell, LightDashboard,
// moduleIcon), jamais par du code partagé entre les deux thèmes.

import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </Svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </Svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </Svg>
  );
}

export function IconFileText(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4M9 12h6M9 16h6M9 8h2" />
    </Svg>
  );
}

export function IconBarChart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
      <path d="M3 20h18" />
    </Svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
      <circle cx="8.3" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="14" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V20a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1H20a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
    </Svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </Svg>
  );
}

export function IconGraduationCap(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" />
      <path d="M6 10.8v4.2c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.2" />
      <path d="M21 9v5.5" />
    </Svg>
  );
}

export function IconZap(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13z" />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5 15.5 12 10 15.5Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 15.5V4M8 8l4-4 4 4" />
      <path d="M5 15.5v3.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5" />
    </Svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconWave(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 12.5V6a1.5 1.5 0 0 1 3 0v5" />
      <path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M15 11.2V6a1.5 1.5 0 0 1 3 0v8c0 3.3-2.2 6-6 6-2.4 0-3.7-.8-5-2.3L3.7 13a1.4 1.4 0 0 1 2-2L9 13.5" />
    </Svg>
  );
}

export function IconServerLock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
      <rect x="3.5" y="12" width="10.5" height="6" rx="1.5" />
      <circle cx="7" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="15" r="0.6" fill="currentColor" stroke="none" />
      <rect x="16.3" y="14.3" width="5.2" height="4.2" rx="1" />
      <path d="M17.3 14.3v-1.2a1.6 1.6 0 0 1 3.2 0v1.2" />
    </Svg>
  );
}

export function IconFile(props: IconProps & { tint?: string }) {
  const { tint = "#f43f7d", ...rest } = props;
  return (
    <Svg {...rest} stroke="none">
      <path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" fill={tint} opacity={0.16} />
      <path
        d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"
        fill="none"
        stroke={tint}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M14 3.5v4h4" fill="none" stroke={tint} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M8.5 14h7M8.5 17h4.5" stroke={tint} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/* Icônes de modules médicaux — chacune pensée pour un fond pastel circulaire
   (voir lib/moduleIcon.ts), dans le même style trait-fin que le reste. */

export function IconHeart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20.5s-7.5-4.6-9.7-9.3C.8 7.8 2.4 4.5 5.6 4c2-.3 3.8.8 4.9 2.4C11.6 4.8 13.4 3.7 15.4 4c3.2.5 4.8 3.8 3.3 7.2C16.5 16 12 20.5 12 20.5Z" />
    </Svg>
  );
}

export function IconStomach(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 3.5c0 2-1.7 2.4-2.8 4-1.6 2.3-1.9 6 .3 8.5 2 2.3 5.7 3 8.2 1.4 2-1.3 2.7-3.4 2.2-5.4-.4-1.7-1.9-2.4-1.7-3.8.2-1.4 1.6-1.6 1.6-3.2 0-1.7-1.5-2.5-2.8-2C11.7 3.7 11 5 11 5" />
    </Svg>
  );
}

export function IconDroplet(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5c2.8 3.6 6 7.7 6 11.2a6 6 0 0 1-12 0c0-3.5 3.2-7.6 6-11.2Z" />
    </Svg>
  );
}

export function IconLungs(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v8.5" />
      <path d="M12 11.5c-.5-2-2-2.5-3-2.2-1.3.4-1.6 1.8-1.6 3v4.2c0 2-1.6 3-3 2.4-1.3-.6-1.7-2-1.4-3.6L4 9.5c.3-1.6 1.4-2.8 2.8-3" />
      <path d="M12 11.5c.5-2 2-2.5 3-2.2 1.3.4 1.6 1.8 1.6 3v4.2c0 2 1.6 3 3 2.4 1.3-.6 1.7-2 1.4-3.6L20 9.5c-.3-1.6-1.4-2.8-2.8-3" />
    </Svg>
  );
}

export function IconPill(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 13)" />
      <path d="M11 9.3 15 17.6" transform="rotate(-35 12 13)" />
    </Svg>
  );
}

export function IconBrain(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3.2 3.2 0 0 0 1.5 5.8A3 3 0 0 0 9 20a3 3 0 0 0 3-3V7a3 3 0 0 0-2.5-3Z" />
      <path d="M14.5 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3.2 3.2 0 0 1-1.5 5.8A3 3 0 0 1 15 20a3 3 0 0 1-3-3" />
      <path d="M9 8.5h1.5M9 12.5h2M8 16.5h2.5" />
    </Svg>
  );
}

export function IconKidney(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 3.5C6 3.5 4 6.7 4 10.5c0 4.6 2.3 9.5 6.5 9.5 2.6 0 3.7-1.9 3.2-3.8-.5-2-2.6-2-3.4-3.6-.8-1.6.2-3 2-3.4 2.2-.5 3.7-2.2 3.2-4.3-.5-2.1-3-3.4-6-1.4Z" />
    </Svg>
  );
}

export function IconFlower(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8c-1.8-1.8-1.8-4.5 0-6 1.8 1.5 1.8 4.2 0 6ZM12 14.2c1.8 1.8 1.8 4.5 0 6-1.8-1.5-1.8-4.2 0-6ZM9.8 12c-1.8 1.8-4.5 1.8-6 0 1.5-1.8 4.2-1.8 6 0ZM14.2 12c1.8-1.8 4.5-1.8 6 0-1.5 1.8-4.2 1.8-6 0Z" />
    </Svg>
  );
}

export function IconBaby(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9" r="3" />
      <path d="M9.5 9a2.2 2.2 0 0 1-2.3-2.6" />
      <path d="M7.5 15.5c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5-2 3.5-4.5 3.5-4.5-1.5-4.5-3.5Z" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconBandage(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-20 12 12)" />
      <circle cx="9.3" cy="10.7" r="0.6" fill="currentColor" stroke="none" transform="rotate(-20 12 12)" />
      <circle cx="14.7" cy="13.3" r="0.6" fill="currentColor" stroke="none" transform="rotate(-20 12 12)" />
    </Svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </Svg>
  );
}

export function IconEar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 4.5A5.5 5.5 0 0 0 9.5 10c0 1.3.5 2 1 3s1 2.2.5 3.3A2.2 2.2 0 0 1 9 17.8" />
      <path d="M15 4.5a6.5 6.5 0 0 1 4 6c0 3-2 4-3 5.5-.7 1-1 2-1 3a2.5 2.5 0 0 1-4.5 1.5" />
    </Svg>
  );
}

export function IconBacteria(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
    </Svg>
  );
}

export function IconBone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 8.5a2 2 0 1 0-3-1.7 2 2 0 0 0 1 3.4l8.8 8.8a2 2 0 0 0 3.4 1 2 2 0 1 0-1.7-3l-8.5-8.5Z" />
      <path d="M18 15.5a2 2 0 1 0-3-1.7M6 8.5a2 2 0 0 1 3-1.7" />
    </Svg>
  );
}

export function IconPuzzle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 4.5h4a1.5 1.5 0 0 1 0 3h-.2a1.2 1.2 0 0 0 0 2.4h3.7a1.5 1.5 0 0 1 1.5 1.5v3.7a1.2 1.2 0 0 0 2.4 0V15a1.5 1.5 0 0 1 0 4h-4a1.5 1.5 0 0 1 0-3h.2a1.2 1.2 0 1 0 0-2.4H12a1.5 1.5 0 0 1-1.5-1.5V8.4a1.2 1.2 0 1 0-2.4 0V9a1.5 1.5 0 0 1-3 0V5.8A1.3 1.3 0 0 1 6.3 4.5Z" />
    </Svg>
  );
}
