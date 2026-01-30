import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionTimeoutProvider } from "@/components/session-timeout-provider"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://proyectoeconomiacircular.vercel.app'), // IMPORTANTE
  title: {
    default: "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios",
    template: "%s | Gestión de Residuos - Cantón Daule"
  },
  description: "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos",
  generator: "Next.js",
  keywords: [
    "gestión de residuos", 
    "residuos domiciliarios", 
    "indicadores ambientales", 
    "economía circular", 
    "Daule Ecuador", 
    "sostenibilidad ambiental",
    "Universidad de Guayaquil",
    "Facultad de Ingeniería Industrial"
  ],
  authors: [
    { 
      name: "Universidad de Guayaquil", 
      url: "https://www.ug.edu.ec" 
    },
    { 
      name: "Facultad de Ingeniería Industrial" 
    }
  ],
  creator: "Universidad de Guayaquil",
  publisher: "Facultad de Ingeniería Industrial - Universidad de Guayaquil",
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "https://proyectoeconomiacircular.vercel.app",
    title: "Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios",
    description: "Plataforma integral para el monitoreo, reporte y gestión de residuos sólidos en el cantón Daule",
    siteName: "Gestión de Residuos - Cantón Daule",
    images: [
      {
        url: "/og-image.png", // Asegúrate de crear esta imagen
        width: 1200,
        height: 630,
        alt: "Gestión de Residuos - Cantón Daule",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "a744b28f93d9217a", // Tu código de verificación SIN "google" al inicio
  },
  alternates: {
    canonical: "https://proyectoeconomiacircular.vercel.app",
  },
  category: "environment",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Meta tag de verificación de Google */}
        <meta 
          name="google-site-verification" 
          content="a744b28f93d9217a" 
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
