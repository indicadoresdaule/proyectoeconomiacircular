"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Download } from "lucide-react"

interface GraficosProps {
  datos: any[]
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
]

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

const calcularAnchoEjeY = (datos: any[], esMovil: boolean) => {
  if (esMovil) return 30
  const maxValor = Math.max(...datos.map((d) => d.value))
  const maxDigitos = maxValor.toFixed(0).length
  return Math.max(50, maxDigitos * 8 + 20)
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

// Componente personalizado para etiquetas en gráfico de barras (MÓVIL)
const CustomBarLabelMobile = (props: any) => {
  const { x, y, width, value, index } = props
  const porcentaje = props.porcentaje ?? 0
  
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 25}
        textAnchor="middle"
        fontSize={8}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${value}`}
      </text>
      <text
        x={x + width / 2}
        y={y - 15}
        textAnchor="middle"
        fontSize={7}
        fontWeight="500"
        fill="#059669"
      >
        {`${formatearPorcentajeGrafico(porcentaje)}`}
      </text>
    </g>
  )
}

// Componente personalizado para etiquetas en gráfico de barras (PC)
const CustomBarLabelDesktop = (props: any) => {
  const { x, y, width, value, index } = props
  const porcentaje = props.porcentaje ?? 0
  
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 30}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${value}`}
      </text>
      <text
        x={x + width / 2}
        y={y - 17}
        textAnchor="middle"
        fontSize={9}
        fontWeight="500"
        fill="#059669"
      >
        {`${formatearPorcentajeGrafico(porcentaje)}`}
      </text>
    </g>
  )
}

// Componente personalizado para etiquetas en gráfico de líneas (MÓVIL)
const CustomLineLabelMobile = (props: any) => {
  const { x, y, payload } = props
  
  return (
    <g>
      <text
        x={x}
        y={y - 25}
        textAnchor="middle"
        fontSize={7}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${payload.value}`}
      </text>
      <text
        x={x}
        y={y - 15}
        textAnchor="middle"
        fontSize={6}
        fontWeight="500"
        fill="#059669"
      >
        {`${formatearPorcentajeGrafico(payload.porcentaje)}`}
      </text>
    </g>
  )
}

// Componente personalizado para etiquetas en gráfico de líneas (PC)
const CustomLineLabelDesktop = (props: any) => {
  const { x, y, payload } = props
  
  return (
    <g>
      <text
        x={x}
        y={y - 40}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${payload.value}`}
      </text>
      <text
        x={x}
        y={y - 25}
        textAnchor="middle"
        fontSize={9}
        fontWeight="500"
        fill="#059669"
      >
        {`${formatearPorcentajeGrafico(payload.porcentaje)}`}
      </text>
    </g>
  )
}

// Componente personalizado para etiquetas en gráfico circular (MÓVIL)
const CustomPieLabelMobile = (props: any) => {
  const { x, y, text, payload } = props
  const value = payload?.value || 0
  const porcentaje = payload?.porcentaje || 0
  
  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={7}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${value}`}
      </text>
      <text
        x={x}
        y={y + 9}
        textAnchor="middle"
        fontSize={6}
        fontWeight="500"
        fill="#059669"
      >
        {`${formatearPorcentajeGrafico(porcentaje)}`}
      </text>
    </g>
  )
}

// Componente personalizado para etiquetas en gráfico circular (PC)
const CustomPieLabelDesktop = (props: any) => {
  const { x, y, text, payload } = props
  const value = payload?.value || 0
  const porcentaje = payload?.porcentaje || 0
  
  return (
    <g>
      <text
        x={x}
        y={y - 5}
        textAnchor="middle"
        fontSize={9}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${value}`}
      </text>
      <text
        x={x}
        y={y + 7}
        textAnchor="middle"
        fontSize={8}
        fontWeight="500"
        fill="#059669"
      >
        {`${formatearPorcentajeGrafico(porcentaje)}`}
      </text>
    </g>
  )
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

