import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionTimeoutProvider } from "@/components/session-timeout-provider"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios | Economía Circular",
  description: "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos. Sistema de indicadores para economía circular y desarrollo sostenible.",
  generator: "v0.app",
  keywords: [
    "residuos sólidos",
    "gestión ambiental",
    "economía circular",
    "ecología",
    "sostenibilidad",
    "Cantón Daule",
    "indicadores ambientales",
    "residuos domiciliarios",
    "monitoreo ambiental",
    "gestión de residuos",
    "desarrollo sostenible",
    "Ecuador"
  ],
  authors: [{ name: "Universidad de Guayaquil - Ingeniería industrial" }],
  creator: "Universidad de Guayaquil - Ingeniería industrial",
  publisher: "Universidad de Guayaquil - Ingeniería industrial",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://proyectoeconomiacircular.vercel.app"),
  alternates: {
    canonical: "https://proyectoeconomiacircular.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "https://proyectoeconomiacircular.vercel.app",
    title: "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios | Economía Circular",
    description: "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos. Sistema de indicadores para economía circular del Cantón Daule.",
    siteName: "Proyecto Economía Circular",
    images: [
      {
        url: "https://proyectoeconomiacircular.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Proyecto Economía Circular - Gestión de Residuos",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seguimiento e Indicadores para la Gestión de Residuos | Economía Circular",
    description: "Plataforma integral para el monitoreo y gestión de residuos sólidos del Cantón Daule",
    images: ["https://proyectoeconomiacircular.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  verification: {
    google: "nDfkBZ4GkFx_LZqn-eD5bBXxzW7fjCFI8EF7x8FiuHY",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios",
              "url": "https://proyectoeconomiacircular.vercel.app",
              "description": "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos con indicadores de economía circular.",
              "applicationCategory": "Productivity",
              "author": {
                "@type": "Organization",
                "name": "Economia circular"
              },
              "inLanguage": "es-EC"
            })
          }}
        />
      </head>
      <body className={`${geist.className} antialiased bg-background text-foreground`}>
        <SessionTimeoutProvider>
          {children}
        </SessionTimeoutProvider>
        <Analytics />
      </body>
    </html>
  )
}
