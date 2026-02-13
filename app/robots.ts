import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/indicadores", "/avances", "/reportes", "/metas", "/integrantes"],
        disallow: ["/api/", "/admin/", "/gestion-usuarios", "/auth/", "/login", "/perfil"],
        crawlDelay: 0.5,
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: [
      "https://proyectoeconomiacircular.vercel.app/sitemap.xml",
    ],
    host: "https://proyectoeconomiacircular.vercel.app",
  }
}
