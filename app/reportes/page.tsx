"use client"

import React from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaracterizacionReportes } from "@/components/caracterizacion-reportes"
import { AutosustentabilidadReportes } from "@/components/autosustentabilidad-reportes"
import { Recycle, Users, FileText, Download, BarChart3 } from "lucide-react"

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState("caracterizacion")

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="gradient-eco text-white py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="container-safe relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-4">
              REPORTES Y EXPORTACION
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
              Centro de Reportes
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl text-balance leading-relaxed">
              Visualiza, filtra y exporta datos de caracterizacion de desechos solidos y autosustentabilidad en multiples formatos.
            </p>
            
            {/* Feature highlights - Responsive */}
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 max-w-3xl">
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Graficos interactivos</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">CSV, Excel, JSON</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">PDF y Word</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 sm:py-12 md:py-16 bg-background">
          <div className="container-safe">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs responsivos con texto ajustado */}
              <TabsList className="flex w-full mb-8 h-auto p-1 overflow-x-auto">
                <TabsTrigger 
                  value="caracterizacion" 
                  className="flex-1 min-w-0 text-xs sm:text-sm md:text-base py-3 px-2 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 truncate"
                >
                  <Recycle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate px-1">
                    <span className="hidden xs:inline">Caracterizacion</span>
                    <span className="xs:hidden">Caracterización</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="autosustentabilidad" 
                  className="flex-1 min-w-0 text-xs sm:text-sm md:text-base py-3 px-2 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 truncate"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate px-1">
                    <span className="hidden sm:inline">Autosustentabilidad</span>
                    <span className="sm:hidden">Autosust.</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="caracterizacion" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                    <span className="hidden sm:inline">Caracterizacion de Desechos Solidos</span>
                    <span className="sm:hidden">Caracterización Desechos</span>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    <span className="hidden sm:inline">
                      Genera reportes de la caracterizacion de desechos solidos domiciliarios con graficos, tablas y exportacion en multiples formatos.
                    </span>
                    <span className="sm:hidden">
                      Reportes de desechos solidos con graficos, tablas y exportacion.
                    </span>
                  </p>
                </div>
                <CaracterizacionReportes />
              </TabsContent>

              <TabsContent value="autosustentabilidad" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                    <span className="hidden sm:inline">Autosustentabilidad y Comportamiento Proambiental</span>
                    <span className="sm:hidden">Autosustentabilidad</span>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    <span className="hidden md:inline">
                      Genera reportes del cuestionario de comportamiento proambiental con analisis por secciones: Distribucion Demografica, Determinantes Socioculturales, Afectivos, Cognitivos, Sustentabilidad Ambiental, Economica y Desarrollo Comunitario.
                    </span>
                    <span className="hidden sm:inline md:hidden">
                      Reportes de comportamiento proambiental con analisis por secciones: Sociocultural, Afectivo, Cognitivo, Sustentabilidad.
                    </span>
                    <span className="sm:hidden">
                      Reportes de comportamiento proambiental con analisis completo.
                    </span>
                  </p>
                </div>
                <AutosustentabilidadReportes />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
