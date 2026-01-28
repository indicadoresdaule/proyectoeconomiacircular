"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, ImageIcon, X, Filter, FileText, Eye, FileSpreadsheet, FileImage, Settings2, ChevronDown } from "lucide-react"
import { BarChart3, PieChartIcon, TrendingUp, FileJson } from "lucide-react"
import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
// Importar autotable correctamente
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Import the reusable chart component from the provided code
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts"

// Declarar el tipo para autoTable en jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

const COLORS = [
  { bg: "rgba(255, 99, 132, 0.6)", border: "rgb(255, 99, 132)" },
  { bg: "rgba(54, 162, 235, 0.6)", border: "rgb(54, 162, 235)" },
  { bg: "rgba(255, 206, 86, 0.6)", border: "rgb(255, 206, 86)" },
  { bg: "rgba(75, 192, 192, 0.6)", border: "rgb(75, 192, 192)" },
  { bg: "rgba(153, 102, 255, 0.6)", border: "rgb(153, 102, 255)" },
  { bg: "rgba(255, 159, 64, 0.6)", border: "rgb(255, 159, 64)" },
  { bg: "rgba(16, 185, 129, 0.6)", border: "rgb(16, 185, 129)" },
  { bg: "rgba(244, 63, 94, 0.6)", border: "rgb(244, 63, 94)" },
  { bg: "rgba(99, 102, 241, 0.6)", border: "rgb(99, 102, 241)" },
  { bg: "rgba(251, 191, 36, 0.6)", border: "rgb(251, 191, 36)" },
  { bg: "rgba(236, 72, 153, 0.6)", border: "rgb(236, 72, 153)" },
  { bg: "rgba(14, 165, 233, 0.6)", border: "rgb(14, 165, 233)" },
  { bg: "rgba(168, 85, 247, 0.6)", border: "rgb(168, 85, 247)" },
  { bg: "rgba(34, 197, 94, 0.6)", border: "rgb(34, 197, 94)" },
  { bg: "rgba(249, 115, 22, 0.6)", border: "rgb(249, 115, 22)" },
]

const SOLID_COLORS = [
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 206, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(255, 159, 64)",
  "rgb(16, 185, 129)",
  "rgb(244, 63, 94)",
  "rgb(99, 102, 241)",
  "rgb(251, 191, 36)",
  "rgb(236, 72, 153)",
  "rgb(14, 165, 233)",
  "rgb(168, 85, 247)",
  "rgb(34, 197, 94)",
  "rgb(249, 115, 22)",
]