// Función para calcular el espaciado óptimo para el gráfico lineal en móvil
const calcularEspaciadoLinealMovil = (numDatos: number, esLandscape: boolean) => {
  if (numDatos <= 3) return 0
  if (numDatos <= 5) return esLandscape ? 0 : -5
  if (numDatos <= 7) return esLandscape ? -3 : -8
  return esLandscape ? -5 : -10
}

function GraficosPorSeccion({ datos, seccion }: { datos: any[]; seccion: string }) {
  const [tipoGrafico, setTipoGrafico] = useState<"barras" | "torta" | "lineal">("barras")
  const [esMovil, setEsMovil] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobileWidth = width < 768
      setEsMovil(isMobileWidth)
      // Detectar orientación en móvil
      setIsLandscape(isMobileWidth && width > height)
    }
    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [])

  const datosSeccion = datos.filter((item) => item.seccion === seccion)
  const datosGrafico = datosSeccion.map((item) => ({
    name: item.pregunta,
    ...item.respuestas,
    respuestas: item.respuestas,
  }))
  const respuestasKeys = datosSeccion.length > 0 ? Object.keys(datosSeccion[0].respuestas) : []

  const datosGraficoTorta = respuestasKeys.map((key) => ({
    name: key,
    value: datosSeccion.reduce((acc, item) => acc + (item.respuestas[key] || 0), 0),
    porcentaje:
      (datosSeccion.reduce((acc, item) => acc + (item.respuestas[key] || 0), 0) /
        datosSeccion.reduce(
          (acc, item) => acc + Object.values(item.respuestas).reduce((a: any, b: any) => a + b, 0),
          0,
        )) *
      100,
  }))

  const datosTabla = datosSeccion.map((item) => ({
    pregunta: item.pregunta,
    respuestas: item.respuestas,
  }))

  const anchoEjeY = calcularAnchoEjeY(datosGraficoTorta, esMovil)
  
  // Configuraciones responsivas optimizadas
  const getBarChartMargin = () => {
    if (esMovil && isLandscape) {
      return { top: 40, right: 10, left: anchoEjeY, bottom: 100 }
    } else if (esMovil) {
      return { top: 35, right: 5, left: anchoEjeY, bottom: 110 }
    } else {
      return { top: 30, right: 30, left: anchoEjeY, bottom: 140 }
    }
  }

  // Margen optimizado para gráfico de líneas - MODIFICADO: reducido el margen izquierdo
  const getLineChartMargin = () => {
    if (esMovil && isLandscape) {
      // Reducido el margen izquierdo de 40 a 35
      return { top: 40, right: 10, left: Math.max(25, anchoEjeY - 5), bottom: 100 }
    } else if (esMovil) {
      // Reducido el margen izquierdo de anchoEjeY a Math.max(20, anchoEjeY - 10)
      return { top: 30, right: 2, left: Math.max(20, anchoEjeY - 10), bottom: 110 }
    } else {
      // Reducido el margen izquierdo de anchoEjeY a Math.max(40, anchoEjeY - 10)
      return { top: 28, right: 30, left: Math.max(40, anchoEjeY - 10), bottom: 140 }
    }
  }

  // Alturas optimizadas
  const getChartHeight = () => {
    if (esMovil && isLandscape) {
      return 400
    } else if (esMovil) {
      return 500
    } else {
      return 600
    }
  }

  return (
    <Card className="p-3 sm:p-4 md:p-6 border border-border">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">{seccion}</h3>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Button
            onClick={() => setTipoGrafico("barras")}
            variant={tipoGrafico === "barras" ? "default" : "outline"}
            size="sm"
            className={tipoGrafico === "barras" ? "bg-primary text-white hover:bg-primary" : "text-xs sm:text-sm"}
          >
            Gráfico de Barras
          </Button>
          <Button
            onClick={() => setTipoGrafico("torta")}
            variant={tipoGrafico === "torta" ? "default" : "outline"}
            size="sm"
            className={tipoGrafico === "torta" ? "bg-primary text-white hover:bg-primary" : "text-xs sm:text-sm"}
          >
            Gráfico Circular
          </Button>
          <Button
            onClick={() => setTipoGrafico("lineal")}
            variant={tipoGrafico === "lineal" ? "default" : "outline"}
            size="sm"
            className={tipoGrafico === "lineal" ? "bg-primary text-white hover:bg-primary" : "text-xs sm:text-sm"}
          >
            Gráfico de Línea
          </Button>
        </div>
      </div>

      <Tabs defaultValue="graficos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="graficos" className="text-xs sm:text-sm">
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="tabla" className="text-xs sm:text-sm">
            Datos Detallados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="w-full overflow-hidden">
          {tipoGrafico === "barras" && (
            <div className="w-full" style={{ height: getChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico} margin={getBarChartMargin()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    height={esMovil && !isLandscape ? 90 : esMovil && isLandscape ? 70 : 150}
                    tick={(props) => <CustomRotatedTick {...props} esMovil={esMovil} />}
                    interval={0}
                  />
                  <YAxis fontSize={esMovil ? (isLandscape ? 10 : 9) : 12} tick={{ fill: "#4b5563" }} width={anchoEjeY} />
                  <Tooltip content={<CustomTooltip esMovil={esMovil} showPercentage={false} />} />
                  <Legend wrapperStyle={{ fontSize: esMovil ? "10px" : "12px" }} iconSize={esMovil ? 10 : 14} />
                  {respuestasKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={`respuestas.${key}`}
                      fill={COLORS[index % COLORS.length].bg}
                      stroke={COLORS[index % COLORS.length].border}
                      strokeWidth={2}
                      radius={[6, 6, 0, 0]}
                      name={key}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {tipoGrafico === "torta" && (
            <div className="w-full" style={{ height: getChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosGraficoTorta}
                    cx="50%"
                    cy={esMovil && !isLandscape ? "40%" : "50%"} // Subido para dar más espacio a leyenda
                    labelLine={false}
                    label={(props) => {
                      const { x, y, text, payload } = props
                      const porcentaje = payload?.porcentaje ?? 0
                      const value = payload?.value ?? 0
                      
                      // Solo mostrar si el porcentaje es significativo
                      if (esMovil && porcentaje < 5) return null
                      if (!esMovil && porcentaje < 2) return null
                      
                      if (esMovil) {
                        return (
                          <CustomPieLabelMobile 
                            x={x} 
                            y={y} 
                            text={text} 
                            payload={payload} 
                          />
                        )
                      } else {
                        return (
                          <CustomPieLabelDesktop 
                            x={x} 
                            y={y} 
                            text={text} 
                            payload={payload} 
                          />
                        )
                      }
                    }}
                    outerRadius={esMovil && !isLandscape ? 70 : esMovil && isLandscape ? 60 : 160}
                    innerRadius={esMovil && !isLandscape ? 30 : esMovil && isLandscape ? 25 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={esMovil ? 1 : 2}
                    animationDuration={500}
                  >
                    {datosGraficoTorta.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SOLID_COLORS[index % SOLID_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={esMovil ? 1.5 : 2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
                  <Legend
                    verticalAlign={esMovil && !isLandscape ? "bottom" : "middle"}
                    align={esMovil && !isLandscape ? "center" : "right"}
                    layout={esMovil && !isLandscape ? "horizontal" : "vertical"}
                    wrapperStyle={{
                      paddingTop: esMovil && !isLandscape ? "5px" : "0", // Reducido espacio superior
                      fontSize: esMovil ? (isLandscape ? "8px" : "8px") : "11px", // Fuente más pequeña
                      maxHeight: esMovil && !isLandscape ? "80px" : "150px", // Altura reducida
                      overflowY: "auto",
                      lineHeight: esMovil ? "1.2" : "1.5", // Line-height más compacto
                      width: esMovil && !isLandscape ? "100%" : "auto",
                    }}
                    formatter={(value, entry: any) => {
                      const porcentaje = entry.payload?.porcentaje ?? 0
                      const valor = entry.payload?.value ?? 0
                      return `${value}: ${valor} (${formatearPorcentajeGrafico(porcentaje)})`
                    }}
                    iconSize={esMovil ? 7 : 12} // Iconos más pequeños
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {tipoGrafico === "lineal" && (
            <div className="w-full" style={{ height: getChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={datosGrafico} 
                  margin={getLineChartMargin()}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    height={esMovil && !isLandscape ? 90 : esMovil && isLandscape ? 70 : 150}
                    tick={(props) => <CustomRotatedTick {...props} esMovil={esMovil} />}
                    interval={0}
                    // Reducir padding para que no sobresalgan los puntos
                    padding={{ left: esMovil && !isLandscape ? 15 : 20, right: esMovil && !isLandscape ? 15 : 20 }}
                  />
                  <YAxis 
                    fontSize={esMovil ? (isLandscape ? 10 : 9) : 12} 
                    tick={{ fill: "#4b5563" }} 
                    width={anchoEjeY} 
                  />
                  <Tooltip content={<CustomTooltip esMovil={esMovil} showPercentage={false} />} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: esMovil ? "10px" : "12px",
                      paddingTop: esMovil && !isLandscape ? "10px" : "0"
                    }} 
                    iconSize={esMovil ? 10 : 14} 
                  />
                  {respuestasKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={`respuestas.${key}`}
                      stroke={COLORS[index % COLORS.length].border}
                      strokeWidth={esMovil ? (isLandscape ? 2 : 1.5) : 3}
                      dot={{
                        fill: COLORS[index % COLORS.length].bg,
                        stroke: "#fff",
                        strokeWidth: 2,
                        // Puntos más pequeños y juntos en móvil vertical
                        r: esMovil ? (isLandscape ? 4 : 3) : 6,
                      }}
                      // Reducir el espaciado entre puntos en móvil vertical
                      activeDot={{
                        r: esMovil ? (isLandscape ? 5 : 4) : 8,
                        stroke: "#fff",
                        strokeWidth: esMovil ? 1 : 2
                      }}
                      name={key}
                      // Mejorar el renderizado para evitar desbordamiento
                      isAnimationActive={!esMovil || isLandscape}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tabla" className="w-full overflow-x-visible">
          <div className="hidden md:block">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[300px] max-w-[400px] text-xs lg:text-sm break-words whitespace-normal align-top">
                    Pregunta
                  </TableHead>
                  {respuestasKeys.map((key) => (
                    <TableHead 
                      key={key} 
                      className="text-center min-w-[80px] max-w-[120px] text-xs lg:text-sm px-2 break-words whitespace-normal align-top"
                    >
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {datosTabla.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium min-w-[300px] max-w-[400px] text-xs lg:text-sm break-words whitespace-normal align-top">
                      {item.pregunta}
                    </TableCell>
                    {respuestasKeys.map((key) => (
                      <TableCell 
                        key={key} 
                        className="text-center min-w-[80px] max-w-[120px] text-xs lg:text-sm px-2 align-top"
                      >
                        {item.respuestas[key] || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-4">
            {datosTabla.map((item, index) => (
              <Card key={index} className="p-4 border border-border">
                <h4 className="font-bold text-sm text-foreground mb-3 break-words whitespace-normal">
                  {item.pregunta}
                </h4>
                <div className="space-y-2">
                  {respuestasKeys.map((key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-1 border-b border-border/50 last:border-0"
                    >
                      <span className="text-xs text-foreground/70 break-words whitespace-normal max-w-[70%]">
                        {key}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{item.respuestas[key] || 0}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function ComportamientoGraficos({ datos }: GraficosProps) {
  const [tipoGrafico, setTipoGrafico] = useState<"barras" | "torta" | "lineal">("barras")
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>("distribucion-demografica")
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>("grupos-edad")
  const [esMovil, setEsMovil] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobileWidth = width < 768
      setEsMovil(isMobileWidth)
      // Detectar orientación en móvil
      setIsLandscape(isMobileWidth && width > height)
    }
    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [])

  const downloadChart = useCallback(async () => {
    if (!chartContainerRef.current) return

    setIsDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const chartElement = chartContainerRef.current

      const canvas = await html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const seccionNombre = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]?.titulo || seccionSeleccionada
      const link = document.createElement("a")
      link.download = `grafico-autosustentabilidad-${seccionNombre.replace(/\s+/g, "-").toLowerCase()}-${tipoGrafico}-${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error al descargar grafico:", error)
    } finally {
      setIsDownloading(false)
    }
  }, [tipoGrafico, seccionSeleccionada])

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
      
      const totalEncuestas = datos.length
      datos.forEach((registro) => {
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
        datos.forEach((registro) => {
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
      const totalEncuestas = datos.length
      const conteos: Record<string, number> = {}

      grupo.valores.forEach((valor) => {
        conteos[valor] = 0
      })

      datos.forEach((registro) => {
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

    datos.forEach((registro) => {
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

  const generarTablaPorSeccion = () => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    if (!seccion) return null

    return Object.entries(seccion.grupos).map(([key, grupo]) => {
      if (grupo.esTodos) return null // Saltar la opción "todos"
      
      if (grupo.esGruposEdad && grupo.camposEdad) {
        const conteos: Record<string, number> = {}

        Object.entries(grupo.camposEdad).forEach(([label, campo]) => {
          conteos[label] = 0
          datos.forEach((registro) => {
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

      datos.forEach((registro) => {
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

  const generarTablaLikertPorSeccion = (datos: any[], seccionSeleccionada: string) => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    if (!seccion || seccionSeleccionada === "distribucion-demografica") return null

    const totalEncuestas = datos.length

    return Object.entries(seccion.grupos).map(([key, grupo]) => {
      if (grupo.esTodos) return null // Saltar la opción "todos"
      
      const opcionesLikert = ["Totalmente desacuerdo", "Desacuerdo", "Indiferente", "De acuerdo", "Totalmente de acuerdo"]

      // CONTARA: contar cuántas veces aparece cada opción
      const conteos: Record<string, number> = {}
      opcionesLikert.forEach((opcion) => {
        conteos[opcion] = 0
      })

      datos.forEach((registro) => {
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

  const datosGrafico = procesarDatos()
  const tablasSeccion = generarTablaPorSeccion()
  const tablasLikert = generarTablaLikertPorSeccion(datos, seccionSeleccionada)
  const anchoEjeY = calcularAnchoEjeY(datosGrafico, esMovil)
  
  // Configuraciones responsivas optimizadas
  const getBarChartMargin = () => {
    if (esMovil && isLandscape) {
      return { top: 40, right: 10, left: anchoEjeY, bottom: 100 }
    } else if (esMovil) {
      return { top: 35, right: 5, left: anchoEjeY, bottom: 110 }
    } else {
      return { top: 30, right: 30, left: anchoEjeY, bottom: 140 }
    }
  }

  // Margen optimizado para gráfico de líneas - MODIFICADO: reducido el margen izquierdo
  const getLineChartMargin = () => {
    if (esMovil && isLandscape) {
      // Reducido el margen izquierdo de 40 a 35
      return { top: 40, right: 10, left: Math.max(25, anchoEjeY - 5), bottom: 100 }
    } else if (esMovil) {
      // Reducido el margen izquierdo de anchoEjeY a Math.max(20, anchoEjeY - 10)
      return { top: 35, right: 2, left: Math.max(20, anchoEjeY - 10), bottom: 110 }
    } else {
      // Reducido el margen izquierdo de anchoEjeY a Math.max(40, anchoEjeY - 10)
      return { top: 30, right: 30, left: Math.max(40, anchoEjeY - 10), bottom: 140 }
    }
  }

  // Alturas optimizadas
  const getChartHeight = () => {
    if (esMovil && isLandscape) {
      return 400
    } else if (esMovil) {
      return 500
    } else {
      return 600
    }
  }

  // Calcular espaciado para puntos del gráfico lineal
  const calcularPaddingXAxis = () => {
    if (datosGrafico.length <= 2) return { left: 20, right: 20 }
    if (esMovil && !isLandscape) {
      // Más ajustado en móvil vertical
      return { left: 15, right: 15 }
    }
    if (esMovil && isLandscape) {
      return { left: 20, right: 20 }
    }
    return { left: 30, right: 30 }
  }

  // Función para obtener la pregunta completa de un grupo
  const obtenerPreguntaCompleta = (grupo: any) => {
    if (seccionSeleccionada === "distribucion-demografica") {
      return grupo.nombre
    }
    return grupo.nombre
  }

  // Función para mostrar texto en el selector
  const obtenerTextoSelector = () => {
    const seccion = SECCIONES[seccionSeleccionada as keyof typeof SECCIONES]
    const grupo = seccion?.grupos[grupoSeleccionado as keyof typeof seccion.grupos]
    
    if (!grupo) return "Seleccionar variable"
    
    const preguntaCompleta = obtenerPreguntaCompleta(grupo)
    
    // Para móvil, mostrar desde el signo de pregunta hasta donde alcance
    if (esMovil && seccionSeleccionada !== "distribucion-demografica") {
      // Encontrar el primer signo de pregunta
      const indicePregunta = preguntaCompleta.indexOf("¿")
      if (indicePregunta !== -1) {
        const textoDesdePregunta = preguntaCompleta.substring(indicePregunta)
        
        // Si el texto es muy largo, cortar y agregar puntos suspensivos
        if (textoDesdePregunta.length > 40) {
          return textoDesdePregunta.substring(0, 37) + "..."
        }
        return textoDesdePregunta
      }
    }
    
    // Para PC o secciones sin signo de pregunta, mostrar texto completo
    return preguntaCompleta
  }

  return (
    <div className="space-y-8">
      <Tabs
        value={seccionSeleccionada}
        onValueChange={(value) => {
          setSeccionSeleccionada(value)
          const primeraSeccion = SECCIONES[value as keyof typeof SECCIONES]
          const primerGrupo = Object.keys(primeraSeccion.grupos)[0]
          setGrupoSeleccionado(primerGrupo)
        }}
        className="w-full"
      >
        <TabsList className="w-full flex flex-wrap justify-start h-auto gap-3 bg-muted/50 p-3 rounded-lg">
          {Object.entries(SECCIONES).map(([seccionKey, seccion]) => (
            <TabsTrigger
              key={seccionKey}
              value={seccionKey}
              className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2.5 text-sm whitespace-nowrap"
            >
              {seccion.titulo}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(SECCIONES).map(([seccionKey, seccion]) => (
          <TabsContent key={seccionKey} value={seccionKey} className="mt-6 space-y-8">
            <Card className="p-3 sm:p-4 md:p-6 border border-border">
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">
                  {seccion.titulo}
                </h3>

                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-foreground">Seleccionar Variable</label>
                  <Select value={grupoSeleccionado} onValueChange={setGrupoSeleccionado}>
                    <SelectTrigger className="bg-white border-border text-left w-full">
                      <SelectValue>
                        <div className="pr-4 overflow-hidden text-left">
                          <span className="font-medium text-foreground text-sm sm:text-base whitespace-normal break-words line-clamp-2">
                            {obtenerTextoSelector()}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-white max-h-[70vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full"
                      position="popper"
                    >
                      {Object.entries(seccion.grupos).map(([key, grupo]) => (
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
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  <Button
                    onClick={() => setTipoGrafico("barras")}
                    variant={tipoGrafico === "barras" ? "default" : "outline"}
                    size="sm"
                    className={tipoGrafico === "barras" ? "bg-primary text-white hover:bg-primary" : "text-xs sm:text-sm"}
                  >
                    Gráfico de Barras
                  </Button>
                  <Button
                    onClick={() => setTipoGrafico("torta")}
                    variant={tipoGrafico === "torta" ? "default" : "outline"}
                    size="sm"
                    className={tipoGrafico === "torta" ? "bg-primary text-white hover:bg-primary" : "text-xs sm:text-sm"}
                  >
                    Gráfico Circular
                  </Button>
                  <Button
                    onClick={() => setTipoGrafico("lineal")}
                    variant={tipoGrafico === "lineal" ? "default" : "outline"}
                    size="sm"
                    className={tipoGrafico === "lineal" ? "bg-primary text-white hover:bg-primary" : "text-xs sm:text-sm"}
                  >
                    Gráfico de Línea
                  </Button>
                </div>
              </div>

              <div className="w-full" style={{ height: getChartHeight() }}>
                {tipoGrafico === "barras" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosGrafico} margin={getBarChartMargin()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        height={esMovil && !isLandscape ? 90 : esMovil && isLandscape ? 70 : 150}
                        tick={(props) => <CustomRotatedTick {...props} esMovil={esMovil} />}
                        interval={0}
                      />
                      <YAxis fontSize={esMovil ? (isLandscape ? 10 : 9) : 12} tick={{ fill: "#4b5563" }} width={anchoEjeY} />
                      <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
                      <Bar
                        dataKey="value"
                        label={(props) => (
                          esMovil ? (
                            <CustomBarLabelMobile 
                              {...props} 
                              porcentaje={datosGrafico[props.index]?.porcentaje} 
                            />
                          ) : (
                            <CustomBarLabelDesktop 
                              {...props} 
                              porcentaje={datosGrafico[props.index]?.porcentaje} 
                            />
                          )
                        )}
                        radius={[6, 6, 0, 0]}
                      >
                        {datosGrafico.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length].bg}
                            stroke={COLORS[index % COLORS.length].border}
                            strokeWidth={esMovil ? 1.5 : 2}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {tipoGrafico === "torta" && (
                  <div style={{ height: getChartHeight() }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={datosGrafico}
                          cx="50%"
                          cy={esMovil && !isLandscape ? "40%" : "50%"} // Subido para dar más espacio a leyenda
                          labelLine={false}
                          label={(props) => {
                            const { x, y, text, payload } = props
                            const porcentaje = payload?.porcentaje ?? 0
                            const value = payload?.value ?? 0
                            
                            // Solo mostrar si el porcentaje es significativo
                            if (esMovil && porcentaje < 5) return null
                            if (!esMovil && porcentaje < 2) return null
                            
                            if (esMovil) {
                              return (
                                <CustomPieLabelMobile 
                                  x={x} 
                                  y={y} 
                                  text={text} 
                                  payload={payload} 
                                />
                              )
                            } else {
                              return (
                                <CustomPieLabelDesktop 
                                  x={x} 
                                  y={y} 
                                  text={text} 
                                  payload={payload} 
                                />
                              )
                            }
                          }}
                          outerRadius={esMovil && !isLandscape ? 70 : esMovil && isLandscape ? 60 : 160}
                          innerRadius={esMovil && !isLandscape ? 30 : esMovil && isLandscape ? 25 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={esMovil ? 1 : 2}
                          animationDuration={500}
                        >
                          {datosGrafico.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={SOLID_COLORS[index % SOLID_COLORS.length]}
                              stroke="#fff"
                              strokeWidth={esMovil ? 1.5 : 2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
                        <Legend
                          verticalAlign={esMovil && !isLandscape ? "bottom" : "middle"}
                          align={esMovil && !isLandscape ? "center" : "right"}
                          layout={esMovil && !isLandscape ? "horizontal" : "vertical"}
                          wrapperStyle={{
                            paddingTop: esMovil && !isLandscape ? "5px" : "0", // Reducido espacio superior
                            fontSize: esMovil ? (isLandscape ? "8px" : "8px") : "11px", // Fuente más pequeña
                            maxHeight: esMovil && !isLandscape ? "80px" : "150px", // Altura reducida
                            overflowY: "auto",
                            lineHeight: esMovil ? "1.2" : "1.5", // Line-height más compacto
                            width: esMovil && !isLandscape ? "100%" : "auto",
                          }}
                          formatter={(value, entry: any) => {
                            const porcentaje = entry.payload?.porcentaje ?? 0
                            const valor = entry.payload?.value ?? 0
                            return `${value}: ${valor} (${formatearPorcentajeGrafico(porcentaje)})`
                          }}
                          iconSize={esMovil ? 7 : 12} // Iconos más pequeños
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {tipoGrafico === "lineal" && (
                  <div style={{ height: getChartHeight() }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={datosGrafico} 
                        margin={getLineChartMargin()}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          height={esMovil && !isLandscape ? 90 : esMovil && isLandscape ? 70 : 150}
                          tick={(props) => <CustomRotatedTick {...props} esMovil={esMovil} />}
                          interval={0}
                          padding={calcularPaddingXAxis()}
                        />
                        <YAxis 
                          fontSize={esMovil ? (isLandscape ? 10 : 9) : 12} 
                          tick={{ fill: "#4b5563" }} 
                          width={anchoEjeY} 
                        />
                        <Tooltip content={<CustomTooltip esMovil={esMovil} />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0ea5e9"
                          strokeWidth={esMovil ? (isLandscape ? 2 : 1.5) : 3}
                          dot={(props) => {
                            const { cx, cy, payload, index } = props
                            return (
                              <g key={`dot-${payload.name}`}>
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  // Puntos más pequeños en móvil vertical
                                  r={esMovil ? (isLandscape ? 4 : 3) : 6}
                                  fill={COLORS[index % COLORS.length].bg}
                                  stroke="white"
                                  strokeWidth={esMovil ? 1 : 2}
                                />
                                {esMovil ? (
                                  <CustomLineLabelMobile
                                    x={cx}
                                    y={cy}
                                    payload={payload}
                                  />
                                ) : (
                                  <CustomLineLabelDesktop
                                    x={cx}
                                    y={cy}
                                    payload={payload}
                                  />
                                )}
                              </g>
                            )
                          }}
                          activeDot={{ 
                            r: esMovil ? (isLandscape ? 5 : 4) : 8,
                            stroke: "white",
                            strokeWidth: esMovil ? 1 : 2
                          }}
                          // Mejorar el renderizado para móvil
                          isAnimationActive={!esMovil || isLandscape}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-3 sm:p-4 md:p-6 border border-border">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                {seccion.titulo} - Datos Detallados
              </h3>
              <div className="space-y-6 sm:space-y-8 overflow-x-visible">
                {seccionKey === "distribucion-demografica" && tablasSeccion && tablasSeccion.length > 0 && (
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
                                  <TableCell className="text-right min-w=[100px] text-xs sm:text-sm align-top">
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

                {seccionKey !== "distribucion-demografica" && tablasLikert && tablasLikert.length > 0 && (
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
                              <TableCell className="text-center font-bold text-sm py-3 min-w=[90px] align-top">
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
                                <span className="text-xs font-medium text-muted-foreground break-words whitespace-normal max-w=[70%]">
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
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export { ComportamientoGraficos, GraficosPorSeccion }
