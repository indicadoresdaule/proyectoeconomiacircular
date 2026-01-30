import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionTimeoutProvider } from "@/components/session-timeout-provider"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios",
  description: "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos",
  generator: "v0.app",
  keywords: ["residuos sólidos", "gestión ambiental", "ecología", "sostenibilidad"],
  authors: [{ name: "GAD Cantón Daule" }],
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "https://proyectoeconomiacircular.vercel.app",
    title: "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios",
    description: "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    google: "RoJsAFLZzcRQL8gD34Grz6w9s5l_XbRz_rnhY4fRvWk",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geist.className} antialiased bg-background text-foreground`}>
        <SessionTimeoutProvider>
          {children}
        </SessionTimeoutProvider>
        <Analytics />
      </body>
    </html>
  )
}
