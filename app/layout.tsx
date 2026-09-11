import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter, JetBrains_Mono, Rajdhani, Poppins } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import AutoBackupManager from "@/components/pwa/AutoBackupManager";
import { DEFAULT_THEME, THEME_COOKIE, isThemeId } from "@/lib/themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOUSE — Assistant d'étude intelligent",
  description: "HOUSE aide les étudiants en médecine à réviser leurs cours, annales et quiz.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HOUSE",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#060b14",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isThemeId(cookieValue) ? cookieValue : DEFAULT_THEME;

  return (
    <html
      lang="fr"
      data-theme={theme}
      className={`${inter.variable} ${rajdhani.variable} ${jetbrainsMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppShell initialTheme={theme}>{children}</AppShell>
        <ServiceWorkerRegister />
        <AutoBackupManager />
      </body>
    </html>
  );
}
