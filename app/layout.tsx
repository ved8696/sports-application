import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { ThemeInit } from "@/components/settings/theme-init";

// Runs before hydration so a saved Appearance theme (or "System" resolving
// to a light OS preference) never flashes as dark on first paint. Reads the
// same localStorage key/shape lib/store/settings-store.ts's zustand persist
// middleware writes -- Appearance is one field inside the larger settings
// object, not its own store.
const THEME_INIT_SCRIPT = `(function(){try{var r=localStorage.getItem('willow-settings');var t='dark';if(r){var p=JSON.parse(r);var pref=p&&p.state&&p.state.appearance&&p.state.appearance.theme;if(pref==='light'||pref==='dark'){t=pref;}else if(pref==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches){t='light';}}document.documentElement.dataset.theme=t;}catch(e){}})();`;

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Willow — Cricket Operations",
  description: "Premium AI-first Cricket Operating System, mobile edition.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeInit />
        <div id="app">
          <main className="app-main">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