// Definición completa de secciones con nombres completos de preguntas - ACTUALIZADO para coincidir con el ejemplo
const SECCIONES = {
  "distribucion-demografica": {
    titulo: "Distribución Demográfica",
    grupos: {
      "grupos-edad": {
        nombre: "Grupos de Edad",
        esGruposEdad: true,
        camposEdad: {
          "0-10 años": "edad_0_10",
          "11-25 años": "edad_11_25",
          "26-50 años": "edad_26_50",
          "51-90 años": "edad_51_90",
        },
      },
      "estado-civil": {
        nombre: "Estado Civil",
        campo: "estado_civil",
        valores: ["Casado", "Soltero", "Divorciado", "Viudo", "Unión libre", "Separado"],
      },
      "nivel-educativo": {
        nombre: "Nivel de educación del jefe del hogar",
        campo: "educacion_jefe_hogar",
        valores: ["Primaria", "Secundaria", "Universidad", "Postgrado"],
      },
      "situacion-laboral": {
        nombre: "Situación laboral del jefe del hogar",
        campo: "situacion_laboral_jefe_hogar",
        valores: ["Temporal", "Desempleado", "Empleado"],
      },
      "ingreso-mensual": {
        nombre: "Ingreso estimado mensual del jefe del hogar",
        campo: "ingreso_mensual_jefe_hogar",
        valores: ["Mayor al sueldo básico", "Menor al sueldo básico", "Sueldo básico"],
      },
      "tipo-hogar": {
        nombre: "Tipo de hogar",
        campo: "tipo_hogar",
        valores: ["Alquilada", "Prestada", "Propia"],
      },
    },
  },
  "determinantes-socioculturales": {
    titulo: "Determinantes Socioculturales",
    grupos: {
      "todos": {
        nombre: "Todas las preguntas",
        esTodos: true,
      },
      "conoce-desechos": {
        nombre: "¿Conoce usted qué son los desechos sólidos domiciliarios?",
        campo: "conoce_desechos_solidos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "comportamiento-adecuado": {
        nombre: "¿Cree usted que existe un comportamiento adecuado en el manejo de los desechos sólidos domiciliarios en la comunidad?",
        campo: "cree_comportamiento_adecuado_manejo",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "separar-desechos": {
        nombre: "¿Se debe separar los desechos sólidos según su tipo ejemplo: (papel - plástico - orgánico - inorgánico)?",
        campo: "separar_desechos_por_origen",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "clasificacion-correcta": {
        nombre: "¿Es importante la correcta clasificación de los desechos sólidos orgánicos e inorgánicos en el hogar?",
        campo: "clasificacion_correcta_desechos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "comportamiento-comunidad": {
        nombre: "¿Cree que el comportamiento de la comunidad influye en deterioro del medio ambiente?",
        campo: "comportamiento_comunidad_influye",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "dedica-tiempo": {
        nombre: "¿Dedica tiempo para reducir, reutilizar y/o reciclar los desechos sólidos que se generan en el hogar?",
        campo: "dedica_tiempo_reducir_reutilizar_reciclar",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "problema-comunidad": {
        nombre: "¿Los desechos sólidos son un gran problema para la comunidad?",
        campo: "desechos_solidos_problema_comunidad",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
    },
  },
  "determinantes-afectivos": {
    titulo: "Determinantes Afectivos",
    grupos: {
      "todos": {
        nombre: "Todas las preguntas",
        esTodos: true,
      },
      "preocupa-exceso": {
        nombre: "¿Le preocupa el exceso de desechos sólidos domiciliarios?",
        campo: "preocupa_exceso_desechos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "desechos-contaminan": {
        nombre: "¿Considera que los desechos sólidos domiciliarios intervienen en las consecuencias climáticas?",
        campo: "desechos_contaminan_ambiente",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "afecta-emocionalmente": {
        nombre: "¿Le afecta emocionalmente cuando escucha noticias acerca de los desastres naturales?",
        campo: "afecta_emocionalmente_noticias_contaminacion",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      frustracion: {
        nombre: "¿Siente frustración debido a la falta de acciones significativas para abordar la generación de los desechos sólidos?",
        campo: "frustracion_falta_acciones_ambientales",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "planeta-futuro": {
        nombre: "¿Considera importante pensar en el tipo de planeta que dejaremos a las futuras generaciones?",
        campo: "importancia_planeta_futuras_generaciones",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
    },
  },
  "determinantes-cognitivos": {
    titulo: "Determinantes Cognitivos",
    grupos: {
      "todos": {
        nombre: "Todas las preguntas",
        esTodos: true,
      },
      "consciente-impacto": {
        nombre: "¿Es consciente del impacto de los desechos sólidos domiciliarios en el medio ambiente?",
        campo: "consciente_impacto_desechos_salud",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "investiga-temas": {
        nombre: "¿Investiga frecuentemente acerca de temas medio ambientales?",
        campo: "investiga_temas_ambientales",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "consecuencias-acumulacion": {
        nombre: "¿Conoce las consecuencias de la acumulación de los desechos sólidos domiciliarios?",
        campo: "consecuencias_acumulacion_desechos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "beneficios-reutilizar": {
        nombre: "¿Conoce los beneficios de reutilizar un residuo domiciliario?",
        campo: "beneficios_reutilizar_residuo",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "falta-informacion": {
        nombre: "¿La falta de información es un obstáculo para la correcta gestión de los residuos sólidos domiciliario?",
        campo: "falta_informacion_obstaculo_gestion",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
    },
  },
  "sustentabilidad-ambiental": {
    titulo: "Sustentabilidad Ambiental",
    grupos: {
      "todos": {
        nombre: "Todas las preguntas",
        esTodos: true,
      },
      "organicos-funcionalidad": {
        nombre: "¿Los desechos orgánicos generados en el hogar pueden tener otra funcionalidad?",
        campo: "desechos_organicos_funcionalidad",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "acumulacion-salud": {
        nombre: "¿La acumulación de desechos afectan a la salud de la población?",
        campo: "acumulacion_desechos_afecta_salud",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "reduccion-cuida-ambiente": {
        nombre: "¿La reducción, reciclaje y la reutilización de los desechos sólidos puede cuidar al medio ambiente y a la vida silvestre?",
        campo: "reduccion_reciclaje_reutilizacion_cuida_ambiente",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "transformacion-productos": {
        nombre: "¿Cree que la transformación de desechos sólidos en nuevos productos puede contribuir significativamente a la reducción de la generación de desechos?",
        campo: "transformacion_desechos_nuevos_productos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "necesita-educacion": {
        nombre: "¿Necesita más información acerca de educación ambiental?",
        campo: "necesita_info_educacion_ambiental",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
    },
  },
  "sustentabilidad-economica": {
    titulo: "Sustentabilidad Económica",
    grupos: {
      "todos": {
        nombre: "Todas las preguntas",
        esTodos: true,
      },
      "separacion-reciclaje": {
        nombre: "¿En su hogar practica la separación de los desechos para el reciclaje y le representa algún ingreso?",
        campo: "practica_separacion_reciclaje_ingreso",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "desechos-reutilizados": {
        nombre: "¿Los desechos sólidos generados en el hogar pueden ser reutilizados para una nueva función o creación de un producto?",
        campo: "desechos_hogar_reutilizados",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "manejo-desarrollo": {
        nombre: "¿Cree que el manejo adecuado de los desechos sólidos domiciliarios podría aportar al desarrollo económico comunitario?",
        campo: "manejo_adecuado_desechos_aporta_desarrollo",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "emprendimientos-economia": {
        nombre: "¿Los emprendimientos en base a la reutilización de los desechos aporta a su economía?",
        campo: "emprendimientos_reutilizacion_aportan_economia",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "oportunidad-emprendimiento": {
        nombre: "¿El manejo adecuado de los desechos sólidos domiciliarios ofrece oportunidades para el emprendimiento?",
        campo: "manejo_adecuado_desechos_oportunidad_emprendimiento",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
    },
  },
  "desarrollo-comunitario": {
    titulo: "Desarrollo Comunitario",
    grupos: {
      "todos": {
        nombre: "Todas las preguntas",
        esTodos: true,
      },
      "eventos-concientizacion": {
        nombre: "¿Es posible reducir la generación de residuos sólidos domiciliarios por medio de eventos de concientización?",
        campo: "reducir_residuos_eventos_concientizacion",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "talleres-practicas": {
        nombre: "¿Participaría en talleres de buenas prácticas y capacitaciones para el correcto manejo de los desechos sólidos domiciliarios?",
        campo: "participaria_talleres_buenas_practicas",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "impacto-ambiente": {
        nombre: "¿El manejo adecuado de los desechos sólidos domiciliarios puede tener un impacto significativo al medio ambiente?",
        campo: "manejo_adecuado_desechos_impacto_ambiente",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "participar-emprendimiento": {
        nombre: "¿Está dispuesto a participar en un emprendimiento en base al uso de los desechos sólidos?",
        campo: "dispuesto_participar_emprendimiento_desechos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
      "feria-emprendimientos": {
        nombre: "¿Participaría a una feria de emprendimientos comunitarios en base a desechos domiciliarios reutilizados?",
        campo: "participaria_feria_emprendimientos_desechos",
        valores: ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"],
      },
    },
  },
}

// Nombres correctos para campos de la base de datos
const NOMBRES_CAMPOS_DB: Record<string, string> = {
  id: "ID",
  estado_civil: "Estado Civil",
  educacion_jefe_hogar: "Nivel de Educación del Jefe del Hogar",
  situacion_laboral_jefe_hogar: "Situación Laboral del Jefe del Hogar",
  ingreso_mensual_jefe_hogar: "Ingreso Mensual del Jefe del Hogar",
  tipo_hogar: "Tipo de Hogar",
  edad_0_10: "Personas de 0-10 años",
  edad_11_25: "Personas de 11-25 años",
  edad_26_50: "Personas de 26-50 años",
  edad_51_90: "Personas de 51-90 años",
  conoce_desechos_solidos: "¿Conoce qué son los desechos sólidos domiciliarios?",
  cree_comportamiento_adecuado_manejo: "¿Cree que existe comportamiento adecuado en manejo de desechos?",
  separar_desechos_por_origen: "¿Se debe separar desechos por tipo?",
  clasificacion_correcta_desechos: "¿Es importante la clasificación correcta de desechos?",
  comportamiento_comunidad_influye: "¿El comportamiento de comunidad influye en deterioro ambiental?",
  dedica_tiempo_reducir_reutilizar_reciclar: "¿Dedica tiempo para reducir, reutilizar, reciclar?",
  desechos_solidos_problema_comunidad: "¿Los desechos son problema para la comunidad?",
  preocupa_exceso_desechos: "¿Le preocupa el exceso de desechos?",
  desechos_contaminan_ambiente: "¿Desechos intervienen en consecuencias climáticas?",
  afecta_emocionalmente_noticias_contaminacion: "¿Le afecta emocionalmente noticias de desastres?",
  frustracion_falta_acciones_ambientales: "¿Siente frustración por falta de acciones ambientales?",
  importancia_planeta_futuras_generaciones: "¿Es importante el planeta para futuras generaciones?",
  consciente_impacto_desechos_salud: "¿Es consciente del impacto de desechos en medio ambiente?",
  investiga_temas_ambientales: "¿Investiga temas medio ambientales?",
  consecuencias_acumulacion_desechos: "¿Conoce consecuencias de acumulación de desechos?",
  beneficios_reutilizar_residuo: "¿Conoce beneficios de reutilizar residuos?",
  falta_informacion_obstaculo_gestion: "¿La falta de información es obstáculo para gestión?",
  desechos_organicos_funcionalidad: "¿Desechos orgánicos pueden tener otra funcionalidad?",
  acumulacion_desechos_afecta_salud: "¿Acumulación de desechos afecta salud?",
  reduccion_reciclaje_reutilizacion_cuida_ambiente: "¿Reducción y reciclaje cuida medio ambiente?",
  transformacion_desechos_nuevos_productos: "¿Transformación de desechos reduce generación?",
  necesita_info_educacion_ambiental: "¿Necesita más información de educación ambiental?",
  practica_separacion_reciclaje_ingreso: "¿Practica separación de desechos para reciclaje?",
  desechos_hogar_reutilizados: "¿Desechos del hogar pueden ser reutilizados?",
  manejo_adecuado_desechos_aporta_desarrollo: "¿Manejo adecuado aporta al desarrollo económico?",
  emprendimientos_reutilizacion_aportan_economia: "¿Emprendimientos de reutilización aportan economía?",
  manejo_adecuado_desechos_oportunidad_emprendimiento: "¿Manejo adecuado ofrece oportunidades de emprendimiento?",
  reducir_residuos_eventos_concientizacion: "¿Eventos de concientización reducen residuos?",
  participaria_talleres_buenas_practicas: "¿Participaría en talleres de buenas prácticas?",
  manejo_adecuado_desechos_impacto_ambiente: "¿Manejo adecuado impacta positivamente al ambiente?",
  dispuesto_participar_emprendimiento_desechos: "¿Está dispuesto a participar en emprendimiento?",
  participaria_feria_emprendimientos_desechos: "¿Participaría en feria de emprendimientos?",
}

// Interfaces
interface DatoGrafico {
  name: string
  value: number
  porcentaje: number
}

interface PreguntaSeccion {
  pregunta: string
  key: string
  totalRespuestas: number
  respuestas: Array<{
    respuesta: string
    cantidad: number
    porcentaje: number
  }>
}

// Función para normalizar valores Likert
const normalizarValorLikert = (valor: string): string => {
  if (!valor) return ""
  const valorLimpio = valor.trim()

  if (valorLimpio === "Totalmente de acuerdo") return "Totalmente de acuerdo"
  if (valorLimpio === "De acuerdo") return "De acuerdo"
  if (valorLimpio === "Indiferente") return "Indiferente"
  if (valorLimpio === "Desacuerdo") return "Desacuerdo"
  if (valorLimpio === "Totalmente desacuerdo") return "Totalmente desacuerdo"

  return valorLimpio
}

// Función para formatear porcentaje: dos decimales si es decimal, ninguno si es entero
const formatearPorcentaje = (valor: number): string => {
  const redondeado = Math.round(valor * 100) / 100 // Redondear a 2 decimales
  const esEntero = Math.abs(redondeado - Math.round(redondeado)) < 0.001
  
  if (esEntero) {
    return `${Math.round(redondeado)}%`
  }
  return `${redondeado.toFixed(2)}%`
}

// Función para formatear porcentaje con 1 decimal para gráficos
const formatearPorcentajeGrafico = (valor: number): string => {
  const redondeado = Math.round(valor * 10) / 10 // Redondear a 1 decimal
  const esEntero = Math.abs(redondeado - Math.round(redondeado)) < 0.01
  
  if (esEntero) {
    return `${Math.round(redondeado)}%`
  }
  return `${redondeado.toFixed(1)}%`
}

// Tooltip personalizado para mostrar cantidad y porcentaje
const CustomTooltip = ({ active, payload, label, esMovil, showPercentage = true }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className={`bg-white p-3 border border-gray-200 shadow-lg rounded-lg ${esMovil ? 'text-xs' : 'text-sm'}`}>
        <p className="font-semibold mb-2 text-gray-800">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-600">
            <span className="font-medium">Cantidad: </span>
            {data.value}
          </p>
          {showPercentage && data.porcentaje !== undefined && (
            <p className="text-green-600">
              <span className="font-medium">Porcentaje: </span>
              {formatearPorcentajeGrafico(data.porcentaje)}
            </p>
          )}
        </div>
      </div>
    )
  }
  return null
}

// Función para dividir el texto y poner la última palabra abajo, EXCEPTO para "De acuerdo"
const splitLabelForRotation = (text: string) => {
  // Si el texto es "De acuerdo", no lo dividimos
  if (text === "De acuerdo") {
    return { firstPart: text, lastWord: "", isSingleWord: true }
  }
  
  const words = text.split(' ')
  
  if (words.length <= 1) {
    return { firstPart: text, lastWord: "", isSingleWord: true }
  }
  
  const lastWord = words[words.length - 1]
  const firstPart = words.slice(0, -1).join(' ')
  
  return { firstPart, lastWord, isSingleWord: false }
}

// Componente personalizado para ticks rotados con última palabra abajo, excepto para "De acuerdo"
const CustomRotatedTick = (props: any) => {
  const { x, y, payload, esMovil } = props
  const { firstPart, lastWord, isSingleWord } = splitLabelForRotation(payload.value)
  
  // Si es una sola palabra (incluye "De acuerdo" o palabras únicas)
  if (isSingleWord) {
    return (
      <g transform={`translate(${x},${y}) rotate(-45)`}>
        <text
          x={0}
          y={0}
          dy={esMovil ? 25 : 30}
          textAnchor="end"
          fontSize={esMovil ? 9 : 12}
          fill="#4b5563"
        >
          {firstPart}
        </text>
      </g>
    )
  }
  
  // Para múltiples palabras (excepto "De acuerdo")
  return (
    <g transform={`translate(${x},${y}) rotate(-45)`}>
      <text
        x={0}
        y={0}
        dy={esMovil ? 15 : 20}
        textAnchor="end"
        fontSize={esMovil ? 9 : 12}
        fill="#4b5563"
      >
        {firstPart}
      </text>
      {lastWord && (
        <text
          x={0}
          y={0}
          dy={esMovil ? 30 : 40}
          textAnchor="end"
          fontSize={esMovil ? 9 : 12}
          fill="#4b5563"
        >
          {lastWord}
        </text>
      )}
    </g>
  )
}

// GraficoReusable Component con dimensiones fijas y CENTRADO - MODIFICADO para mostrar datos en gráfico circular
interface GraficoReusableProps {
  datos: DatoGrafico[]
  tipo: "barras" | "torta" | "lineal"
  tituloX?: string
  tituloY?: string
  colors?: Array<{ bg: string; border: string }>
  esMovil?: boolean
  isLandscape?: boolean
  showLabelsOnPie?: boolean // NUEVO: controlar si mostrar etiquetas en gráfico circular
  exportMode?: boolean // Para controlar el modo de exportación (ajustes para PDF)
}

const GraficoReusable: React.FC<GraficoReusableProps> = ({ 
  datos, 
  tipo, 
  tituloX = "Respuestas", 
  tituloY = "Cantidad",
  colors = COLORS,
  esMovil = false,
  isLandscape = false,
  showLabelsOnPie = true, // Por defecto mostrar etiquetas
  exportMode = false // No es exportación por defecto
}) => {
  const chartWidth = 819
  const chartHeight = 520

  // Calcular ancho del eje Y
  const calcularAnchoEjeY = () => {
    if (esMovil) return 30
    const maxValor = Math.max(...datos.map((d) => d.value))
    const maxDigitos = maxValor.toFixed(0).length
    return Math.max(50, maxDigitos * 8 + 20)
  }

  const anchoEjeY = calcularAnchoEjeY()

  if (tipo === "barras") {
    return (
      <div className="flex justify-center items-center">
        <div style={{ width: chartWidth, height: chartHeight }}>
          <BarChart 
            width={chartWidth}
            height={chartHeight}
            data={datos} 
            margin={{ 
              top: 45,
              right: 60, 
              left: anchoEjeY, 
              bottom: 90 
            }}
            barSize={100}
            barGap={9}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              height={90}
              tick={<CustomRotatedTick esMovil={esMovil} />}
              interval={0}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
            />
            <YAxis 
              fontSize={esMovil ? 9 : 12} 
              tick={{ fill: "#4b5563" }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              width={anchoEjeY}
            />
            <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
            <Bar 
              dataKey="value" 
              radius={[3, 3, 0, 0]}
              label={(props) => {
                const { x, y, width, value, index } = props
                const porcentaje = datos[index]?.porcentaje || 0
                
                return (
                  <g>
                    <text
                      x={x + width / 2}
                      y={y - 35}
                      textAnchor="middle"
                      fontSize={esMovil ? 10 : 12}
                      fontWeight="600"
                      fill="#1f2937"
                    >
                      {`${value}`}
                    </text>
                    <text
                      x={x + width / 2}
                      y={y - 20}
                      textAnchor="middle"
                      fontSize={esMovil ? 9 : 11}
                      fontWeight="500"
                      fill="#059669"
                    >
                      {`${formatearPorcentajeGrafico(porcentaje)}`}
                    </text>
                  </g>
                )
              }}
            >
              {datos.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length].bg} 
                  stroke={colors[index % colors.length].border} 
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>
    )
  }

  if (tipo === "torta") {
    return (
      <div className="flex justify-center items-center">
        <div style={{ width: chartWidth, height: chartHeight }}>
          <PieChart width={chartWidth} height={chartHeight}>
            <Pie
              data={datos}
              cx={chartWidth / 2}
              cy={chartHeight / 2}
              labelLine={false}
              label={(props) => {
                // Mostrar etiquetas directamente en el gráfico circular para exportación
                if (!showLabelsOnPie) return null
                
                const { x, y, text, payload } = props
                const porcentaje = payload?.porcentaje ?? 0
                const value = payload?.value ?? 0
                
                // Mostrar etiqueta si el porcentaje es mayor al 2%
                if (porcentaje < 2) return null
                
                // Para modo exportación, usar etiquetas más claras
                if (exportMode) {
                  // Calcular posición para que las etiquetas queden alrededor del gráfico
                  const angle = Math.atan2(y - chartHeight / 2, x - chartWidth / 2) * 180 / Math.PI
                  const isLeftSide = x < chartWidth / 2
                  const labelX = isLeftSide ? x - 40 : x + 40
                  
                  return (
                    <g>
                      <text
                        x={labelX}
                        y={y - 5}
                        textAnchor={isLeftSide ? "end" : "start"}
                        fontSize={9}
                        fontWeight="600"
                        fill="#1f2937"
                      >
                        {`${value}`}
                      </text>
                      <text
                        x={labelX}
                        y={y + 7}
                        textAnchor={isLeftSide ? "end" : "start"}
                        fontSize={8}
                        fontWeight="500"
                        fill="#059669"
                      >
                        {`${formatearPorcentajeGrafico(porcentaje)}`}
                      </text>
                      <text
                        x={labelX}
                        y={y + 19}
                        textAnchor={isLeftSide ? "end" : "start"}
                        fontSize={8}
                        fontWeight="400"
                        fill="#6b7280"
                      >
                        {payload.name}
                      </text>
                    </g>
                  )
                } else {
                  // Modo normal de visualización
                  const angle = Math.atan2(y - chartHeight / 2, x - chartWidth / 2) * 180 / Math.PI
                  const isLeftSide = x < chartWidth / 2
                  const labelX = isLeftSide ? x - 40 : x + 40
                  
                  return (
                    <g>
                      <text
                        x={labelX}
                        y={y - 5}
                        textAnchor={isLeftSide ? "end" : "start"}
                        fontSize={9}
                        fontWeight="600"
                        fill="#1f2937"
                      >
                        {`${value}`}
                      </text>
                      <text
                        x={labelX}
                        y={y + 7}
                        textAnchor={isLeftSide ? "end" : "start"}
                        fontSize={8}
                        fontWeight="500"
                        fill="#059669"
                      >
                        {`${formatearPorcentajeGrafico(porcentaje)}`}
                      </text>
                      <text
                        x={labelX}
                        y={y + 19}
                        textAnchor={isLeftSide ? "end" : "start"}
                        fontSize={8}
                        fontWeight="400"
                        fill="#6b7280"
                      >
                        {payload.name}
                      </text>
                    </g>
                  )
                }
              }}
              outerRadius={160}
              innerRadius={80}
              dataKey="value"
              paddingAngle={2}
            >
              {datos.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SOLID_COLORS[index % SOLID_COLORS.length]} 
                  stroke="#fff" 
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
            <Legend 
              verticalAlign="middle"
              align="right"
              layout="vertical"
              wrapperStyle={{
                fontSize: 11,
                maxHeight: 150,
                overflowY: "auto",
                lineHeight: "1.5",
              }}
              formatter={(value, entry: any) => {
                const porcentaje = entry.payload?.porcentaje ?? 0
                const valor = entry.payload?.value ?? 0
                return `${value}: ${valor} (${formatearPorcentajeGrafico(porcentaje)})`
              }}
              iconSize={12}
              iconType="circle"
            />
          </PieChart>
        </div>
      </div>
    )
  }

  if (tipo === "lineal") {
    return (
      <div className="flex justify-center items-center">
        <div style={{ width: chartWidth, height: chartHeight }}>
          <LineChart 
            width={chartWidth}
            height={chartHeight}
            data={datos} 
            margin={{ 
              top: 55,
              right: 60, 
              left: Math.max(40, anchoEjeY - 10), 
              bottom: 90 
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              height={90}
              tick={<CustomRotatedTick esMovil={esMovil} />}
              interval={0}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              scale="point"
              padding={{left:20, right:20}}
            />
            <YAxis 
              fontSize={esMovil ? 9 : 12} 
              tick={{ fill: "#4b5563" }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              width={anchoEjeY}
            />
            <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#248645"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload, index } = props
                const dotColor = SOLID_COLORS[index % SOLID_COLORS.length]
                const porcentaje = datos[index]?.porcentaje || 0
                
                return (
                  <g key={`dot-${payload.name}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={dotColor}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <g>
                      <text
                        x={cx}
                        y={cy - 40}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="600"
                        fill="#1f2937"
                      >
                        {`${payload.value}`}
                      </text>
                      <text
                        x={cx}
                        y={cy - 25}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight="500"
                        fill="#059669"
                      >
                        {`${formatearPorcentajeGrafico(porcentaje)}`}
                      </text>
                    </g>
                  </g>
                )
              }}
              activeDot={{ 
                r: 8, 
                stroke: "#fff", 
                strokeWidth: 2 
              }}
            />
          </LineChart>
        </div>
      </div>
    )
  }

  return null
}

// Función para obtener el texto del selector
const obtenerTextoSelector = (seccionSeleccionada: string, grupoSeleccionado: string, esMovil: boolean) => {
  const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
  const grupo = seccion?.grupos[grupoSeleccionado as keyof typeof seccion.grupos]
  
  if (!grupo) return "Seleccionar variable"
  
  // Para móvil, mostrar desde el signo de pregunta hasta donde alcance
  if (esMovil && seccionSeleccionada !== "distribucion-demografica") {
    const preguntaCompleta = grupo.nombre
    const indicePregunta = preguntaCompleta.indexOf("¿")
    if (indicePregunta !== -1) {
      const textoDesdePregunta = preguntaCompleta.substring(indicePregunta)
      if (textoDesdePregunta.length > 40) {
        return textoDesdePregunta.substring(0, 37) + "..."
      }
      return textoDesdePregunta
    }
  }
  
  return grupo.nombre
}

// Función para obtener la pregunta completa
const obtenerPreguntaCompleta = (grupo: any) => {
  return grupo.nombre
}

// Función para calcular ancho del eje Y
const calcularAnchoEjeY = (datos: DatoGrafico[], esMovil: boolean) => {
  if (esMovil) return 30
  const maxValor = Math.max(...datos.map((d) => d.value))
  const maxDigitos = maxValor.toFixed(0).length
  return Math.max(50, maxDigitos * 8 + 20)
}

// Función para capturar imagen del gráfico con dimensiones específicas - CORREGIDA
const capturarImagenGrafico = async (
  tipoGraficoCapturar: "barras" | "torta" | "lineal", 
  datosGrafico: DatoGrafico[], 
  showLabels = true
) => {
  try {
    // Crear un elemento temporal para renderizar el gráfico
    const tempDiv = document.createElement('div')
    tempDiv.style.width = '819px'
    tempDiv.style.height = '520px'
    tempDiv.style.position = 'fixed'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.backgroundColor = '#ffffff'
    tempDiv.style.zIndex = '9999'
    document.body.appendChild(tempDiv)
    
    // Renderizar el gráfico en el elemento temporal usando React 18
    const ReactDOM = await import('react-dom/client')
    const React = await import('react')
    
    // Componente temporal para gráfico - MEJORADO para gráfico circular con leyendas y etiquetas
    const GraficoTemporal = () => {
      return React.createElement('div', { 
        style: { 
          width: '819px', 
          height: '520px',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }, 
      React.createElement('div', {
        style: {
          width: '819px',
          height: '520px'
        }
      },
      React.createElement(GraficoReusable, {
        datos: datosGrafico,
        tipo: tipoGraficoCapturar,
        tituloX: "Respuestas",
        tituloY: "Cantidad",
        colors: COLORS,
        esMovil: false,
        isLandscape: false,
        showLabelsOnPie: showLabels,
        exportMode: true // Usar modo exportación para gráfico circular
      })))
    }
    
    // Crear root y renderizar con React 18
    const root = ReactDOM.createRoot(tempDiv)
    root.render(React.createElement(GraficoTemporal))
    
    // Aumentar el tiempo de espera para gráfico circular (necesita más tiempo para renderizar leyendas)
    const tiempoEspera = tipoGraficoCapturar === "torta" ? 2500 : 2000
    await new Promise(resolve => setTimeout(resolve, tiempoEspera))
    
    // Capturar la imagen
    const chartDataUrl = await toPng(tempDiv.firstChild as HTMLElement, {
      backgroundColor: '#ffffff',
      width: 819,
      height: 520,
      pixelRatio: 3, // Alta calidad
      quality: 1.0,
      cacheBust: true,
      style: {
        width: '819px',
        height: '520px',
        backgroundColor: '#ffffff',
        display: 'block',
        position: 'relative'
      }
    })
    
    // Limpiar
    root.unmount()
    document.body.removeChild(tempDiv)
    
    return chartDataUrl
  } catch (error) {
    console.error('Error capturando gráfico:', error)
    return null
  }
}

// Main Component
export function AutosustentabilidadReportes() {
  const [datos, setDatos] = useState<any[]>([])
  const [datosFiltrados, setDatosFiltrados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [estadoCivil, setEstadoCivil] = useState("todos")
  const [nivelEducacion, setNivelEducacion] = useState("todos")
  const [situacionLaboral, setSituacionLaboral] = useState("todos")
  const [ingresoMensual, setIngresoMensual] = useState("todos")
  
  // Selección de sección y pregunta
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("distribucion-demografica")
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("grupos-edad")
  const [tipoGrafico, setTipoGrafico] = useState<"barras" | "torta" | "lineal">("barras")
  
  // Responsive
  const [esMovil, setEsMovil] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  
  // Estados para configuración de PDF/Word - MEJORADO
  const [seccionesIncluidas, setSeccionesIncluidas] = useState<string[]>([Object.keys(SECCIONES)[0]])
  const [preguntasPorSeccion, setPreguntasPorSeccion] = useState<Record<string, string[]>>({})
  const [formatoDescarga, setFormatoDescarga] = useState<"pdf" | "docx">("pdf")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [incluirGrafico, setIncluirGrafico] = useState(true)
  const [incluirTablaSeccion, setIncluirTablaSeccion] = useState(true)
  const [tipoGraficoDocumento, setTipoGraficoDocumento] = useState<"barras" | "torta" | "lineal">("barras")
  const [generandoDocumento, setGenerandoDocumento] = useState(false)

  const chartRef = useRef<HTMLDivElement>(null)
  const chartCombinadoRef = useRef<HTMLDivElement>(null)

  // Inicializar preguntas por sección - MODIFICADO para incluir TODAS las preguntas de Distribución Demográfica
  useEffect(() => {
    const inicialPreguntas: Record<string, string[]> = {}
    Object.keys(SECCIONES).forEach(seccionKey => {
      const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
      // Para distribución demográfica, inicializar con TODAS las 6 preguntas
      if (seccionKey === "distribucion-demografica") {
        const gruposFiltrados = Object.entries(seccion.grupos)
          .filter(([key, grupo]) => key !== "todos")
        inicialPreguntas[seccionKey] = gruposFiltrados.map(([key]) => key)
      } else {
        // Para otras secciones, inicializar con la primera pregunta
        const gruposFiltrados = Object.entries(seccion.grupos)
          .filter(([key, grupo]) => key !== "todos")
        if (gruposFiltrados.length > 0) {
          inicialPreguntas[seccionKey] = [gruposFiltrados[0][0]]
        } else {
          inicialPreguntas[seccionKey] = []
        }
      }
    })
    setPreguntasPorSeccion(inicialPreguntas)
  }, [])

  useEffect(() => {
    cargarDatos()
    const checkResponsive = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobileWidth = width < 768
      setEsMovil(isMobileWidth)
      setIsLandscape(isMobileWidth && width > height)
    }
    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("cuestionario_comportamiento_proambiental_autosustentabilidad")
        .select("*")

      if (error) throw error

      setDatos(data || [])
      setDatosFiltrados(data || [])
      
      // Establecer grupo inicial
      const seccion = SECCIONES["distribucion-demografica"]
      if (seccion && Object.keys(seccion.grupos).length > 0) {
        setGrupoSeleccionado(Object.keys(seccion.grupos)[0])
      }
    } catch (err) {
      console.error("Error cargando datos:", err)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let resultados = [...datos]

    if (estadoCivil !== "todos") {
      resultados = resultados.filter((d) => 
        d.estado_civil?.toLowerCase().trim() === estadoCivil.toLowerCase().trim()
      )
    }
    if (nivelEducacion !== "todos") {
      resultados = resultados.filter((d) => 
        d.educacion_jefe_hogar?.toLowerCase().trim() === nivelEducacion.toLowerCase().trim()
      )
    }
    if (situacionLaboral !== "todos") {
      resultados = resultados.filter((d) => 
        d.situacion_laboral_jefe_hogar?.toLowerCase().trim() === situacionLaboral.toLowerCase().trim()
      )
    }
    if (ingresoMensual !== "todos") {
      resultados = resultados.filter((d) => 
        d.ingreso_mensual_jefe_hogar?.toLowerCase().trim() === ingresoMensual.toLowerCase().trim()
      )
    }

    setDatosFiltrados(resultados)
  }, [estadoCivil, nivelEducacion, situacionLaboral, ingresoMensual, datos])

  // Actualizar grupo cuando cambia la sección
  useEffect(() => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    if (seccion && Object.keys(seccion.grupos).length > 0) {
      setGrupoSeleccionado(Object.keys(seccion.grupos)[0])
    }
  }, [seccionSeleccionada])

  const limpiarFiltros = () => {
    setEstadoCivil("todos")
    setNivelEducacion("todos")
    setSituacionLaboral("todos")
    setIngresoMensual("todos")
  }

  const hayFiltrosActivos = estadoCivil !== "todos" || nivelEducacion !== "todos" || 
                           situacionLaboral !== "todos" || ingresoMensual !== "todos"

  // Función para procesar datos de TODAS las preguntas de una sección
  const procesarDatosTodos = (seccionKey: string) => {
    const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
    if (!seccion) return []
    
    const opcionesLikert = ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"]
    const resultados: Array<{name: string, value: number, porcentaje: number}> = []
    
    Object.entries(seccion.grupos).forEach(([key, grupo]) => {
      if (grupo.esTodos) return // Saltar la opción "todos"
      
      // Calcular respuestas para cada opción Likert
      const conteos: Record<string, number> = {}
      opcionesLikert.forEach((opcion) => {
        conteos[opcion] = 0
      })
      
      const totalEncuestas = datosFiltrados.length
      datosFiltrados.forEach((registro) => {
        const valor = registro[grupo.campo]
        if (valor && typeof valor === "string") {
          const valorNorm = normalizarValorLikert(valor)
          if (opcionesLikert.includes(valorNorm)) {
            conteos[valorNorm]++
          }
        }
      })
      
      // Sumar todas las respuestas de esta pregunta
      const totalRespuestas = Object.values(conteos).reduce((sum, val) => sum + val, 0)
      
      // Agregar cada opción Likert al resultado
      opcionesLikert.forEach((opcion) => {
        const valor = conteos[opcion]
        const porcentaje = totalRespuestas > 0 ? (valor / totalRespuestas) * 100 : 0
        
        // Buscar si ya existe esta opción en resultados
        const existente = resultados.find(r => r.name === opcion)
        if (existente) {
          existente.value += valor
          // Recalcular porcentaje promedio
          existente.porcentaje = (existente.porcentaje + porcentaje) / 2
        } else {
          resultados.push({
            name: opcion,
            value: valor,
            porcentaje: porcentaje
          })
        }
      })
    })
    
    return resultados
  }

  // Función para procesar datos de preguntas específicas seleccionadas
  const procesarDatosSeleccionados = (seccionKey: string, preguntaKeys: string[]) => {
    const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
    if (!seccion || preguntaKeys.length === 0) return []
    
    const opcionesLikert = ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"]
    const resultados: Array<{name: string, value: number, porcentaje: number}> = []
    
    // Calcular total de respuestas para todas las preguntas seleccionadas
    let totalTodasRespuestas = 0
    const conteosTotales: Record<string, number> = {}
    opcionesLikert.forEach((opcion) => {
      conteosTotales[opcion] = 0
    })
    
    // Procesar cada pregunta seleccionada
    preguntaKeys.forEach((preguntaKey) => {
      const grupo = seccion.grupos[preguntaKey as keyof typeof seccion.grupos]
      if (!grupo || grupo.esTodos) return
      
      const conteos: Record<string, number> = {}
      opcionesLikert.forEach((opcion) => {
        conteos[opcion] = 0
      })
      
      const totalEncuestas = datosFiltrados.length
      datosFiltrados.forEach((registro) => {
        const valor = registro[grupo.campo]
        if (valor && typeof valor === "string") {
          const valorNorm = normalizarValorLikert(valor)
          if (opcionesLikert.includes(valorNorm)) {
            conteos[valorNorm]++
            conteosTotales[opcion]++
          }
        }
      })
      
      const totalRespuestas = Object.values(conteos).reduce((sum, val) => sum + val, 0)
      totalTodasRespuestas += totalRespuestas
    })
    
    // Crear resultados combinados
    opcionesLikert.forEach((opcion) => {
      const valor = conteosTotales[opcion]
      const porcentaje = totalTodasRespuestas > 0 ? (valor / totalTodasRespuestas) * 100 : 0
      
      resultados.push({
        name: opcion,
        value: valor,
        porcentaje: porcentaje
      })
    })
    
    return resultados
  }

  // Función para generar datos combinados de todas las secciones seleccionadas
  const generarDatosCombinados = () => {
    // Encontrar todas las secciones no demográficas seleccionadas
    const seccionesNoDemograficas = seccionesIncluidas.filter(
      seccionKey => seccionKey !== "distribucion-demografica"
    )
    
    if (seccionesNoDemograficas.length === 0) return []
    
    const opcionesLikert = ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"]
    const conteosTotales: Record<string, number> = {}
    opcionesLikert.forEach((opcion) => {
      conteosTotales[opcion] = 0
    })
    
    let totalTodasRespuestas = 0
    
    // Procesar cada sección y sus preguntas seleccionadas
    seccionesNoDemograficas.forEach(seccionKey => {
      const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
      const preguntasSeleccionadas = preguntasPorSeccion[seccionKey] || []
      
      preguntasSeleccionadas.forEach(preguntaKey => {
        const grupo = seccion.grupos[preguntaKey as keyof typeof seccion.grupos]
        if (!grupo || grupo.esTodos) return
        
        const conteos: Record<string, number> = {}
        opcionesLikert.forEach((opcion) => {
          conteos[opcion] = 0
        })
        
        datosFiltrados.forEach((registro) => {
          const valor = registro[grupo.campo]
          if (valor && typeof valor === "string") {
            const valorNorm = normalizarValorLikert(valor)
            if (opcionesLikert.includes(valorNorm)) {
              conteos[valorNorm]++
              conteosTotales[valorNorm]++
            }
          }
        })
        
        const totalRespuestas = Object.values(conteos).reduce((sum, val) => sum + val, 0)
        totalTodasRespuestas += totalRespuestas
      })
    })
    
    // Crear datos del gráfico
    const datosGrafico = opcionesLikert.map((opcion) => ({
      name: opcion,
      value: conteosTotales[opcion],
      porcentaje: totalTodasRespuestas > 0 ? (conteosTotales[opcion] / totalTodasRespuestas) * 100 : 0
    }))
    
    return datosGrafico
  }

  // Función principal para procesar datos del gráfico
  const procesarDatos = () => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    const grupo = seccion.grupos[grupoSeleccionado as keyof typeof seccion.grupos]

    if (!grupo) return []

    // Si es la opción "Todos" para secciones Likert
    if (grupo.esTodos && seccionSeleccionada !== "distribucion-demografica") {
      return procesarDatosTodos(seccionSeleccionada)
    }

    if (grupo.esGruposEdad && grupo.camposEdad) {
      const conteos: Record<string, number> = {}

      Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
        conteos[label] = 0
        datosFiltrados.forEach((registro) => {
          const valor = Number(registro[campo]) || 0
          if (valor > 0) {
            conteos[label]++
          }
        })
      })

      const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

      return Object.entries(conteos).map(([name, value]) => ({
        name,
        value,
        porcentaje: total > 0 ? (value / total) * 100 : 0,
      }))
    }

    if (seccionSeleccionada !== "distribucion-demografica" && grupo.valores) {
      const totalEncuestas = datosFiltrados.length
      const conteos: Record<string, number> = {}

      grupo.valores.forEach((valor) => {
        conteos[valor] = 0
      })

      datosFiltrados.forEach((registro) => {
        const valor = registro[grupo.campo]
        if (valor && typeof valor === "string") {
          const valorNorm = normalizarValorLikert(valor)
          if (grupo.valores!.includes(valorNorm)) {
            conteos[valorNorm]++
          }
        }
      })

      return Object.entries(conteos).map(([name, value]) => ({
        name,
        value,
        porcentaje: totalEncuestas > 0 ? (value / totalEncuestas) * 100 : 0,
      }))
    }

    const conteos: Record<string, number> = {}
    grupo.valores?.forEach((valor) => {
      conteos[valor] = 0
    })

    datosFiltrados.forEach((registro) => {
      const valor = registro[grupo.campo]
      if (valor) {
        const valorStr = valor.toString()
        const valorEncontrado = grupo.valores!.find((v) => v.toLowerCase() === valorStr.toLowerCase())
        if (valorEncontrado) {
          conteos[valorEncontrado] = (conteos[valorEncontrado] || 0) + 1
        }
      }
    })

    const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

    return Object.entries(conteos).map(([name, value]) => ({
      name,
      value,
      porcentaje: total > 0 ? (value / total) * 100 : 0,
    }))
  }

  const datosGrafico = procesarDatos()
  const datosCombinados = generarDatosCombinados()

  // Generar tabla detallada por sección (Distribución Demográfica)
  const generarTablaPorSeccion = () => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    if (!seccion) return null

    return Object.entries(seccion.grupos).map(([key, grupo]) => {
      if (grupo.esTodos) return null // Saltar la opción "todos"
      
      if (grupo.esGruposEdad && grupo.camposEdad) {
        const conteos: Record<string, number> = {}

        Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
          conteos[label] = 0
          datosFiltrados.forEach((registro) => {
            const valor = Number(registro[campo]) || 0
            if (valor > 0) {
              conteos[label]++
            }
          })
        })

        const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

        return {
          nombreGrupo: grupo.nombre,
          datos: Object.entries(conteos).map(([name, value]) => ({
            name,
            value,
            porcentaje: total > 0 ? (value / total) * 100 : 0,
          })),
          total,
        }
      }

      const conteos: Record<string, number> = {}
      grupo.valores?.forEach((valor) => {
        conteos[valor] = 0
      })

      datosFiltrados.forEach((registro) => {
        const valor = registro[grupo.campo]
        if (valor) {
          const valorStr = valor.toString()
          if (seccionSeleccionada !== "distribucion-demografica") {
            const valorNorm = normalizarValorLikert(valorStr)
            const valorEncontrado = grupo.valores!.find((v) => v === valorNorm)
            if (valorEncontrado) {
              conteos[valorEncontrado] = (conteos[valorEncontrado] || 0) + 1
            }
          } else {
            const valorEncontrado = grupo.valores!.find((v) => v.toLowerCase() === valorStr.toLowerCase())
            if (valorEncontrado) {
              conteos[valorEncontrado] = (conteos[valorEncontrado] || 0) + 1
            }
          }
        }
      })

      const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

      return {
        nombreGrupo: grupo.nombre,
        datos: Object.entries(conteos).map(([name, value]) => ({
          name,
          value,
          porcentaje: total > 0 ? (value / total) * 100 : 0,
        })),
        total,
      }
    }).filter(Boolean) // Filtrar los null
  }

  // Generar tabla Likert por sección (para secciones no demográficas)
  const generarTablaLikertPorSeccion = () => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    if (!seccion || seccionSeleccionada === "distribucion-demografica") return null

    const totalEncuestas = datosFiltrados.length

    return Object.entries(seccion.grupos).map(([key, grupo]) => {
      if (grupo.esTodos) return null // Saltar la opción "todos"
      
      const opcionesLikert = ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"]

      // Contar cuántas veces aparece cada opción
      const conteos: Record<string, number> = {}
      opcionesLikert.forEach((opcion) => {
        conteos[opcion] = 0
      })

      datosFiltrados.forEach((registro) => {
        const valor = registro[grupo.campo]
        if (valor && typeof valor === "string") {
          const valorNorm = normalizarValorLikert(valor)
          if (opcionesLikert.includes(valorNorm)) {
            conteos[valorNorm]++
          }
        }
      })

      // Calcular promedio ponderado
      const suma =
        conteos["Totalmente desacuerdo"] * 1 +
        conteos["Desacuerdo"] * 2 +
        conteos["Indiferente"] * 3 +
        conteos["De acuerdo"] * 4 +
        conteos["Totalmente de acuerdo"] * 5
      const promedio = totalEncuestas > 0 ? (suma / totalEncuestas / 5) * 100 : 0

      return {
        nombreGrupo: grupo.nombre,
        pregunta: grupo.nombre,
        conteos,
        totalEncuestas,
        promedio,
      }
    }).filter(Boolean) // Filtrar los null
  }

  const tablasSeccion = generarTablaPorSeccion()
  const tablasLikert = generarTablaLikertPorSeccion()

  // Exportar funciones
  const exportarCSV = (datos: any[], nombreArchivo: string) => {
    if (datos.length === 0) return

    const headers = Object.keys(datos[0])
    const csvContent = [
      headers.join(","),
      ...datos.map((row) =>
        headers.map((header) => {
          const value = row[header]
          if (value === null || value === undefined) return ""
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) 
            return `"${value.replace(/"/g, '""')}"`
          return value
        }).join(",")
      ),
    ].join("\n")

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  const exportarExcel = (datos: any[], nombreArchivo: string) => {
    if (datos.length === 0) return

    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Datos")
    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const exportarJSON = (datos: any[], nombreArchivo: string) => {
    if (datos.length === 0) return

    const jsonContent = JSON.stringify(datos, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
  }

  // Obtener datos con nombres correctos
  const getDatosDBConNombresCorrectos = () => {
    return datosFiltrados.map(registro => {
      const registroConNombres: Record<string, any> = {}
      Object.entries(registro).forEach(([key, value]) => {
        const nombreCorrecto = NOMBRES_CAMPOS_DB[key] || key
        registroConNombres[nombreCorrecto] = value
      })
      return registroConNombres
    })
  }

  // Descargar gráfico con dimensiones fijas (819x520) - CORREGIDO a dimensiones originales
  const descargarGrafico = async (formato: 'png' | 'jpeg' | 'svg') => {
    if (!chartRef.current) return

    try {
      const chartWidth = 819
      const chartHeight = 520
      
      // Obtener el contenedor específico del gráfico
      const chartContainer = chartRef.current.querySelector('div[style*="width: 819px"]') as HTMLElement
      if (!chartContainer) {
        console.error('No se encontró el contenedor del gráfico con dimensiones fijas')
        return
      }

      let dataUrl: string
      const options = {
        backgroundColor: '#ffffff',
        width: chartWidth,
        height: chartHeight,
        pixelRatio: 3, // Alta calidad
        style: {
          width: `${chartWidth}px`,
          height: `${chartHeight}px`,
          display: 'block',
          position: 'absolute'
        }
      }

      switch (formato) {
        case 'png':
          dataUrl = await toPng(chartContainer, options)
          break
        case 'jpeg':
          dataUrl = await toJpeg(chartContainer, { ...options, quality: 0.95 })
          break
        case 'svg':
          // Para SVG, obtenemos el elemento SVG directamente
          const svgElement = chartContainer.querySelector('svg')
          if (!svgElement) {
            console.error('No se encontró el elemento SVG')
            return
          }
          
          // Clonamos el SVG y establecemos dimensiones fijas
          const svgClone = svgElement.cloneNode(true) as SVGElement
          svgClone.setAttribute('width', chartWidth.toString())
          svgClone.setAttribute('height', chartHeight.toString())
          svgClone.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
          
          const serializer = new XMLSerializer()
          const svgString = serializer.serializeToString(svgClone)
          
          // Añadir declaración XML
          const svgWithHeader = '<?xml version="1.0" standalone="no"?>\r\n' + svgString
          
          const blob = new Blob([svgWithHeader], { type: 'image/svg+xml;charset=utf-8' })
          const link = document.createElement('a')
          link.download = `grafico_autosustentabilidad_${tipoGrafico}_${new Date().toISOString().slice(0, 10)}.svg`
          link.href = URL.createObjectURL(blob)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        default:
          dataUrl = await toPng(chartContainer, options)
      }
      
      const link = document.createElement('a')
      link.download = `grafico_autosustentabilidad_${tipoGrafico}_${new Date().toISOString().slice(0, 10)}.${formato}`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error al descargar el gráfico:', error)
      alert('Error al descargar el gráfico. Inténtalo de nuevo.')
    }
  }

  // Preparar datos de tabla para descarga
  const getDatosTablaSeccion = () => {
    const resultado: any[] = []
    
    if (seccionSeleccionada === "distribucion-demografica") {
      tablasSeccion?.forEach(tabla => {
        tabla.datos.forEach(resp => {
          resultado.push({
            Grupo: tabla.nombreGrupo,
            Categoría: resp.name,
            Cantidad: resp.value,
            "Porcentaje (%)": formatearPorcentaje(resp.porcentaje)
          })
        })
      })
    } else {
      tablasLikert?.forEach(tabla => {
        const opcionesLikert = ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"]
        opcionesLikert.forEach(opcion => {
          resultado.push({
            Pregunta: tabla.pregunta,
            Respuesta: opcion,
            Cantidad: tabla.conteos[opcion],
            "Porcentaje (%)": formatearPorcentaje((tabla.conteos[opcion] / tabla.totalEncuestas) * 100),
            Promedio: formatearPorcentaje(tabla.promedio)
          })
        })
      })
    }
    
    return resultado
  }

  // Funciones para manejar la selección de preguntas
  const toggleSeccion = (seccionKey: string) => {
    setSeccionesIncluidas(prev => 
      prev.includes(seccionKey) 
        ? prev.filter(s => s !== seccionKey)
        : [...prev, seccionKey]
    )
  }

  const togglePregunta = (seccionKey: string, preguntaKey: string) => {
    setPreguntasPorSeccion(prev => {
      const currentPreguntas = prev[seccionKey] || []
      const nuevasPreguntas = currentPreguntas.includes(preguntaKey)
        ? currentPreguntas.filter(p => p !== preguntaKey)
        : [...currentPreguntas, preguntaKey]
      
      return {
        ...prev,
        [seccionKey]: nuevasPreguntas
      }
    })
  }

  const seleccionarTodasPreguntas = (seccionKey: string) => {
    const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
    if (!seccion) return
    
    const gruposFiltrados = Object.entries(seccion.grupos)
      .filter(([key, grupo]) => key !== "todos")
      .map(([key]) => key)
    
    setPreguntasPorSeccion(prev => ({
      ...prev,
      [seccionKey]: gruposFiltrados
    }))
  }

  const deseleccionarTodasPreguntas = (seccionKey: string) => {
    setPreguntasPorSeccion(prev => ({
      ...prev,
      [seccionKey]: []
    }))
  }

  // MODIFICAR la función generarGraficosIndividuales para procesar los datos correctamente
  const generarGraficosIndividuales = async (seccionKey: string, preguntaKey: string) => {
    try {
      const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
      const grupo = seccion?.grupos[preguntaKey as keyof typeof seccion.grupos]
      if (!grupo) return null
      
      // Procesar datos para esta pregunta específica - ASEGURAR QUE LOS DATOS ESTÉN COMPLETOS
      let datosPregunta: DatoGrafico[] = []
      
      if (seccionKey === "distribucion-demografica") {
        if (grupo.esGruposEdad && grupo.camposEdad) {
          const conteos: Record<string, number> = {}

          Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
            conteos[label] = 0
            datosFiltrados.forEach((registro) => {
              const valor = Number(registro[campo]) || 0
              if (valor > 0) {
                conteos[label]++
              }
            })
          })

          const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

          datosPregunta = Object.entries(conteos).map(([name, value]) => ({
            name,
            value,
            porcentaje: total > 0 ? (value / total) * 100 : 0,
          }))
        } else {
          // Para otras preguntas de distribución demográfica - ASEGURAR TODAS LAS OPCIONES
          const conteos: Record<string, number> = {}
          
          // Inicializar todas las opciones posibles
          grupo.valores?.forEach((valor) => {
            conteos[valor] = 0
          })

          datosFiltrados.forEach((registro) => {
            const valor = registro[grupo.campo]
            if (valor) {
              const valorStr = valor.toString()
              const valorEncontrado = grupo.valores!.find((v) => v.toLowerCase() === valorStr.toLowerCase())
              if (valorEncontrado) {
                conteos[valorEncontrado] = (conteos[valorEncontrado] || 0) + 1
              }
            }
          })

          const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

          datosPregunta = Object.entries(conteos).map(([name, value]) => ({
            name,
            value,
            porcentaje: total > 0 ? (value / total) * 100 : 0,
          }))
        }
      } else {
        // Para secciones Likert - ASEGURAR QUE TODAS LAS OPCIONES LIKERT ESTÉN PRESENTES
        const opcionesLikert = [
          "Totalmente desacuerdo", 
          "Desacuerdo", 
          "Indiferente", 
          "De acuerdo", 
          "Totalmente de acuerdo"
        ]
        
        const totalEncuestas = datosFiltrados.length
        const conteos: Record<string, number> = {}

        // Inicializar todas las opciones Likert
        opcionesLikert.forEach((valor) => {
          conteos[valor] = 0
        })

        datosFiltrados.forEach((registro) => {
          const valor = registro[grupo.campo]
          if (valor && typeof valor === "string") {
            const valorNorm = normalizarValorLikert(valor)
            if (opcionesLikert.includes(valorNorm)) {
              conteos[valorNorm]++
            }
          }
        })

        datosPregunta = opcionesLikert.map((name) => ({
          name,
          value: conteos[name] || 0,
          porcentaje: totalEncuestas > 0 ? ((conteos[name] || 0) / totalEncuestas) * 100 : 0,
        }))
      }
      
      // Asegurarse de que hay datos para mostrar
      if (datosPregunta.length === 0) {
        console.warn(`No hay datos para la pregunta: ${grupo.nombre}`)
        return null
      }
      
      // Generar imagen del gráfico para esta pregunta usando la función capturarImagenGrafico
      const chartDataUrl = await capturarImagenGrafico(tipoGraficoDocumento, datosPregunta, true)
      
      return {
        pregunta: grupo.nombre,
        datos: datosPregunta,
        imagen: chartDataUrl
      }
    } catch (error) {
      console.error('Error generando gráfico individual:', error)
      return null
    }
  }

  // Generar PDF/DOCX con formato APA 7 e imágenes - MEJORADO
  const generarDocumento = async () => {
    try {
      setGenerandoDocumento(true)
      
      if (formatoDescarga === 'pdf') {
        await generarPDF()
      } else {
        await generarWord()
      }
      
      setDialogOpen(false)
    } catch (error) {
      console.error('Error al generar documento:', error)
      alert('Error al generar el documento. Por favor, inténtalo de nuevo.')
    } finally {
      setGenerandoDocumento(false)
    }
  }

  const generarPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const marginLeft = 25.4
    const marginTop = 25.4
    const lineHeight = 7
    let currentY = marginTop

    // Título centrado (APA 7)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    const titulo = 'Reporte de Autosustentabilidad y Comportamiento Proambiental'
    const tituloWidth = pdf.getTextWidth(titulo)
    pdf.text(titulo, (pageWidth - tituloWidth) / 2, currentY)
    currentY += lineHeight * 2

    // Información del reporte
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.text(`Fecha de generación: ${fecha}`, marginLeft, currentY)
    currentY += lineHeight
    pdf.text(`Total de registros: ${datosFiltrados.length}`, marginLeft, currentY)
    currentY += lineHeight
    
    // Filtros aplicados
    const filtrosTexto: string[] = []
    if (estadoCivil !== "todos") filtrosTexto.push(`Estado Civil: ${estadoCivil}`)
    if (nivelEducacion !== "todos") filtrosTexto.push(`Nivel Educación: ${nivelEducacion}`)
    if (situacionLaboral !== "todos") filtrosTexto.push(`Situación Laboral: ${situacionLaboral}`)
    if (ingresoMensual !== "todos") filtrosTexto.push(`Ingreso Mensual: ${ingresoMensual}`)
    
    if (filtrosTexto.length > 0) {
      pdf.text(`Filtros aplicados: ${filtrosTexto.join(', ')}`, marginLeft, currentY)
      currentY += lineHeight
    }
    currentY += lineHeight

    // Agregar gráfico combinado si está habilitado
    if (incluirGrafico && datosCombinados.length > 0) {
      try {
        // Verificar si necesitamos nueva página
        if (currentY > 120) {
          pdf.addPage()
          currentY = marginTop
        }
        
        // Título del gráfico
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.text("Figura 1: Distribución de respuestas combinadas", marginLeft, currentY)
        currentY += lineHeight
        
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(10)
        const textoGrafico = "Gráfico que muestra la distribución agregada de respuestas de todas las preguntas seleccionadas de las secciones no demográficas"
        pdf.text(textoGrafico, marginLeft, currentY, { maxWidth: pageWidth - 2 * marginLeft })
        currentY += lineHeight * 2
        
        // Capturar imagen del gráfico con el tipo seleccionado usando la función capturarImagenGrafico
        const chartDataUrl = await capturarImagenGrafico(tipoGraficoDocumento, datosCombinados, true)
        
        if (chartDataUrl) {
          // Calcular dimensiones para la imagen en el PDF
          const imgWidth = pageWidth - 2 * marginLeft
          const imgHeight = (520 / 819) * imgWidth
          
          // Agregar imagen al PDF
          pdf.addImage(chartDataUrl, 'PNG', marginLeft, currentY, imgWidth, imgHeight)
          currentY += imgHeight + lineHeight * 2
        } else {
          pdf.text("No se pudo generar la imagen del gráfico.", marginLeft, currentY)
          currentY += lineHeight
        }
      } catch (error) {
        console.error('Error al generar imagen del gráfico:', error)
        pdf.text("Error al generar la imagen del gráfico", marginLeft, currentY)
        currentY += lineHeight
      }
    }

    // SOLUCIÓN para problema 1 y 3: Generar gráficos individuales para cada pregunta seleccionada
    let figuraNumero = 2
    let tablaNumero = 1
    
    for (const seccionKey of seccionesIncluidas) {
      const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
      if (!seccion) continue

      // Verificar si necesitamos nueva página
      if (currentY > 180) {
        pdf.addPage()
        currentY = marginTop
      }

      // Título de sección
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.text(seccion.titulo, marginLeft, currentY)
      currentY += lineHeight * 2

      // Obtener preguntas seleccionadas para esta sección
      const preguntasSeleccionadas = preguntasPorSeccion[seccionKey] || []
      
      // Si no hay preguntas seleccionadas en esta sección, continuar
      if (preguntasSeleccionadas.length === 0) {
        pdf.text("No se seleccionaron preguntas para esta sección.", marginLeft, currentY)
        currentY += lineHeight * 2
        continue
      }

      // Generar gráficos individuales para cada pregunta seleccionada
      for (const preguntaKey of preguntasSeleccionadas) {
        const grupo = seccion.grupos[preguntaKey as keyof typeof seccion.grupos]
        if (!grupo) continue
        
        // Verificar si necesitamos nueva página
        if (currentY > 120) {
          pdf.addPage()
          currentY = marginTop
        }
        
        // Generar gráfico individual para esta pregunta
        try {
          const graficoIndividual = await generarGraficosIndividuales(seccionKey, preguntaKey)
          
          if (graficoIndividual && graficoIndividual.imagen) {
            // Título del gráfico individual
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(11)
            pdf.text(`Figura ${figuraNumero}: ${grupo.nombre}`, marginLeft, currentY)
            currentY += lineHeight
            
            pdf.setFont('helvetica', 'italic')
            pdf.setFontSize(10)
            const textoGrafico = `Gráfico que muestra la distribución de respuestas para: ${grupo.nombre}`
            const lines = pdf.splitTextToSize(textoGrafico, pageWidth - 2 * marginLeft)
            pdf.text(lines, marginLeft, currentY)
            currentY += lineHeight * (lines.length + 1)
            
            // Calcular dimensiones para la imagen en el PDF
            const imgWidth = pageWidth - 2 * marginLeft
            const imgHeight = (520 / 819) * imgWidth
            
            // Agregar imagen al PDF
            pdf.addImage(graficoIndividual.imagen, 'PNG', marginLeft, currentY, imgWidth, imgHeight)
            currentY += imgHeight + lineHeight * 2
            
            figuraNumero++
          }
        } catch (error) {
          console.error('Error generando gráfico individual:', error)
          pdf.text(`Error al generar gráfico para: ${grupo.nombre}`, marginLeft, currentY)
          currentY += lineHeight
        }
      }

      // Procesar datos de las preguntas seleccionadas para la tabla
      const datosSeccionPDF = preguntasSeleccionadas.map(preguntaKey => {
        const grupo = seccion.grupos[preguntaKey as keyof typeof seccion.grupos]
        if (!grupo) return null

        if (grupo.esGruposEdad && grupo.camposEdad) {
          const conteos: Record<string, number> = {}
          let total = 0
          
          Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
            conteos[label] = 0
            datosFiltrados.forEach(registro => {
              const valor = Number(registro[campo]) || 0
              if (valor > 0) {
                conteos[label] += valor
                total += valor
              }
            })
          })

          const respuestas = Object.entries(conteos)
            .map(([respuesta, cantidad]) => ({
              respuesta,
              cantidad,
              porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(2) : '0'
            }))
            .sort((a, b) => b.cantidad - a.cantidad)

          return { pregunta: grupo.nombre, respuestas }
        }

        // Caso normal (incluyendo Likert)
        const conteos: Record<string, number> = {}
        let total = 0
        
        datosFiltrados.forEach((registro) => {
          const valor = registro[grupo.campo]
          if (valor !== null && valor !== undefined) {
            const valorStr = String(valor).trim()
            if (valorStr) {
              conteos[valorStr] = (conteos[valorStr] || 0) + 1
              total++
            }
          }
        })

        const respuestas = Object.entries(conteos)
          .map(([respuesta, cantidad]) => ({
            respuesta,
            cantidad,
            porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(2) : '0'
          }))
          .sort((a, b) => b.cantidad - a.cantidad)

        return { pregunta: grupo.nombre, respuestas }
      }).filter(Boolean)

      // Crear tabla para la sección si hay datos
      if (datosSeccionPDF.length > 0) {
        // Verificar si necesitamos nueva página para la tabla
        if (currentY > 150) {
          pdf.addPage()
          currentY = marginTop
        }
        
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.text(`Tabla ${tablaNumero}: Resumen de ${seccion.titulo}`, marginLeft, currentY)
        currentY += lineHeight

        const tableData: any[][] = []
        datosSeccionPDF.forEach(item => {
          if (!item) return
          
          tableData.push([{ 
            content: item.pregunta, 
            colSpan: 3, 
            styles: { 
              fontStyle: 'bold', 
              fillColor: [240, 240, 240],
              minCellHeight: 10
            } 
          }])
          item.respuestas.forEach(resp => {
            tableData.push(['', resp.respuesta, `${resp.cantidad} (${resp.porcentaje}%)`])
          })
        })

        // Configurar autoTable si hay datos
        if (tableData.length > 0) {
          autoTable(pdf, {
            startY: currentY,
            head: [['Pregunta', 'Respuesta', 'Frecuencia']],
            body: tableData,
            theme: 'grid',
            headStyles: { 
              fillColor: [66, 139, 202],
              fontSize: 9,
              fontStyle: 'bold',
              textColor: [255, 255, 255]
            },
            bodyStyles: { 
              fontSize: 8,
              cellPadding: 2
            },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 60 },
              2: { cellWidth: 35 }
            },
            margin: { left: marginLeft, right: marginLeft },
            didDrawPage: (data) => {
              currentY = data.cursor?.y || currentY + 50
            }
          })

          currentY = pdf.lastAutoTable?.finalY || currentY + 50
          currentY += lineHeight * 2
          tablaNumero++
        }
      }
    }

    // Agregar tabla de sección si está habilitada
    if (incluirTablaSeccion && seccionSeleccionada !== "distribucion-demografica") {
      const tablasLikertActual = generarTablaLikertPorSeccion()
      if (tablasLikertActual && tablasLikertActual.length > 0) {
        // Verificar si necesitamos nueva página
        if (currentY > 150) {
          pdf.addPage()
          currentY = marginTop
        }

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.text(`Tabla ${tablaNumero}: Resumen de ${SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]?.titulo}`, marginLeft, currentY)
        currentY += lineHeight

        const tableData: any[][] = [
          ['Pregunta', 'TD', 'D', 'I', 'A', 'TA', 'Prom']
        ]

        tablasLikertActual.forEach(tabla => {
          const row = [
            tabla.pregunta.substring(0, 50) + (tabla.pregunta.length > 50 ? '...' : ''),
            formatearPorcentaje((tabla.conteos["Totalmente desacuerdo"] / tabla.totalEncuestas) * 100),
            formatearPorcentaje((tabla.conteos["Desacuerdo"] / tabla.totalEncuestas) * 100),
            formatearPorcentaje((tabla.conteos["Indiferente"] / tabla.totalEncuestas) * 100),
            formatearPorcentaje((tabla.conteos["De acuerdo"] / tabla.totalEncuestas) * 100),
            formatearPorcentaje((tabla.conteos["Totalmente de acuerdo"] / tabla.totalEncuestas) * 100),
            formatearPorcentaje(tabla.promedio)
          ]
          tableData.push(row)
        })

        autoTable(pdf, {
          startY: currentY,
          head: [tableData[0]],
          body: tableData.slice(1),
          theme: 'grid',
          headStyles: { 
            fillColor: [66, 139, 202],
            fontSize: 8,
            fontStyle: 'bold',
            textColor: [255, 255, 255],
            cellWidth: 'wrap'
          },
          bodyStyles: { 
            fontSize: 7,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 15 },
            2: { cellWidth: 15 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 15 },
            6: { cellWidth: 20 }
          },
          margin: { left: marginLeft, right: marginLeft },
          didDrawPage: (data) => {
            currentY = data.cursor?.y || currentY + 50
          }
        })

        currentY = pdf.lastAutoTable?.finalY || currentY + 50
        currentY += lineHeight * 2
      }
    }

    // Agregar nota al pie (APA 7)
    if (currentY < pageHeight - 20) {
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'italic')
      pdf.text('Nota. Datos recopilados del cuestionario de comportamiento proambiental y autosustentabilidad.', 
              marginLeft, currentY + 10)
    }

    // Descargar
    pdf.save(`reporte_autosustentabilidad_APA7_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

    const generarWord = async () => {
  const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  
  let html = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="ProgId" content="Word.Document">
      <meta name="Generator" content="Microsoft Word 15">
      <meta name="Originator" content="Microsoft Word 15">
      <!--[if !mso]>
      <style>
        v\\:* {behavior:url(#default#VML);}
        o\\:* {behavior:url(#default#VML);}
        w\\:* {behavior:url(#default#VML);}
        .shape {behavior:url(#default#VML);}
      </style>
      <![endif]-->
      <style>
        /* Documento Word estilo APA 7 */
        @page {
          size: 8.5in 11in;
          margin: 1in 1in 1in 1in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 2;
          margin: 0;
          padding: 0;
          color: #000000;
          background-color: #ffffff;
        }
        
        .word-container {
          width: 6.5in;
          margin: 0 auto;
          padding: 0;
        }
        
        /* Títulos y encabezados APA 7 */
        h1 {
          font-size: 12pt;
          font-weight: bold;
          text-align: center;
          margin: 0 0 24pt 0;
          padding-top: 12pt;
        }
        
        h2 {
          font-size: 12pt;
          font-weight: bold;
          margin: 18pt 0 6pt 0;
          padding: 0;
          page-break-after: avoid;
        }
        
        /* Párrafos con doble espacio APA */
        p {
          margin: 0 0 12pt 0;
          padding: 0;
          text-align: left;
          line-height: 2;
        }
        
        /* Figuras APA 7 - Optimizadas para nitidez */
        .figure-container {
          margin: 18pt 0;
          text-align: center;
          page-break-inside: avoid;
        }
        
        .figure-image {
          width: 6in;
          height: 4in;
          object-fit: contain;
          margin: 6pt auto;
          display: block;
          border: 1px solid #cccccc;
          -ms-interpolation-mode: bicubic; /* Mejor calidad para IE/Word */
        }
        
        .figure-caption {
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
          margin: 3pt 0 12pt 0;
          padding: 0;
          page-break-before: avoid;
        }
        
        .figure-note {
          font-size: 9pt;
          font-style: italic;
          text-align: left;
          margin: 3pt 0 0 0;
          padding-left: 0.5in;
          padding-right: 0.5in;
        }
        
        /* Tablas APA 7 */
        .table-container {
          margin: 18pt 0;
          page-break-inside: avoid;
        }
        
        .table-caption {
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
          margin: 6pt 0 3pt 0;
          page-break-after: avoid;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 6pt 0;
          border: 1px solid #000000;
        }
        
        th, td {
          border: 1px solid #000000;
          padding: 4pt 6pt;
          font-size: 10pt;
          vertical-align: top;
          text-align: left;
          line-height: 1.5;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        .table-note {
          font-size: 9pt;
          font-style: italic;
          text-align: left;
          margin: 3pt 0 12pt 0;
          padding-left: 0.25in;
        }
        
        /* Elementos específicos */
        .pregunta-header {
          background-color: #e8f4f8;
          font-weight: bold;
        }
        
        .summary-row {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .header-info {
          font-size: 11pt;
          margin: 0 0 18pt 0;
        }
        
        .header-info p {
          margin: 6pt 0;
        }
        
        .note {
          font-size: 10pt;
          font-style: italic;
          margin: 24pt 0 0 0;
          padding-top: 6pt;
          border-top: 1px solid #000000;
        }
        
        /* Control de saltos de página */
        .page-break {
          page-break-before: always;
          mso-page-break-before: always;
        }
        
        .keep-together {
          page-break-inside: avoid;
          mso-page-break-inside: avoid;
        }
        
        /* Secciones */
        .section {
          margin: 0 0 24pt 0;
        }
      </style>
    </head>
    <body>
      <div class="word-container">
        <h1>Reporte de Autosustentabilidad y Comportamiento Proambiental</h1>
        
        <div class="header-info">
          <p><strong>Fecha de generación:</strong> ${fecha}</p>
          <p><strong>Total de registros analizados:</strong> ${datosFiltrados.length}</p>
  `

  // Agregar filtros si existen
  const filtrosTexto: string[] = []
  if (estadoCivil !== "todos") filtrosTexto.push(`Estado Civil: ${estadoCivil}`)
  if (nivelEducacion !== "todos") filtrosTexto.push(`Nivel Educación: ${nivelEducacion}`)
  if (situacionLaboral !== "todos") filtrosTexto.push(`Situación Laboral: ${situacionLaboral}`)
  if (ingresoMensual !== "todos") filtrosTexto.push(`Ingreso Mensual: ${ingresoMensual}`)
  
  if (filtrosTexto.length > 0) {
    html += `<p><strong>Filtros aplicados:</strong> ${filtrosTexto.join(', ')}</p>`
  }

  // Función optimizada para crear imágenes nítidas para Word
  const crearImagenNitidaParaWord = async (dataUrl: string): Promise<string> => {
    try {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          // Dimensiones exactas para Word (6x4 pulgadas a 150 DPI para nitidez)
          const targetWidth = 6 * 150  // 6 pulgadas a 150 DPI = 900px
          const targetHeight = 4 * 150 // 4 pulgadas a 150 DPI = 600px
          
          // Crear canvas con dimensiones exactas
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Configurar contexto para alta calidad
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
            // Calcular dimensiones manteniendo relación de aspecto
            let sourceWidth = img.width
            let sourceHeight = img.height
            let drawX = 0
            let drawY = 0
            let drawWidth = targetWidth
            let drawHeight = targetHeight
            
            // Calcular relación de aspecto
            const imgAspect = sourceWidth / sourceHeight
            const targetAspect = targetWidth / targetHeight
            
            if (imgAspect > targetAspect) {
              // La imagen es más ancha que el objetivo
              drawHeight = targetWidth / imgAspect
              drawY = (targetHeight - drawHeight) / 2
            } else {
              // La imagen es más alta que el objetivo
              drawWidth = targetHeight * imgAspect
              drawX = (targetWidth - drawWidth) / 2
            }
            
            // Fondo blanco
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, targetWidth, targetHeight)
            
            // Dibujar imagen con suavizado de alta calidad
            ctx.drawImage(
              img, 
              0, 0, sourceWidth, sourceHeight,
              drawX, drawY, drawWidth, drawHeight
            )
            
            // Para gráficos de torta, podemos agregar un suavizado extra
            if (tipoGraficoDocumento === "torta") {
              // Aplicar un ligero desenfoque para suavizar bordes (solo para gráficos circulares)
              const tempCanvas = document.createElement('canvas')
              tempCanvas.width = targetWidth
              tempCanvas.height = targetHeight
              const tempCtx = tempCanvas.getContext('2d')
              
              if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0)
                ctx.clearRect(0, 0, targetWidth, targetHeight)
                
                // Aplicar filtro de suavizado sutil
                ctx.filter = 'blur(0.5px)'
                ctx.drawImage(tempCanvas, 0, 0)
                ctx.filter = 'none'
              }
            }
            
            // Convertir a PNG con alta calidad (PNG mantiene mejor la calidad que JPEG para gráficos)
            // Usar PNG para preservar texto nítido en gráficos
            const optimizedDataUrl = canvas.toDataURL('image/png', 1.0)
            
            // Reducir tamaño si es muy grande, pero mantener calidad
            if (optimizedDataUrl.length > 2000000) { // 2MB
              const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95)
              if (jpegDataUrl.length < optimizedDataUrl.length) {
                resolve(jpegDataUrl)
                return
              }
            }
            
            resolve(optimizedDataUrl)
          } else {
            resolve(dataUrl) // Fallback
          }
        }
        img.onerror = () => resolve(dataUrl) // Fallback
        img.src = dataUrl
      })
    } catch (error) {
      console.error('Error optimizando imagen:', error)
      return dataUrl
    }
  }

  // Función para capturar gráfico con alta calidad específica para Word
  const capturarGraficoParaWord = async (
    tipoGraficoCapturar: "barras" | "torta" | "lineal", 
    datosGrafico: DatoGrafico[]
  ) => {
    try {
      // Crear un elemento temporal con dimensiones específicas para Word
      const tempDiv = document.createElement('div')
      tempDiv.style.width = '900px'  // 6 pulgadas a 150 DPI
      tempDiv.style.height = '600px' // 4 pulgadas a 150 DPI
      tempDiv.style.position = 'fixed'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.backgroundColor = '#ffffff'
      tempDiv.style.zIndex = '9999'
      document.body.appendChild(tempDiv)
      
      // Renderizar el gráfico en el elemento temporal
      const ReactDOM = await import('react-dom/client')
      const React = await import('react')
      
      // Componente temporal optimizado para Word
      const GraficoTemporalWord = () => {
        return React.createElement('div', { 
          style: { 
            width: '900px', 
            height: '600px',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }
        }, 
        React.createElement('div', {
          style: {
            width: '900px',
            height: '600px'
          }
        },
        React.createElement(GraficoReusable, {
          datos: datosGrafico,
          tipo: tipoGraficoCapturar,
          tituloX: "Respuestas",
          tituloY: "Cantidad",
          colors: COLORS,
          esMovil: false,
          isLandscape: false,
          showLabelsOnPie: true,
          exportMode: true
        })))
      }
      
      // Crear root y renderizar
      const root = ReactDOM.createRoot(tempDiv)
      root.render(React.createElement(GraficoTemporalWord))
      
      // Esperar suficiente tiempo para que se renderice completamente
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Capturar con alta resolución
      const chartDataUrl = await toPng(tempDiv.firstChild as HTMLElement, {
        backgroundColor: '#ffffff',
        width: 900,  // 6 pulgadas a 150 DPI
        height: 600, // 4 pulgadas a 150 DPI
        pixelRatio: 2, // Alta calidad pero no excesiva
        quality: 1.0,
        cacheBust: true,
        style: {
          width: '900px',
          height: '600px',
          backgroundColor: '#ffffff',
          display: 'block'
        }
      })
      
      // Limpiar
      root.unmount()
      document.body.removeChild(tempDiv)
      
      return chartDataUrl
    } catch (error) {
      console.error('Error capturando gráfico para Word:', error)
      return null
    }
  }

  // Agregar gráfico combinado si está habilitado
  if (incluirGrafico && datosCombinados.length > 0) {
    try {
      // Capturar gráfico con calidad optimizada para Word
      const chartDataUrl = await capturarGraficoParaWord(tipoGraficoDocumento, datosCombinados)
      
      if (chartDataUrl) {
        // Optimizar imagen para nitidez en Word
        const optimizedImageUrl = await crearImagenNitidaParaWord(chartDataUrl)
        
        html += `
          <div class="figure-container keep-together">
            <div class="figure-caption">Figura 1</div>
            <p><em>Distribución combinada de respuestas de las secciones seleccionadas</em></p>
            <img src="${optimizedImageUrl}" alt="Figura 1: Distribución combinada de respuestas" class="figure-image">
            <div class="figure-note">
              <p><em>Nota.</em> El gráfico muestra la distribución agregada de respuestas de todas las preguntas seleccionadas 
              de las secciones no demográficas. Los valores representan frecuencias absolutas y porcentajes relativos.</p>
            </div>
          </div>
        `
      } else {
        html += `
          <div class="figure-container">
            <div class="figure-caption">Figura 1</div>
            <p><em>Distribución combinada de respuestas de las secciones seleccionadas</em></p>
            <p><strong>Nota:</strong> La imagen del gráfico no pudo generarse.</p>
          </div>
        `
      }
    } catch (error) {
      console.error('Error al generar imagen para Word:', error)
      html += `
        <div class="figure-container">
          <div class="figure-caption">Figura 1</div>
          <p><em>Distribución combinada de respuestas de las secciones seleccionadas</em></p>
          <p><strong>Nota:</strong> Error al generar la imagen del gráfico.</p>
        </div>
      `
    }
  }

  // Generar contenido para cada sección seleccionada
  let figuraNumero = 2
  let tablaNumero = 1
  let sectionCount = 0
  
  for (const seccionKey of seccionesIncluidas) {
    const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
    if (!seccion) continue
    
    sectionCount++
    
    // Agregar salto de página si no es la primera sección
    if (sectionCount > 1) {
      html += `<div class="page-break"></div>`
    }
    
    html += `
      <div class="section">
        <h2>${seccion.titulo}</h2>
    `

    // Obtener preguntas seleccionadas para esta sección
    const preguntasSeleccionadas = preguntasPorSeccion[seccionKey] || []
    
    // Si no hay preguntas seleccionadas en esta sección, continuar
    if (preguntasSeleccionadas.length === 0) {
      html += `<p>No se seleccionaron preguntas para esta sección.</p>`
      html += `</div>`
      continue
    }

    // Generar gráficos individuales para cada pregunta seleccionada
    let graficoCount = 0
    for (const preguntaKey of preguntasSeleccionadas) {
      const grupo = seccion.grupos[preguntaKey as keyof typeof seccion.grupos]
      if (!grupo) continue
      
      // Procesar datos para esta pregunta específica
      let datosPregunta: DatoGrafico[] = []
      
      if (seccionKey === "distribucion-demografica") {
        if (grupo.esGruposEdad && grupo.camposEdad) {
          const conteos: Record<string, number> = {}

          Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
            conteos[label] = 0
            datosFiltrados.forEach((registro) => {
              const valor = Number(registro[campo]) || 0
              if (valor > 0) {
                conteos[label]++
              }
            })
          })

          const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

          datosPregunta = Object.entries(conteos).map(([name, value]) => ({
            name,
            value,
            porcentaje: total > 0 ? (value / total) * 100 : 0,
          }))
        } else {
          const conteos: Record<string, number> = {}
          
          grupo.valores?.forEach((valor) => {
            conteos[valor] = 0
          })

          datosFiltrados.forEach((registro) => {
            const valor = registro[grupo.campo]
            if (valor) {
              const valorStr = valor.toString()
              const valorEncontrado = grupo.valores!.find((v) => v.toLowerCase() === valorStr.toLowerCase())
              if (valorEncontrado) {
                conteos[valorEncontrado] = (conteos[valorEncontrado] || 0) + 1
              }
            }
          })

          const total = Object.values(conteos).reduce((sum, val) => sum + val, 0)

          datosPregunta = Object.entries(conteos).map(([name, value]) => ({
            name,
            value,
            porcentaje: total > 0 ? (value / total) * 100 : 0,
          }))
        }
      } else {
        const opcionesLikert = [
          "Totalmente desacuerdo", 
          "Desacuerdo", 
          "Indiferente", 
          "De acuerdo", 
          "Totalmente de acuerdo"
        ]
        
        const totalEncuestas = datosFiltrados.length
        const conteos: Record<string, number> = {}

        opcionesLikert.forEach((valor) => {
          conteos[valor] = 0
        })

        datosFiltrados.forEach((registro) => {
          const valor = registro[grupo.campo]
          if (valor && typeof valor === "string") {
            const valorNorm = normalizarValorLikert(valor)
            if (opcionesLikert.includes(valorNorm)) {
              conteos[valorNorm]++
            }
          }
        })

        datosPregunta = opcionesLikert.map((name) => ({
          name,
          value: conteos[name] || 0,
          porcentaje: totalEncuestas > 0 ? ((conteos[name] || 0) / totalEncuestas) * 100 : 0,
        }))
      }
      
      // Solo generar gráfico si hay datos
      if (datosPregunta.length > 0) {
        try {
          // Capturar gráfico con calidad optimizada para Word
          const chartDataUrl = await capturarGraficoParaWord(tipoGraficoDocumento, datosPregunta)
          
          if (chartDataUrl) {
            // Optimizar imagen para nitidez
            const optimizedImageUrl = await crearImagenNitidaParaWord(chartDataUrl)
            
            // Limitar la longitud del título
            const tituloCorto = grupo.nombre.length > 100 
              ? grupo.nombre.substring(0, 100) + "..." 
              : grupo.nombre
            
            html += `
              <div class="figure-container keep-together">
                <div class="figure-caption">Figura ${figuraNumero}</div>
                <p><em>${tituloCorto}</em></p>
                <img src="${optimizedImageUrl}" alt="Figura ${figuraNumero}: ${tituloCorto}" class="figure-image">
                <div class="figure-note">
                  <p><em>Nota.</em> Gráfico que muestra la distribución de respuestas para la pregunta: "${grupo.nombre}"</p>
                </div>
              </div>
            `
            figuraNumero++
            graficoCount++
            
            // Limitar a 1 gráfico por página para mejor nitidez
            if (graficoCount % 1 === 0 && graficoCount < preguntasSeleccionadas.length) {
              html += `<div class="page-break"></div>`
            }
          }
        } catch (error) {
          console.error('Error generando gráfico individual para Word:', error)
          const tituloCorto = grupo.nombre.length > 100 
            ? grupo.nombre.substring(0, 100) + "..." 
            : grupo.nombre
          
          html += `
            <div class="figure-container">
              <div class="figure-caption">Figura ${figuraNumero}</div>
              <p><em>${tituloCorto}</em></p>
              <p><strong>Nota:</strong> No se pudo generar la imagen del gráfico.</p>
            </div>
          `
          figuraNumero++
          graficoCount++
        }
      }
    }

    // Tabla de resumen para la sección (solo si hay preguntas)
    if (preguntasSeleccionadas.length > 0) {
      // Asegurar que la tabla esté en una nueva página si hay gráficos
      if (graficoCount > 0) {
        html += `<div class="page-break"></div>`
      }
      
      html += `
        <div class="table-container keep-together">
          <div class="table-caption">Tabla ${tablaNumero}</div>
          <p><em>Resumen de respuestas para ${seccion.titulo}</em></p>
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Pregunta</th>
                <th style="width: 30%;">Respuesta</th>
                <th style="width: 25%;">Frecuencia</th>
              </tr>
            </thead>
            <tbody>
      `

      // Procesar preguntas seleccionadas (código de tabla se mantiene igual)
      for (const preguntaKey of preguntasSeleccionadas) {
        const grupo = seccion.grupos[preguntaKey as keyof typeof seccion.grupos]
        if (!grupo) continue

        const nombrePreguntaTabla = grupo.nombre.length > 80 
          ? grupo.nombre.substring(0, 80) + "..." 
          : grupo.nombre

        if (grupo.esGruposEdad && grupo.camposEdad) {
          const conteos: Record<string, number> = {}
          let total = 0
          
          Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
            conteos[label] = 0
            datosFiltrados.forEach(registro => {
              const valor = Number(registro[campo]) || 0
              if (valor > 0) {
                conteos[label] += valor
                total += valor
              }
            })
          })

          const respuestas = Object.entries(conteos)
            .map(([respuesta, cantidad]) => ({
              respuesta,
              cantidad,
              porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(2) : '0'
            }))
            .sort((a, b) => b.cantidad - a.cantidad)

          html += `
            <tr class="pregunta-header">
              <td colspan="3"><strong>${nombrePreguntaTabla}</strong></td>
            </tr>
          `
          
          respuestas.forEach(resp => {
            html += `
              <tr>
                <td></td>
                <td>${resp.respuesta}</td>
                <td>${resp.cantidad} (${resp.porcentaje}%)</td>
              </tr>
            `
          })
          
          html += `
            <tr class="summary-row">
              <td colspan="2" style="text-align: right;"><strong>Total</strong></td>
              <td><strong>${total} (100%)</strong></td>
            </tr>
          `
        } else {
          const conteos: Record<string, number> = {}
          let total = 0
          
          datosFiltrados.forEach((registro) => {
            const valor = registro[grupo.campo]
            if (valor !== null && valor !== undefined) {
              const valorStr = String(valor).trim()
              if (valorStr) {
                conteos[valorStr] = (conteos[valorStr] || 0) + 1
                total++
              }
            }
          })

          const respuestas = Object.entries(conteos)
            .map(([respuesta, cantidad]) => ({
              respuesta,
              cantidad,
              porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(2) : '0'
            }))
            .sort((a, b) => b.cantidad - a.cantidad)

          html += `
            <tr class="pregunta-header">
              <td colspan="3"><strong>${nombrePreguntaTabla}</strong></td>
            </tr>
          `
          
          respuestas.forEach(resp => {
            html += `
              <tr>
                <td></td>
                <td>${resp.respuesta}</td>
                <td>${resp.cantidad} (${resp.porcentaje}%)</td>
              </tr>
            `
          })
          
          html += `
            <tr class="summary-row">
              <td colspan="2" style="text-align: right;"><strong>Total</strong></td>
              <td><strong>${total} (100%)</strong></td>
            </tr>
          `
        }
      }

      html += `
            </tbody>
          </table>
          <div class="table-note">
            <p><em>Nota.</em> Los porcentajes se calculan en base al total de respuestas para cada pregunta. 
            Frecuencia = cantidad absoluta (porcentaje relativo).</p>
          </div>
        </div>
      `
      
      tablaNumero++
    }

    html += `</div>` // Cierre de section
  }

  // Agregar tabla de sección Likert si está habilitada
  if (incluirTablaSeccion && seccionSeleccionada !== "distribucion-demografica") {
    const tablasLikertActual = generarTablaLikertPorSeccion()
    if (tablasLikertActual && tablasLikertActual.length > 0) {
      html += `
        <div class="page-break"></div>
        <div class="section">
          <h2>Análisis de Escala Likert: ${SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]?.titulo}</h2>
          
          <div class="table-container keep-together">
            <div class="table-caption">Tabla ${tablaNumero}</div>
            <p><em>Resumen de respuestas por escala Likert</em></p>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Pregunta</th>
                  <th style="width: 10%; text-align: center;">TD</th>
                  <th style="width: 10%; text-align: center;">D</th>
                  <th style="width: 10%; text-align: center;">I</th>
                  <th style="width: 10%; text-align: center;">A</th>
                  <th style="width: 10%; text-align: center;">TA</th>
                </tr>
              </thead>
              <tbody>
      `
      
      tablasLikertActual.forEach(tabla => {
        const nombrePregunta = tabla.pregunta.length > 70 
          ? tabla.pregunta.substring(0, 70) + "..." 
          : tabla.pregunta
        
        html += `
          <tr>
            <td>${nombrePregunta}</td>
            <td style="text-align: center;">${formatearPorcentaje((tabla.conteos["Totalmente desacuerdo"] / tabla.totalEncuestas) * 100)}</td>
            <td style="text-align: center;">${formatearPorcentaje((tabla.conteos["Desacuerdo"] / tabla.totalEncuestas) * 100)}</td>
            <td style="text-align: center;">${formatearPorcentaje((tabla.conteos["Indiferente"] / tabla.totalEncuestas) * 100)}</td>
            <td style="text-align: center;">${formatearPorcentaje((tabla.conteos["De acuerdo"] / tabla.totalEncuestas) * 100)}</td>
            <td style="text-align: center;">${formatearPorcentaje((tabla.conteos["Totalmente de acuerdo"] / tabla.totalEncuestas) * 100)}</td>
          </tr>
        `
      })
      
      const totalFilas = tablasLikertActual.length
      const promediosTD = tablasLikertActual.reduce((sum, t) => sum + (t.conteos["Totalmente desacuerdo"] / t.totalEncuestas) * 100, 0) / totalFilas
      const promediosD = tablasLikertActual.reduce((sum, t) => sum + (t.conteos["Desacuerdo"] / t.totalEncuestas) * 100, 0) / totalFilas
      const promediosI = tablasLikertActual.reduce((sum, t) => sum + (t.conteos["Indiferente"] / t.totalEncuestas) * 100, 0) / totalFilas
      const promediosA = tablasLikertActual.reduce((sum, t) => sum + (t.conteos["De acuerdo"] / t.totalEncuestas) * 100, 0) / totalFilas
      const promediosTA = tablasLikertActual.reduce((sum, t) => sum + (t.conteos["Totalmente de acuerdo"] / t.totalEncuestas) * 100, 0) / totalFilas
      
      html += `
            </tbody>
          </table>
          
          <div class="table-container">
            <div class="table-caption">Tabla ${tablaNumero + 1}</div>
            <p><em>Promedios generales de la escala Likert</em></p>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Categoría</th>
                  <th style="width: 50%; text-align: center;">Porcentaje Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Totalmente Desacuerdo (TD)</td>
                  <td style="text-align: center;">${formatearPorcentaje(promediosTD)}</td>
                </tr>
                <tr>
                  <td>Desacuerdo (D)</td>
                  <td style="text-align: center;">${formatearPorcentaje(promediosD)}</td>
                </tr>
                <tr>
                  <td>Indiferente (I)</td>
                  <td style="text-align: center;">${formatearPorcentaje(promediosI)}</td>
                </tr>
                <tr>
                  <td>De Acuerdo (A)</td>
                  <td style="text-align: center;">${formatearPorcentaje(promediosA)}</td>
                </tr>
                <tr>
                  <td>Totalmente de Acuerdo (TA)</td>
                  <td style="text-align: center;">${formatearPorcentaje(promediosTA)}</td>
                </tr>
              </tbody>
            </table>
            <div class="table-note">
              <p><em>Nota.</em> TD = Totalmente Desacuerdo, D = Desacuerdo, I = Indiferente, A = De Acuerdo, TA = Totalmente de Acuerdo.</p>
            </div>
          </div>
        </div>
      `
    }
  }

  // Nota final APA 7
  html += `
        <div class="note">
          <p><em>Nota.</em> Este reporte fue generado automáticamente a partir de los datos recopilados en el cuestionario 
          de comportamiento proambiental y autosustentabilidad.</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Crear el archivo Word
  const blob = new Blob([html], { 
    type: 'application/msword;charset=utf-8' 
  })
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.href = url
  link.download = `Reporte_Autosustentabilidad_APA7_${new Date().toISOString().slice(0, 10)}.doc`
  
  document.body.appendChild(link)
  link.click()
  
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary-text">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Filtros</CardTitle>
            </div>
            {hayFiltrosActivos && (
              <Button onClick={limpiarFiltros} variant="ghost" size="sm" className="text-destructive">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado Civil</Label>
              <Select value={estadoCivil} onValueChange={setEstadoCivil}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Casado">Casado</SelectItem>
                  <SelectItem value="Soltero">Soltero</SelectItem>
                  <SelectItem value="Divorciado">Divorciado</SelectItem>
                  <SelectItem value="Viudo">Viudo</SelectItem>
                  <SelectItem value="Unión libre">Unión Libre</SelectItem>
                  <SelectItem value="Separado">Separado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nivel de Educación</Label>
              <Select value={nivelEducacion} onValueChange={setNivelEducacion}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Primaria">Primaria</SelectItem>
                  <SelectItem value="Secundaria">Secundaria</SelectItem>
                  <SelectItem value="Universidad">Universidad</SelectItem>
                  <SelectItem value="Postgrado">Postgrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Situación Laboral</Label>
              <Select value={situacionLaboral} onValueChange={setSituacionLaboral}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Empleado">Empleado</SelectItem>
                  <SelectItem value="Temporal">Temporal</SelectItem>
                  <SelectItem value="Desempleado">Desempleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ingreso Mensual</Label>
              <Select value={ingresoMensual} onValueChange={setIngresoMensual}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Menor al sueldo básico">Menor al sueldo básico</SelectItem>
                  <SelectItem value="Sueldo básico">Sueldo básico</SelectItem>
                  <SelectItem value="Mayor al sueldo básico">Mayor al sueldo básico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Mostrando {datosFiltrados.length} de {datos.length} registros
          </p>
        </CardContent>
      </Card>

      {/* Selector de Sección y Pregunta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seleccionar Datos para Gráfico</CardTitle>
          <CardDescription>
            Elige la sección y pregunta específica para visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sección</Label>
              <Select value={seccionSeleccionada} onValueChange={setSeccionSeleccionada}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {Object.entries(SECCIONES).map(([key, seccion]) => (
                    <SelectItem key={key} value={key}>
                      {seccion.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Variable</Label>
              <Select value={grupoSeleccionado} onValueChange={setGrupoSeleccionado}>
                <SelectTrigger className="bg-background text-left">
                  <SelectValue>
                    <div className="pr-4 overflow-hidden text-left">
                      <span className="font-medium text-foreground text-sm sm:text-base whitespace-normal break-words line-clamp-2">
                        {obtenerTextoSelector(seccionSeleccionada, grupoSeleccionado, esMovil)}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent 
                  className="bg-white max-h-[70vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full"
                  position="popper"
                >
                  {(() => {
                    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
                    if (!seccion) return null
                    
                    return Object.entries(seccion.grupos).map(([key, grupo]) => (
                      <SelectItem 
                        key={key} 
                        value={key} 
                        className="py-3 px-4 hover:bg-muted transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm sm:text-base mb-1 text-foreground whitespace-normal break-words leading-tight">
                            {obtenerPreguntaCompleta(grupo)}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previsualización del Gráfico - CENTRADO */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Previsualización del Gráfico</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setTipoGrafico("barras")}
                variant={tipoGrafico === "barras" ? "default" : "outline"}
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Barras
              </Button>
              <Button
                onClick={() => setTipoGrafico("torta")}
                variant={tipoGrafico === "torta" ? "default" : "outline"}
                size="sm"
              >
                <PieChartIcon className="w-4 h-4 mr-1" />
                Circular
              </Button>
              <Button
                onClick={() => setTipoGrafico("lineal")}
                variant={tipoGrafico === "lineal" ? "default" : "outline"}
                size="sm"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Línea
              </Button>
            </div>
          </div>
          <CardDescription className="mt-2">
            {(() => {
              const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
              const grupo = seccion?.grupos[grupoSeleccionado as keyof typeof seccion.grupos]
              return grupo?.nombre || ""
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div ref={chartRef}>
              <GraficoReusable
                datos={datosGrafico}
                tipo={tipoGrafico}
                tituloX="Respuestas"
                tituloY="Cantidad"
                colors={COLORS}
                esMovil={esMovil}
                isLandscape={isLandscape}
                showLabelsOnPie={true}
              />
            </div>
          </div>

          {/* Botones de descarga de gráfico */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground mr-2 self-center">Descargar gráfico:</span>
            <Button onClick={() => descargarGrafico('png')} variant="outline" size="sm">
              <FileImage className="w-4 h-4 mr-2" />
              PNG (819x520)
            </Button>
            <Button onClick={() => descargarGrafico('jpeg')} variant="outline" size="sm">
              <FileImage className="w-4 h-4 mr-2" />
              JPEG (819x520)
            </Button>
            <Button onClick={() => descargarGrafico('svg')} variant="outline" size="sm">
              <FileImage className="w-4 h-4 mr-2" />
              SVG (819x520)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tablas de visualización - Estilo ComportamientoGraficos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tabla de Sección: {SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]?.titulo}</CardTitle>
            </div>
          </div>
          <CardDescription>
            Todas las variables de la sección seleccionada con sus respuestas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 sm:space-y-8 overflow-x-visible">
            {seccionSeleccionada === "distribucion-demografica" && tablasSeccion && tablasSeccion.length > 0 && (
              <div className="space-y-6 sm:space-y-8 overflow-x-visible">
                {tablasSeccion?.map((tabla, idx) => (
                  <div key={idx}>
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 break-words">
                      {tabla.nombreGrupo}
                    </h4>
                    <div className="w-full overflow-x-visible">
                      {/* Versión Desktop - Tabla tradicional */}
                      <div className="hidden md:block">
                        <Table className="w-full table-auto">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-bold min-w-[200px] max-w-[300px] text-xs sm:text-sm break-words whitespace-normal align-top">
                                Categoría
                              </TableHead>
                              <TableHead className="font-bold text-right min-w-[100px] text-xs sm:text-sm align-top">
                                Cantidad
                              </TableHead>
                              <TableHead className="font-bold text-right min-w-[120px] text-xs sm:text-sm align-top">
                                % del Total
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tabla.datos.map((fila, idx2) => (
                              <TableRow key={idx2}>
                                <TableCell className="font-medium min-w-[200px] max-w-[300px] text-xs sm:text-sm break-words whitespace-normal align-top">
                                  {fila.name}
                                </TableCell>
                                <TableCell className="text-right min-w-[100px] text-xs sm:text-sm align-top">
                                  {fila.value}
                                </TableCell>
                                <TableCell className="text-right min-w-[120px] text-xs sm:text-sm align-top">
                                  {formatearPorcentaje(fila.porcentaje)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell className="min-w-[200px] max-w-[300px] text-xs sm:text-sm break-words whitespace-normal align-top">
                                Total
                              </TableCell>
                              <TableCell className="text-right min-w-[100px] text-xs sm:text-sm align-top">
                                {tabla.total}
                              </TableCell>
                              <TableCell className="text-right min-w-[120px] text-xs sm:text-sm align-top">
                                100%
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Versión Móvil - Cards responsivas */}
                      <div className="md:hidden space-y-4">
                        {tabla.datos.map((fila, idx2) => (
                          <Card key={idx2} className="p-4 border border-border">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium text-foreground break-words whitespace-normal max-w-[70%]">
                                  {fila.name}
                                </span>
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-semibold text-foreground">
                                    {fila.value}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatearPorcentaje(fila.porcentaje)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                        <Card className="p-4 border border-border bg-muted/50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground">Total</span>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-foreground">{tabla.total}</span>
                              <span className="text-xs text-muted-foreground">100%</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {seccionSeleccionada !== "distribucion-demografica" && tablasLikert && tablasLikert.length > 0 && (
              <div className="space-y-6 sm:space-y-8 overflow-x-visible">
                <div className="w-full">
                  {/* Versión Desktop: Tabla tradicional */}
                  <div className="hidden lg:block overflow-x-visible">
                    <Table className="w-full table-auto">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold min-w-[300px] max-w-[500px] break-words whitespace-normal align-top">
                            Pregunta
                          </TableHead>
                          <TableHead className="font-bold text-center min-w-[100px] whitespace-normal px-2 break-words align-top">
                            Totalmente Desacuerdo
                          </TableHead>
                          <TableHead className="font-bold text-center min-w-[90px] whitespace-normal px-2 break-words align-top">
                            Desacuerdo
                          </TableHead>
                          <TableHead className="font-bold text-center min-w-[90px] whitespace-normal px-2 break-words align-top">
                            Indiferente
                          </TableHead>
                          <TableHead className="font-bold text-center min-w-[90px] whitespace-normal px-2 break-words align-top">
                            De Acuerdo
                          </TableHead>
                          <TableHead className="font-bold text-center min-w-[110px] whitespace-normal px-2 break-words align-top">
                            Totalmente Acuerdo
                          </TableHead>
                          <TableHead className="font-bold text-center bg-muted min-w-[100px] whitespace-normal px-2 break-words align-top">
                            Promedio
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tablasLikert.map((tabla, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium text-sm leading-tight py-3 min-w-[300px] max-w-[500px] break-words whitespace-normal align-top">
                              {tabla.pregunta}
                            </TableCell>
                            <TableCell className="text-center text-sm py-3 min-w-[100px] align-top">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Totalmente desacuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </TableCell>
                            <TableCell className="text-center text-sm py-3 min-w-[90px] align-top">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Desacuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </TableCell>
                            <TableCell className="text-center text-sm py-3 min-w-[90px] align-top">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Indiferente"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </TableCell>
                            <TableCell className="text-center text-sm py-3 min-w-[90px] align-top">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["De acuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </TableCell>
                            <TableCell className="text-center text-sm py-3 min-w-[110px] align-top">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Totalmente de acuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </TableCell>
                            <TableCell className="text-center bg-muted font-bold text-sm py-3 min-w-[100px] align-top">
                              {formatearPorcentaje(tabla.promedio)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/70">
                          <TableCell className="font-bold text-sm py-3 min-w-[300px] max-w-[500px] break-words whitespace-normal align-top">
                            Promedio General
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm py-3 min-w-[100px] align-top">
                            {tablasLikert.length > 0 && tablasLikert[0].totalEncuestas > 0
                              ? formatearPorcentaje(
                                  tablasLikert.reduce(
                                    (sum, t) => sum + (t.conteos["Totalmente desacuerdo"] / t.totalEncuestas) * 100,
                                    0,
                                  ) / tablasLikert.length
                                )
                              : "0%"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm py-3 min-w-[90px] align-top">
                            {tablasLikert.length > 0 && tablasLikert[0].totalEncuestas > 0
                              ? formatearPorcentaje(
                                  tablasLikert.reduce(
                                    (sum, t) => sum + (t.conteos["Desacuerdo"] / t.totalEncuestas) * 100,
                                    0,
                                  ) / tablasLikert.length
                                )
                              : "0%"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm py-3 min-w-[90px] align-top">
                            {tablasLikert.length > 0 && tablasLikert[0].totalEncuestas > 0
                              ? formatearPorcentaje(
                                  tablasLikert.reduce(
                                    (sum, t) => sum + (t.conteos["Indiferente"] / t.totalEncuestas) * 100,
                                    0,
                                  ) / tablasLikert.length
                                )
                              : "0%"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm py-3 min-w-[90px] align-top">
                            {tablasLikert.length > 0 && tablasLikert[0].totalEncuestas > 0
                              ? formatearPorcentaje(
                                  tablasLikert.reduce(
                                    (sum, t) => sum + (t.conteos["De acuerdo"] / t.totalEncuestas) * 100,
                                    0,
                                  ) / tablasLikert.length
                                )
                              : "0%"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm py-3 min-w-[110px] align-top">
                            {tablasLikert.length > 0 && tablasLikert[0].totalEncuestas > 0
                              ? formatearPorcentaje(
                                  tablasLikert.reduce(
                                    (sum, t) => sum + (t.conteos["Totalmente de acuerdo"] / t.totalEncuestas) * 100,
                                    0,
                                  ) / tablasLikert.length
                                )
                              : "0%"}
                          </TableCell>
                          <TableCell className="text-center bg-muted font-bold text-sm py-3 min-w-[100px] align-top">
                            {tablasLikert.length > 0
                              ? formatearPorcentaje(
                                  tablasLikert.reduce((sum, t) => sum + t.promedio, 0) / tablasLikert.length
                                )
                              : "0%"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Versión Tablet y Móvil */}
                  <div className="lg:hidden space-y-6">
                    {tablasLikert.map((tabla, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-card">
                        <h5 className="font-semibold text-sm mb-4 text-foreground leading-tight break-words whitespace-normal">
                          {tabla.pregunta}
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-xs font-medium text-muted-foreground break-words whitespace-normal max-w-[70%]">
                              Totalmente Desacuerdo
                            </span>
                            <span className="text-sm font-semibold">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Totalmente desacuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-xs font-medium text-muted-foreground break-words whitespace-normal max-w-[70%]">
                              Desacuerdo
                            </span>
                            <span className="text-sm font-semibold">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Desacuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-xs font-medium text-muted-foreground break-words whitespace-normal max-w-[70%]">
                              Indiferente
                            </span>
                            <span className="text-sm font-semibold">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Indiferente"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-xs font-medium text-muted-foreground break-words whitespace-normal max-w-[70%]">
                              De Acuerdo
                            </span>
                            <span className="text-sm font-semibold">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["De acuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-xs font-medium text-muted-foreground break-words whitespace-normal max-w-[70%]">
                              Totalmente Acuerdo
                            </span>
                            <span className="text-sm font-semibold">
                              {tabla.totalEncuestas > 0
                                ? formatearPorcentaje((tabla.conteos["Totalmente de acuerdo"] / tabla.totalEncuestas) * 100)
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 bg-muted rounded px-3 mt-2">
                            <span className="text-xs font-bold">Promedio</span>
                            <span className="text-sm font-bold">{formatearPorcentaje(tabla.promedio)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Descargas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Descargar Datos</CardTitle>
          </div>
          <CardDescription>
            Exporta los datos en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Descargar datos del gráfico actual */}
          <div className="p-4 border rounded-lg space-y-3 bg-card">
            <h4 className="font-medium flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Datos del gráfico actual
            </h4>
            <p className="text-sm text-muted-foreground">
              Exporta los datos de la variable seleccionada
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => exportarCSV(
                  datosGrafico.map(d => ({ Respuesta: d.name, Cantidad: d.value, "Porcentaje (%)": formatearPorcentaje(d.porcentaje) })),
                  `grafico_${grupoSeleccionado}`
                )} 
                variant="outline" 
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                onClick={() => exportarExcel(
                  datosGrafico.map(d => ({ Respuesta: d.name, Cantidad: d.value, "Porcentaje (%)": formatearPorcentaje(d.porcentaje) })),
                  `grafico_${grupoSeleccionado}`
                )} 
                variant="outline" 
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                XLSX
              </Button>
              <Button 
                onClick={() => exportarJSON(
                  datosGrafico.map(d => ({ respuesta: d.name, cantidad: d.value, porcentaje: d.porcentaje })),
                  `grafico_${grupoSeleccionado}`
                )} 
                variant="outline" 
                size="sm"
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* Descargar tabla de sección completa */}
          <div className="p-4 border rounded-lg space-y-3 bg-card">
            <h4 className="font-medium flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Tabla de sección completa
            </h4>
            <p className="text-sm text-muted-foreground">
              Exporta todas las variables de "{SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]?.titulo}"
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => exportarCSV(getDatosTablaSeccion(), `seccion_${seccionSeleccionada}`)} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportarExcel(getDatosTablaSeccion(), `seccion_${seccionSeleccionada}`)} variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                XLSX
              </Button>
              <Button onClick={() => exportarJSON(getDatosTablaSeccion(), `seccion_${seccionSeleccionada}`)} variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* Descargar datos completos de la BD */}
          <div className="p-4 border rounded-lg space-y-3 bg-card">
            <h4 className="font-medium flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Datos completos de la base de datos
            </h4>
            <p className="text-sm text-muted-foreground">
              Exporta todos los registros filtrados ({datosFiltrados.length}) con nombres de campos correctos
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => exportarCSV(getDatosDBConNombresCorrectos(), "bd_autosustentabilidad")} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportarExcel(getDatosDBConNombresCorrectos(), "bd_autosustentabilidad")} variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                XLSX
              </Button>
              <Button onClick={() => exportarJSON(getDatosDBConNombresCorrectos(), "bd_autosustentabilidad")} variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* Descargar PDF/Word - MEJORADO */}
          <div className="p-4 border rounded-lg space-y-3 bg-card">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reporte completo (PDF / Word)
            </h4>
            <p className="text-sm text-muted-foreground">
              Genera un reporte incluyendo gráfico y tabla
            </p>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" disabled={generandoDocumento}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  {generandoDocumento ? 'Generando...' : 'Configurar y Descargar'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
                <DialogHeader>
                  <DialogTitle>Configurar Reporte</DialogTitle>
                  <DialogDescription>
                    Selecciona qué elementos incluir en el reporte
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Opciones generales */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="incluirGrafico" 
                        checked={incluirGrafico} 
                        onCheckedChange={(checked) => setIncluirGrafico(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="incluirGrafico" className="font-medium">
                          Incluir gráfico (Figura 1)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Gráfico combinado de las preguntas seleccionadas
                        </p>
                      </div>
                    </div>
                    
                    {incluirGrafico && (
                      <div className="ml-6 space-y-2">
                        <Label className="text-sm text-muted-foreground">Tipo de gráfico para el documento:</Label>
                        <Select 
                          value={tipoGraficoDocumento} 
                          onValueChange={(v: "barras" | "torta" | "lineal") => setTipoGraficoDocumento(v)}
                        >
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder="Seleccionar tipo de gráfico" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border">
                            <SelectItem value="barras">Gráfico de Barras</SelectItem>
                            <SelectItem value="torta">Gráfico Circular</SelectItem>
                            <SelectItem value="lineal">Gráfico de Línea</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="incluirTablaSeccion" 
                        checked={incluirTablaSeccion} 
                        onCheckedChange={(checked) => setIncluirTablaSeccion(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="incluirTablaSeccion" className="font-medium">
                          Incluir tabla de sección
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Tabla con las preguntas seleccionadas de cada sección
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selección de secciones y preguntas */}
                  <div className="space-y-4">
                    <Label className="font-medium">Secciones a incluir:</Label>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                      {Object.entries(SECCIONES).map(([seccionKey, seccion]) => {
                        const isSelected = seccionesIncluidas.includes(seccionKey)
                        const preguntasSeleccionadas = preguntasPorSeccion[seccionKey] || []
                        
                        return (
                          <div key={seccionKey} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`seccion-${seccionKey}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleSeccion(seccionKey)}
                              />
                              <Label 
                                htmlFor={`seccion-${seccionKey}`} 
                                className="font-medium text-sm cursor-pointer flex-1"
                              >
                                {seccion.titulo}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                {isSelected ? 
                                  `(${preguntasSeleccionadas.length} preguntas seleccionadas)` : 
                                  '(No seleccionada)'}
                              </span>
                            </div>
                            
                            {/* Mostrar preguntas para TODAS las secciones, incluyendo distribución demográfica */}
                            {isSelected && (
                              <div className="ml-6 space-y-2 border-l-2 border-primary/20 pl-3 pt-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs text-muted-foreground">
                                    Seleccionar preguntas específicas:
                                  </Label>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="xs"
                                      onClick={() => seleccionarTodasPreguntas(seccionKey)}
                                      className="h-6 text-xs"
                                    >
                                      Todas
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="xs"
                                      onClick={() => deseleccionarTodasPreguntas(seccionKey)}
                                      className="h-6 text-xs"
                                    >
                                      Ninguna
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {Object.entries(seccion.grupos)
                                    .filter(([key, grupo]) => key !== "todos")
                                    .map(([preguntaKey, grupo]) => {
                                      const isPreguntaSelected = preguntasSeleccionadas.includes(preguntaKey)
                                      
                                      return (
                                        <div key={preguntaKey} className="flex items-start space-x-2 p-1 hover:bg-accent/50 rounded">
                                          <Checkbox 
                                            id={`pregunta-${seccionKey}-${preguntaKey}`}
                                            checked={isPreguntaSelected}
                                            onCheckedChange={() => togglePregunta(seccionKey, preguntaKey)}
                                            className="mt-1"
                                          />
                                          <Label 
                                            htmlFor={`pregunta-${seccionKey}-${preguntaKey}`} 
                                            className="text-xs cursor-pointer flex-1"
                                            title={grupo.nombre}
                                          >
                                            <div className={`${isPreguntaSelected ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                                              {grupo.nombre}
                                            </div>
                                          </Label>
                                        </div>
                                      )
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSeccionesIncluidas(Object.keys(SECCIONES))
                          // Seleccionar todas las preguntas de todas las secciones (incluyendo distribución demográfica)
                          const todasPreguntas: Record<string, string[]> = {}
                          Object.keys(SECCIONES).forEach(seccionKey => {
                            const seccion = SECCIONES[seccionKey as keyof typeof SECCIONES]
                            const gruposFiltrados = Object.entries(seccion.grupos)
                              .filter(([key, grupo]) => key !== "todos")
                              .map(([key]) => key)
                            todasPreguntas[seccionKey] = gruposFiltrados
                          })
                          setPreguntasPorSeccion(todasPreguntas)
                        }}
                      >
                        Seleccionar todo el contenido
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSeccionesIncluidas([])
                          // Deseleccionar todas las preguntas
                          const todasPreguntas: Record<string, string[]> = {}
                          Object.keys(SECCIONES).forEach(seccionKey => {
                            todasPreguntas[seccionKey] = []
                          })
                          setPreguntasPorSeccion(todasPreguntas)
                        }}
                      >
                        Limpiar selección
                      </Button>
                    </div>
                  </div>

                  {/* Formato de descarga */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Formato de descarga:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={formatoDescarga === "pdf" ? "default" : "outline"}
                          onClick={() => setFormatoDescarga("pdf")}
                          className="flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </Button>
                        <Button
                          type="button"
                          variant={formatoDescarga === "docx" ? "default" : "outline"}
                          onClick={() => setFormatoDescarga("docx")}
                          className="flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Word
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        El formato PDF incluye gráficos de alta calidad. Word incluye tablas formateadas.
                      </p>
                    </div>
                    
                    {/* Resumen de selección */}
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <Label className="font-medium text-sm mb-2 block">Resumen de selección:</Label>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Secciones incluidas:</span>
                          <span className="font-medium">{seccionesIncluidas.length} de {Object.keys(SECCIONES).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preguntas totales:</span>
                          <span className="font-medium">
                            {Object.values(preguntasPorSeccion).reduce((total, preguntas) => 
                              total + preguntas.length, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Incluir gráfico:</span>
                          <span className="font-medium">{incluirGrafico ? 'Sí' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Incluir tablas:</span>
                          <span className="font-medium">{incluirTablaSeccion ? 'Sí' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={generandoDocumento}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={generarDocumento} 
                    disabled={
                      seccionesIncluidas.length === 0 || 
                      generandoDocumento ||
                      Object.values(preguntasPorSeccion).every(preguntas => preguntas.length === 0)
                    }
                    className="min-w-[120px]"
                  >
                    {generandoDocumento ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar {formatoDescarga.toUpperCase()}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Indicador de progreso */}
            {generandoDocumento && (
              <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Generando documento...</p>
                    <p className="text-xs text-muted-foreground">
                      Por favor espera, esto puede tomar unos segundos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
