import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Rajdhani } from "next/font/google";
import Header from "@/components/layout/Header";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import AutoBackupManager from "@/components/pwa/AutoBackupManager";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${rajdhani.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <div className="shell">
          <Header />
          {children}
        </div>
        <ServiceWorkerRegister />
        <AutoBackupManager />
      </body>
    </html>
  );
}
