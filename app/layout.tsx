import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AIoT Astra Simulator | Interactive IoT Circuit Simulation & AI Generation",
  description:
    "AI-powered interactive circuit simulator for Arduino and ESP32 with automated schematic generation, in-browser firmware emulation, and hardware design.",
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

// Runs before hydration so dark theme class is immediately on <html>
const THEME_INIT_SCRIPT = `(function(){try{document.documentElement.classList.add('dark');localStorage.setItem('aiot-theme','dark');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased bg-[#0c1210] text-white selection:bg-emerald-400 selection:text-[#0c1210]">
        {children}
      </body>
    </html>
  )
}
