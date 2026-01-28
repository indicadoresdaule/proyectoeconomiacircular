"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Download, ImageIcon, X, Filter, FileText, Eye, FileSpreadsheet, FileImage, Settings2 } from "lucide-react"
import { BarChart3, PieChartIcon, TrendingUp, FileJson } from "lucide-react"
import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  CATEGORIAS_DESECHOS,
  calcularDatosGraficos,
  calcularDatosTabla,
  type CaracterizacionRecord,
} from "@/lib/utils/caracterizacion-data"

// COLORES CLAROS MEJORADOS PARA TODOS LOS GRÁFICOS (CONSISTENTES)
const COLORS_BARRAS = [
  { bg: "rgba(255, 159, 64, 0.8)", border: "rgb(255, 159, 64)" },     // Naranja claro
  { bg: "rgba(54, 162, 235, 0.8)", border: "rgb(54, 162, 235)" },     // Azul claro
  { bg: "rgba(75, 192, 192, 0.8)", border: "rgb(75, 192, 192)" },     // Verde azulado claro
  { bg: "rgba(153, 102, 255, 0.8)", border: "rgb(153, 102, 255)" },   // Púrpura claro
  { bg: "rgba(255, 205, 86, 0.8)", border: "rgb(255, 205, 86)" },     // Amarillo claro
  { bg: "rgba(255, 99, 132, 0.8)", border: "rgb(255, 99, 132)" },     // Rosa claro
  { bg: "rgba(201, 203, 207, 0.8)", border: "rgb(201, 203, 207)" },   // Gris claro
  { bg: "rgba(255, 159, 64, 0.8)", border: "rgb(255, 159, 64)" },     // Naranja (repetido)
  { bg: "rgba(54, 162, 235, 0.8)", border: "rgb(54, 162, 235)" },     // Azul (repetido)
  { bg: "rgba(75, 192, 192, 0.8)", border: "rgb(75, 192, 192)" },     // Verde azulado (repetido)
]

const COLORS_TORTA = [
  "rgb(255, 159, 64)",    // Naranja claro
  "rgb(54, 162, 235)",    // Azul claro
  "rgb(75, 192, 192)",    // Verde azulado claro
  "rgb(153, 102, 255)",   // Púrpura claro
  "rgb(255, 205, 86)",    // Amarillo claro
  "rgb(255, 99, 132)",    // Rosa claro
  "rgb(201, 203, 207)",   // Gris claro
  "rgb(255, 159, 64)",    // Naranja (repetido)
  "rgb(54, 162, 235)",    // Azul (repetido)
  "rgb(75, 192, 192)",    // Verde azulado (repetido)
]

const COLORS_LINEAL = [
  { bg: "rgba(54, 162, 235, 0.8)", border: "rgb(54, 162, 235)" },     // Azul claro
  { bg: "rgba(255, 99, 132, 0.8)", border: "rgb(255, 99, 132)" },     // Rosa claro
  { bg: "rgba(75, 192, 192, 0.8)", border: "rgb(75, 192, 192)" },     // Verde azulado claro
  { bg: "rgba(255, 205, 86, 0.8)", border: "rgb(255, 205, 86)" },     // Amarillo claro
  { bg: "rgba(153, 102, 255, 0.8)", border: "rgb(153, 102, 255)" },   // Púrpura claro
]

// Nombres correctos para campos de la base de datos
const NOMBRES_CAMPOS_DB: Record<string, string> = {
  id: "ID",
  lugar: "Ubicación",
  fecha_registro: "Fecha de Registro",
  materia_organica_jardin_kg: "Materia Orgánica - Jardín (kg)",
  materia_organica_cocina_kg: "Materia Orgánica - Cocina (kg)",
  grasas_aceite_comestible_kg: "Grasas y Aceites - Aceite Comestible (kg)",
  medicina_jarabe_kg: "Medicina - Jarabe (kg)",
  medicina_tabletas_kg: "Medicina - Tabletas (kg)",
  papel_blanco_kg: "Papeles y Cartón - Papel Blanco (kg)",
  papel_periodico_kg: "Papeles y Cartón - Papel Periódico (kg)",
  papel_archivo_kg: "Papeles y Cartón - Papel Archivo (kg)",
  carton_kg: "Papeles y Cartón - Cartón (kg)",
  tetra_brik_kg: "Papeles y Cartón - Tetra-brik (kg)",
  plastico_pet_kg: "Plásticos - PET (kg)",
  plastico_mixto_kg: "Plásticos - Plástico Mixto (kg)",
  bot_aceite_kg: "Plásticos - Botella de Aceite (kg)",
  bolsas_kg: "Plásticos - Bolsas (kg)",
  vidrio_blanco_kg: "Vidrios - Blanco (kg)",
  vidrio_verde_kg: "Vidrios - Verde (kg)",
  vidrio_otros_kg: "Vidrios - Otros (kg)",
  latas_ferrosas_kg: "Metales - Latas Ferrosas (kg)",
  aluminio_kg: "Metales - Aluminio (kg)",
  acero_kg: "Metales - Acero (kg)",
  metal_otros_kg: "Metales - Otros (kg)",
  textiles_ropa_kg: "Textiles - Ropa, Mantas, Manteles (kg)",
  caucho_zapatos_neumaticos_kg: "Caucho - Zapatos, Neumáticos (kg)",
  cuero_zapatos_neumaticos_kg: "Cuero - Zapatos, Carteras (kg)",
  papel_higienico_kg: "Resto Sanitarios - Papel Higiénico (kg)",
  maderas_kg: "Maderas (kg)",
  baterias_tel_lamparas_kg: "Baterías - Teléfono, Lámparas (kg)",
  electronicos_electrodomesticos_kg: "Equipos Electrónicos - Electrodomésticos (kg)",
  escombros_otros_kg: "Escombros - Otros (kg)",
}

// Componente GraficoReusable con dimensiones responsivas
interface GraficoReusableProps {
  datos: { name: string; value: number; porcentaje: number }[]
  tipo: "barras" | "torta" | "lineal"
  onRenderComplete?: () => void
  exportMode?: boolean
  colors?: any[]
  esMovil?: boolean
  isLandscape?: boolean
  showLabelsOnPie?: boolean
  tituloX?: string
  tituloY?: string
}

const GraficoReusable: React.FC<GraficoReusableProps> = ({ 
  datos, 
  tipo,
  onRenderComplete,
  exportMode = false,
  colors,
  esMovil = false,
  isLandscape = false,
  showLabelsOnPie = true,
  tituloX = "Categorías",
  tituloY = "Peso (kg)"
}) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const chartWidth = exportMode ? 900 : (esMovil || isMobile) ? 350 : 819;
  const chartHeight = exportMode ? 600 : (esMovil || isMobile) ? 400 : 520;

  // Importar Recharts dinámicamente
  const [Recharts, setRecharts] = useState<any>(null)
  
  useEffect(() => {
    const loadRecharts = async () => {
      const recharts = await import('recharts')
      setRecharts(recharts)
      // Notificar que el gráfico se ha renderizado
      if (onRenderComplete) {
        setTimeout(() => onRenderComplete(), 100)
      }
    }
    loadRecharts()
  }, [onRenderComplete])

  useEffect(() => {
    // Notificar cuando cambia el tipo de gráfico
    if (Recharts && onRenderComplete) {
      setTimeout(() => onRenderComplete(), 100)
    }
  }, [tipo, Recharts, onRenderComplete])

  if (!Recharts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary-text">Cargando gráfico...</p>
        </div>
      </div>
    )
  }

  const {
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
  } = Recharts

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm">
          <p className="font-semibold mb-2 text-gray-800">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">Cantidad: </span>
              {data.value.toFixed(2)} kg
            </p>
            <p className="text-green-600">
              <span className="font-medium">Porcentaje: </span>
              {data.porcentaje.toFixed(1)}%
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value, index } = props
    const porcentaje = datos[index]?.porcentaje || 0
    
    const isMobileSize = (esMovil || isMobile);
    const fontSizeValue = isMobileSize ? 8 : 10;
    const fontSizePorcentaje = isMobileSize ? 7 : 9;
    const yOffsetValue = isMobileSize ? -25 : -35;
    const yOffsetPorcentaje = isMobileSize ? -15 : -20;
    
    return (
      <g>
        <text
          x={x + width / 2}
          y={y + yOffsetValue}
          textAnchor="middle"
          fontSize={fontSizeValue}
          fontWeight="600"
          fill="#1f2937"
        >
          {value.toFixed(0)}kg
        </text>
        <text
          x={x + width / 2}
          y={y + yOffsetPorcentaje}
          textAnchor="middle"
          fontSize={fontSizePorcentaje}
          fontWeight="500"
          fill="#ff0000"
        >
          {porcentaje.toFixed(1)}%
        </text>
      </g>
    )
  }

  const CustomRotatedTick = (props: any) => {
    const { x, y, payload } = props
    const isMobileSize = (esMovil || isMobile);
    
    return (
      <g transform={`translate(${x},${y}) rotate(-45)`}>
        <text
          x={0}
          y={0}
          dy={isMobileSize ? 10 : 20}
          textAnchor="end"
          fontSize={isMobileSize ? 8 : 11}
          fill="#4b5563"
          className="font-medium"
        >
          {payload.value}
        </text>
      </g>
    )
  }

  const barColors = colors || COLORS_BARRAS
  const pieColors = colors || COLORS_TORTA
  const lineColors = colors || COLORS_LINEAL

  if (tipo === "barras") {
    const isMobileSize = (esMovil || isMobile);
    const marginTop = isMobileSize ? 30 : 45;
    const marginBottom = isMobileSize ? 80 : 110;
    const marginLeft = isMobileSize ? 40 : 60;
    const marginRight = isMobileSize ? 40 : 60;
    const barSize = isMobileSize ? 25 : 45;
    const barGap = isMobileSize ? 5 : 9;
    
    return (
      <div style={{ width: chartWidth, height: chartHeight }}>
        <BarChart 
          width={chartWidth}
          height={chartHeight}
          data={datos} 
          margin={{ 
            top: marginTop,
            right: marginRight, 
            left: marginLeft, 
            bottom: marginBottom
          }}
          barSize={barSize}
          barGap={barGap}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            height={isMobileSize ? 60 : 110}
            tick={<CustomRotatedTick />}
            interval={0}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
          />
          <YAxis 
            fontSize={isMobileSize ? 10 : 12} 
            tick={{ fill: "#4b5563" }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            tickFormatter={(value) => `${value} kg`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[3, 3, 0, 0]}
            label={(props) => (
              <CustomBarLabel {...props} />
            )}
          >
            {datos.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={barColors[index % barColors.length].bg} 
                stroke={barColors[index % barColors.length].border} 
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </div>
    )
  }

  if (tipo === "torta") {
    const isMobileSize = (esMovil || isMobile);
    const outerRadius = isMobileSize ? 80 : 120;
    const innerRadius = isMobileSize ? 40 : 60;
    const legendHeight = isMobileSize ? 100 : 80;
    const legendFontSize = isMobileSize ? 8 : 10;
    const iconSize = isMobileSize ? 6 : 8;
    
    return (
      <div style={{ width: chartWidth, height: chartHeight }}>
        <PieChart width={chartWidth} height={chartHeight}>
          <Pie
            data={datos}
            cx={chartWidth / 2}
            cy={chartHeight / 2}
            labelLine={false}
            label={(props) => {
              if (!showLabelsOnPie) return null
              
              const { x, y, payload } = props
              const porcentaje = payload?.porcentaje ?? 0
              const value = payload?.value ?? 0
              
              if (porcentaje < 2) return null
              
              return (
                <g>
                  <text
                    x={x}
                    y={y - (isMobileSize ? 3 : 5)}
                    textAnchor="middle"
                    fontSize={isMobileSize ? 7 : 9}
                    fontWeight="600"
                    fill="#1f2937"
                  >
                    {`${value.toFixed(0)}kg`}
                  </text>
                  <text
                    x={x}
                    y={y + (isMobileSize ? 5 : 7)}
                    textAnchor="middle"
                    fontSize={isMobileSize ? 6 : 8}
                    fontWeight="500"
                    fill="#ff0000"
                  >
                    {`${porcentaje.toFixed(1)}%`}
                  </text>
                </g>
              )
            }}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            dataKey="value"
            paddingAngle={3}
          >
            {datos.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={pieColors[index % pieColors.length]} 
                stroke="#fff" 
                strokeWidth={2.5}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {!exportMode && (
            <Legend 
              verticalAlign="bottom"
              height={legendHeight}
              wrapperStyle={{ 
                fontSize: legendFontSize,
                paddingTop: '10px',
                overflow: 'auto',
                maxHeight: `${legendHeight}px`
              }}
              formatter={(value, entry: any) => {
                const porcentaje = entry.payload?.porcentaje ?? 0
                const valor = entry.payload?.value ?? 0
                
                // Acortar nombres largos más en móvil
                let shortName = value
                if (isMobileSize && value.length > 15) {
                  shortName = value.substring(0, 12) + "..."
                } else if (value.length > 20) {
                  shortName = value.substring(0, 20) + "..."
                }
                
                return `${shortName}: ${valor.toFixed(0)}kg (${porcentaje.toFixed(1)}%)`
              }}
              layout="horizontal"
              align="center"
              iconSize={iconSize}
            />
          )}
        </PieChart>
      </div>
    )
  }

  if (tipo === "lineal") {
    const isMobileSize = (esMovil || isMobile);
    const marginTop = isMobileSize ? 40 : 55;
    const marginBottom = isMobileSize ? 80 : 110;
    const marginLeft = isMobileSize ? 40 : 60;
    const marginRight = isMobileSize ? 40 : 60;
    
    return (
      <div style={{ width: chartWidth, height: chartHeight }}>
        <LineChart 
          width={chartWidth}
          height={chartHeight}
          data={datos} 
          margin={{ 
            top: marginTop,
            right: marginRight, 
            left: marginLeft, 
            bottom: marginBottom
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            height={isMobileSize ? 60 : 110}
            tick={<CustomRotatedTick />}
            interval={0}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            scale="point"
            padding={{left:20, right:20}}
          />
          <YAxis 
            fontSize={isMobileSize ? 10 : 12} 
            tick={{ fill: "#4b5563" }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            tickFormatter={(value) => `${value} kg`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColors[0].border}
            strokeWidth={isMobileSize ? 2 : 3}
            dot={(props) => {
              const { cx, cy, payload, index } = props
              const dotColor = lineColors[index % lineColors.length].bg
              const dotRadius = isMobileSize ? 4 : 6;
              const fontSizeValue = isMobileSize ? 8 : 10;
              const fontSizePorcentaje = isMobileSize ? 7 : 9;
              const yOffsetValue = isMobileSize ? -18 : -25;
              const yOffsetPorcentaje = isMobileSize ? -8 : -10;
              
              return (
                <g key={`dot-${payload.name}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={dotRadius}
                    fill={dotColor}
                    stroke="white"
                    strokeWidth={2}
                  />
                  <g>
                    <text
                      x={cx}
                      y={cy + yOffsetValue}
                      textAnchor="middle"
                      fontSize={fontSizeValue}
                      fontWeight="600"
                      fill="#1f2937"
                    >
                      {`${payload.value.toFixed(0)}kg`}
                    </text>
                    <text
                      x={cx}
                      y={cy + yOffsetPorcentaje}
                      textAnchor="middle"
                      fontSize={fontSizePorcentaje}
                      fontWeight="500"
                      fill="#ff0000"
                    >
                      {`${payload.porcentaje.toFixed(1)}%`}
                    </text>
                  </g>
                </g>
              )
            }}
            activeDot={{ 
              r: isMobileSize ? 6 : 8, 
              stroke: "#fff", 
              strokeWidth: 2 
            }}
          />
        </LineChart>
      </div>
    )
  }

  return null
}

export function CaracterizacionReportes() {
  const [caracterizacionData, setCaracterizacionData] = useState<CaracterizacionRecord[]>([])
  const [caracterizacionFiltrada, setCaracterizacionFiltrada] = useState<CaracterizacionRecord[]>([])
  const [lugarCaracterizacion, setLugarCaracterizacion] = useState("todos")
  const [lugaresCaracterizacion, setLugaresCaracterizacion] = useState<string[]>([])
  const [tipoGrafico, setTipoGrafico] = useState<"barras" | "torta" | "lineal">("barras")
  const [tipoTabla, setTipoTabla] = useState<"completa" | "categorias">("categorias")
  const [loading, setLoading] = useState(true)
  const [chartReady, setChartReady] = useState(false)
  
  const [incluirGrafico, setIncluirGrafico] = useState(true)
  const [incluirTabla, setIncluirTabla] = useState(true)
  const [tipoGraficoPDF, setTipoGraficoPDF] = useState<"barras" | "torta" | "lineal">("barras")
  const [tipoTablaPDF, setTipoTablaPDF] = useState<"completa" | "categorias">("categorias")
  const [formatoDescarga, setFormatoDescarga] = useState<"pdf" | "docx">("pdf")
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const chartRef = useRef<HTMLDivElement>(null)
  const tablaRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: caracterizacion, error: errCaracterizacion } = await supabase
        .from("caracterizacion_desechos_daule")
        .select("*")
        .order("fecha_registro", { ascending: false })

      if (errCaracterizacion) throw errCaracterizacion

      const registrosConValores = (caracterizacion || []).map((r) => ({
        ...r,
        materia_organica_jardin_kg: r.materia_organica_jardin_kg || 0,
        materia_organica_cocina_kg: r.materia_organica_cocina_kg || 0,
        grasas_aceite_comestible_kg: r.grasas_aceite_comestible_kg || 0,
        medicina_jarabe_kg: r.medicina_jarabe_kg || 0,
        medicina_tabletas_kg: r.medicina_tabletas_kg || 0,
        papel_blanco_kg: r.papel_blanco_kg || 0,
        papel_periodico_kg: r.papel_periodico_kg || 0,
        papel_archivo_kg: r.papel_archivo_kg || 0,
        carton_kg: r.carton_kg || 0,
        tetra_brik_kg: r.tetra_brik_kg || 0,
        plastico_pet_kg: r.plastico_pet_kg || 0,
        plastico_mixto_kg: r.plastico_mixto_kg || 0,
        bot_aceite_kg: r.bot_aceite_kg || 0,
        bolsas_kg: r.bolsas_kg || 0,
        vidrio_blanco_kg: r.vidrio_blanco_kg || 0,
        vidrio_verde_kg: r.vidrio_verde_kg || 0,
        vidrio_otros_kg: r.vidrio_otros_kg || 0,
        latas_ferrosas_kg: r.latas_ferrosas_kg || 0,
        aluminio_kg: r.aluminio_kg || 0,
        acero_kg: r.acero_kg || 0,
        metal_otros_kg: r.metal_otros_kg || 0,
        textiles_ropa_kg: r.textiles_ropa_kg || 0,
        caucho_zapatos_neumaticos_kg: r.caucho_zapatos_neumaticos_kg || 0,
        cuero_zapatos_neumaticos_kg: r.cuero_zapatos_neumaticos_kg || 0,
        papel_higienico_kg: r.papel_higienico_kg || 0,
        maderas_kg: r.maderas_kg || 0,
        baterias_tel_lamparas_kg: r.baterias_tel_lamparas_kg || 0,
        electronicos_electrodomesticos_kg: r.electronicos_electrodomesticos_kg || 0,
        escombros_otros_kg: r.escombros_otros_kg || 0,
      }))

      setCaracterizacionData(registrosConValores)
      setCaracterizacionFiltrada(registrosConValores)
      
      const lugaresUnicos = Array.from(new Set(registrosConValores.map((r: CaracterizacionRecord) => r.lugar))).filter(Boolean).sort() as string[]
      setLugaresCaracterizacion(lugaresUnicos)
    } catch (err) {
      console.error("Error cargando datos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lugarCaracterizacion === "todos") {
      setCaracterizacionFiltrada(caracterizacionData)
    } else {
      setCaracterizacionFiltrada(caracterizacionData.filter((r) => r.lugar === lugarCaracterizacion))
    }
  }, [lugarCaracterizacion, caracterizacionData])

  const limpiarFiltros = () => {
    setLugarCaracterizacion("todos")
  }

  const datosGrafico = calcularDatosGraficos(caracterizacionFiltrada)
  const { datos: datosTablaCompleta, totalDesechos } = calcularDatosTabla(caracterizacionFiltrada)

  const calcularDatosSubcategorias = () => {
    const subcategorias: Array<{ name: string; value: number; porcentaje: number; categoria: string }> = []
    
    CATEGORIAS_DESECHOS.forEach((categoria) => {
      categoria.subcategorias.forEach((subcategoria) => {
        const total = caracterizacionFiltrada.reduce((sum, registro) => {
          const campo = subcategoria.key as keyof CaracterizacionRecord
          const valor = registro[campo]
          return sum + (typeof valor === 'number' ? valor : 0)
        }, 0)
        
        const porcentaje = totalDesechos > 0 ? (total / totalDesechos) * 100 : 0
        
        subcategorias.push({
          name: subcategoria.label,
          value: Number(total.toFixed(2)),
          porcentaje: Number(porcentaje.toFixed(2)),
          categoria: categoria.nombre
        })
      })
    })
    
    return subcategorias.sort((a, b) => b.value - a.value)
  }

  const datosSubcategorias = calcularDatosSubcategorias()

  const tablasAgrupadas: Array<{
    categoria: string
    subcategorias: Array<{ label: string; peso: number; porcentaje: number }>
    totalCategoria: number
    totalPorcentaje: number
  }> = []

  let indice = 0
  while (indice < datosTablaCompleta.length) {
    const subcatsList: Array<{ label: string; peso: number; porcentaje: number }> = []
    let totalCat = 0
    let totalPct = 0
    let categoriaActual = ""

    while (indice < datosTablaCompleta.length && !datosTablaCompleta[indice].esTotal) {
      if (datosTablaCompleta[indice].subcategoria) {
        subcatsList.push({
          label: datosTablaCompleta[indice].subcategoria!,
          peso: datosTablaCompleta[indice].peso,
          porcentaje: datosTablaCompleta[indice].porcentaje,
        })
      }
      indice++
    }

    if (indice < datosTablaCompleta.length && datosTablaCompleta[indice].esTotal) {
      categoriaActual = datosTablaCompleta[indice].categoria
      totalCat = datosTablaCompleta[indice].peso
      totalPct = datosTablaCompleta[indice].porcentaje
      indice++
    }

    if (subcatsList.length > 0) {
      tablasAgrupadas.push({
        categoria: categoriaActual,
        subcategorias: subcatsList,
        totalCategoria: totalCat,
        totalPorcentaje: totalPct,
      })
    }
  }

  // FUNCIONES DE EXPORTACIÓN (se mantienen igual que en PC)
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

  const getDatosDBConNombresCorrectos = () => {
    return caracterizacionFiltrada.map(registro => {
      const registroConNombres: Record<string, any> = {}
      Object.entries(registro).forEach(([key, value]) => {
        const nombreCorrecto = NOMBRES_CAMPOS_DB[key] || key
        registroConNombres[nombreCorrecto] = value
      })
      return registroConNombres
    })
  }

  // MEJORADA: Descargar gráfico con dimensiones fijas (819x520 en PC, 350x400 en móvil)
  const descargarGrafico = async (formato: 'png' | 'jpeg' | 'svg') => {
    if (!chartRef.current) {
      console.error('No se encontró el contenedor del gráfico')
      alert('No se puede descargar el gráfico. Intenta recargar la página.')
      return
    }

    try {
      const chartWidth = isMobile ? 350 : 819
      const chartHeight = isMobile ? 400 : 520
      
      // Obtener el contenedor específico del gráfico
      const chartContainer = chartRef.current.querySelector('div[style*="width:"]') as HTMLElement
      if (!chartContainer) {
        console.error('No se encontró el contenedor del gráfico con dimensiones fijas')
        return
      }

      // Asegurarnos de que el contenedor tenga dimensiones correctas
      chartContainer.style.width = `${chartWidth}px`
      chartContainer.style.height = `${chartHeight}px`
      chartContainer.style.display = 'block'
      chartContainer.style.position = 'relative'
      chartContainer.style.backgroundColor = '#ffffff'

      let backgroundColor: string | null = null
    let chartBackgroundColor = '#ffffff' // Color de fondo del contenedor del gráfico
    
    if (formato === 'png') {
      backgroundColor = null // Transparente para PNG
      chartContainer.style.backgroundColor = 'transparent'
    } else if (formato === 'jpeg') {
      backgroundColor = '#ffffff' // Blanco para JPEG
      chartContainer.style.backgroundColor = '#ffffff'
    }

      let dataUrl: string
    const options = {
      backgroundColor: backgroundColor,
      width: chartWidth,
      height: chartHeight,
      pixelRatio: 2, // Buena calidad
      quality: 0.95,
      cacheBust: true,
      style: {
        width: `${chartWidth}px`,
        height: `${chartHeight}px`,
        display: 'block',
        position: 'relative',
        backgroundColor: formato === 'png' ? 'transparent' : '#ffffff'
      }
    }

    switch (formato) {
      case 'png':
        dataUrl = await toPng(chartContainer, options)
        break
      case 'jpeg':
        dataUrl = await toJpeg(chartContainer, options)
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
          link.download = `grafico_caracterizacion_${tipoGrafico}_${new Date().toISOString().slice(0, 10)}.svg`
          link.href = URL.createObjectURL(blob)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Limpiar
          setTimeout(() => URL.revokeObjectURL(link.href), 1000)
          return
        default:
          dataUrl = await toPng(chartContainer, options)
      }
      
      const link = document.createElement('a')
      link.download = `grafico_caracterizacion_${tipoGrafico}_${new Date().toISOString().slice(0, 10)}.${formato}`
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
    
    if (tipoTabla === "categorias") {
      datosGrafico.forEach(item => {
        resultado.push({
          Categoría: item.name,
          "Peso (kg)": item.value.toFixed(2),
          "Porcentaje (%)": item.porcentaje.toFixed(2)
        })
      })
      resultado.push({
        Categoría: "TOTAL GENERAL",
        "Peso (kg)": totalDesechos.toFixed(2),
        "Porcentaje (%)": "100.00"
      })
    } else {
      tablasAgrupadas.forEach(grupo => {
        grupo.subcategorias.forEach(sub => {
          resultado.push({
            Categoría: grupo.categoria,
            Subcategoría: sub.label,
            "Peso (kg)": sub.peso.toFixed(2),
            "Porcentaje (%)": sub.porcentaje.toFixed(2)
          })
        })
        resultado.push({
          Categoría: `Total ${grupo.categoria}`,
          Subcategoría: "",
          "Peso (kg)": grupo.totalCategoria.toFixed(2),
          "Porcentaje (%)": grupo.totalPorcentaje.toFixed(2)
        })
      })
      resultado.push({
        Categoría: "TOTAL GENERAL",
        Subcategoría: "",
        "Peso (kg)": totalDesechos.toFixed(2),
        "Porcentaje (%)": "100.00"
      })
    }
    
    return resultado
  }

  // FUNCIONES PARA PDF/DOCX (se mantienen igual que en PC)
  const getDatosTablaParaDocumento = (tipo: "completa" | "categorias") => {
    if (tipo === "completa") {
      return {
        headers: ["Categoría", "Subcategoría", "Peso (kg)", "Porcentaje (%)"],
        data: tablasAgrupadas.flatMap(grupo => [
          ...grupo.subcategorias.map((sub, idx) => [
            idx === 0 ? grupo.categoria : "",
            sub.label,
            sub.peso.toFixed(2) + " kg",
            sub.porcentaje.toFixed(2) + "%"
          ]),
          [`Total ${grupo.categoria}`, "", grupo.totalCategoria.toFixed(2) + " kg", grupo.totalPorcentaje.toFixed(2) + "%"]
        ]).concat([["TOTAL GENERAL", "", totalDesechos.toFixed(2) + " kg", "100%"]])
      }
    } else {
      return {
        headers: ["Categoría", "Peso (kg)", "Porcentaje (%)"],
        data: datosGrafico.map(item => [
          item.name,
          item.value.toFixed(2) + " kg",
          item.porcentaje.toFixed(2) + "%"
        ]).concat([
          ["SUMA TOTAL", totalDesechos.toFixed(2) + " kg", "100.00"]
        ])
      }
    }
  }

  // Función optimizada para crear imágenes nítidas para Word (se mantiene igual)
  const crearImagenNitidaParaWord = async (dataUrl: string): Promise<string> => {
    try {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const targetWidth = 6 * 150
          const targetHeight = 4 * 150
          
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
            let sourceWidth = img.width
            let sourceHeight = img.height
            let drawX = 0
            let drawY = 0
            let drawWidth = targetWidth
            let drawHeight = targetHeight
            
            const imgAspect = sourceWidth / sourceHeight
            const targetAspect = targetWidth / targetHeight
            
            if (imgAspect > targetAspect) {
              drawHeight = targetWidth / imgAspect
              drawY = (targetHeight - drawHeight) / 2
            } else {
              drawWidth = targetHeight * imgAspect
              drawX = (targetWidth - drawWidth) / 2
            }
            
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, targetWidth, targetHeight)
            
            ctx.drawImage(
              img, 
              0, 0, sourceWidth, sourceHeight,
              drawX, drawY, drawWidth, drawHeight
            )
            
            if (tipoGraficoPDF === "torta") {
              const tempCanvas = document.createElement('canvas')
              tempCanvas.width = targetWidth
              tempCanvas.height = targetHeight
              const tempCtx = tempCanvas.getContext('2d')
              
              if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0)
                ctx.clearRect(0, 0, targetWidth, targetHeight)
                
                ctx.filter = 'blur(0.5px)'
                ctx.drawImage(tempCanvas, 0, 0)
                ctx.filter = 'none'
              }
            }
            
            const optimizedDataUrl = canvas.toDataURL('image/png', 1.0)
            
            if (optimizedDataUrl.length > 2000000) {
              const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95)
              if (jpegDataUrl.length < optimizedDataUrl.length) {
                resolve(jpegDataUrl)
                return
              }
            }
            
            resolve(optimizedDataUrl)
          } else {
            resolve(dataUrl)
          }
        }
        img.onerror = () => resolve(dataUrl)
        img.src = dataUrl
      })
    } catch (error) {
      console.error('Error optimizando imagen:', error)
      return dataUrl
    }
  }

  // Función para capturar gráfico con alta calidad específica para Word (se mantiene igual)
  const capturarGraficoParaWord = async (tipoGraficoCapturar: "barras" | "torta" | "lineal", datosGraficoCapturar: any[]) => {
    try {
      const tempDiv = document.createElement('div')
      tempDiv.style.width = '900px'
      tempDiv.style.height = '600px'
      tempDiv.style.position = 'fixed'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.backgroundColor = '#ffffff'
      tempDiv.style.zIndex = '9999'
      document.body.appendChild(tempDiv)
      
      const ReactDOM = await import('react-dom/client')
      const React = await import('react')
      
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
          datos: datosGraficoCapturar,
          tipo: tipoGraficoCapturar,
          tituloX: "Categorías",
          tituloY: "Peso (kg)",
          colors: tipoGraficoCapturar === "torta" ? COLORS_TORTA : tipoGraficoCapturar === "lineal" ? COLORS_LINEAL : COLORS_BARRAS,
          esMovil: false,
          isLandscape: false,
          showLabelsOnPie: true,
          exportMode: true
        })))
      }
      
      const root = ReactDOM.createRoot(tempDiv)
      root.render(React.createElement(GraficoTemporalWord))
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const chartDataUrl = await toPng(tempDiv.firstChild as HTMLElement, {
        backgroundColor: null,
        width: 900,
        height: 600,
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true,
        style: {
          width: '900px',
          height: '600px',
          backgroundColor: 'transparent',
          display: 'block'
        }
      })
      
      root.unmount()
      document.body.removeChild(tempDiv)
      
      return chartDataUrl
    } catch (error) {
      console.error('Error capturando gráfico para Word:', error)
      return null
    }
  }

  // FUNCIÓN GENERAR WORD CON FORMATO APA 7 MEJORADO (se mantiene igual)
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
            -ms-interpolation-mode: bicubic;
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
          <h1>Reporte de Caracterización de Desechos Sólidos Domiciliarios</h1>
          
          <div class="header-info">
            <p><strong>Fecha de generación:</strong> ${fecha}</p>
            <p><strong>Ubicación:</strong> ${lugarCaracterizacion === "todos" ? "Todas las ubicaciones" : lugarCaracterizacion}</p>
            <p><strong>Total de registros analizados:</strong> ${caracterizacionFiltrada.length}</p>
            <p><strong>Total de desechos caracterizados:</strong> ${totalDesechos.toFixed(2)} kg</p>
          </div>
    `

    if (incluirGrafico) {
      try {
        const chartDataUrl = await capturarGraficoParaWord(tipoGraficoPDF, datosGrafico)
        
        if (chartDataUrl) {
          const optimizedImageUrl = await crearImagenNitidaParaWord(chartDataUrl)
          
          html += `
            <div class="figure-container keep-together">
              <div class="figure-caption">Figura 1</div>
              <p><em>Distribución de desechos sólidos por categoría principal</em></p>
              <img src="${optimizedImageUrl}" alt="Figura 1: Distribución de desechos sólidos" class="figure-image">
              <div class="figure-note">
                <p><em>Nota.</em> El gráfico muestra la distribución porcentual de desechos sólidos domiciliarios 
                organizados por ${tipoGraficoPDF === "torta" ? "gráfico circular" : tipoGraficoPDF === "lineal" ? "gráfico de líneas" : "gráfico de barras"}. 
                Los valores representan pesos en kilogramos y porcentajes relativos al total.</p>
              </div>
            </div>
          `
        } else {
          html += `
            <div class="figure-container">
              <div class="figure-caption">Figura 1</div>
              <p><em>Distribución de desechos sólidos por categoría principal</em></p>
              <p><strong>Nota:</strong> La imagen del gráfico no pudo generarse.</p>
            </div>
          `
        }
      } catch (error) {
        console.error('Error al generar imagen para Word:', error)
        html += `
          <div class="figure-container">
            <div class="figure-caption">Figura 1</div>
            <p><em>Distribución de desechos sólidos por categoría principal</em></p>
            <p><strong>Nota:</strong> Error al generar la imagen del gráfico.</p>
          </div>
        `
      }
    }

    if (incluirTabla) {
      const { headers, data } = getDatosTablaParaDocumento(tipoTablaPDF)
      
      html += `
        <div class="page-break"></div>
        <div class="section">
          <h2>${tipoTablaPDF === 'completa' ? 'Distribución Detallada por Subcategorías' : 'Distribución Resumida por Categorías'}</h2>
          
          <div class="table-container keep-together">
            <div class="table-caption">Tabla 1</div>
            <p><em>${tipoTablaPDF === 'completa' ? 'Distribución detallada de desechos por subcategorías' : 'Distribución resumida de desechos por categorías principales'}</em></p>
            <table>
              <thead>
                <tr>
      `
      
      headers.forEach(header => {
        html += `<th>${header}</th>`
      })
      
      html += `
                </tr>
              </thead>
              <tbody>
      `
      
      data.forEach((row: any[], rowIndex: number) => {
        const isTotalRow = row[0]?.includes("TOTAL") || row[0]?.includes("SUMA")
        const isSubtotalRow = row[0]?.includes("Total ")
        
        html += `<tr class="${isTotalRow ? 'summary-row' : isSubtotalRow ? 'pregunta-header' : ''}">`
        
        row.forEach((cell, cellIndex) => {
          if (cellIndex === 0 && isSubtotalRow) {
            html += `<td colspan="${headers.length}"><strong>${cell}</strong></td>`
          } else {
            html += `<td>${cell}</td>`
          }
        })
        
        html += `</tr>`
      })
      
      html += `
              </tbody>
            </table>
            <div class="table-note">
              <p><em>Nota.</em> Los valores se presentan en kilogramos (kg) con sus respectivos porcentajes relativos al total. 
              Los porcentajes se calculan en base al total de desechos caracterizados (${totalDesechos.toFixed(2)} kg).</p>
            </div>
          </div>
        </div>
      `
    }

    if (lugaresCaracterizacion.length > 1 && lugarCaracterizacion === "todos") {
      const ubicacionesResumen = lugaresCaracterizacion.map(lugar => {
        const datosLugar = caracterizacionData.filter(r => r.lugar === lugar)
        const totalLugar = datosLugar.reduce((sum, registro) => {
          return sum + CATEGORIAS_DESECHOS.reduce((catSum, categoria) => {
            return catSum + categoria.subcategorias.reduce((subSum, subcat) => {
              const campo = subcat.key as keyof CaracterizacionRecord
              return subSum + (registro[campo] || 0)
            }, 0)
          }, 0)
        }, 0)
        
        const porcentaje = totalDesechos > 0 ? (totalLugar / totalDesechos) * 100 : 0
        
        return {
          lugar,
          registros: datosLugar.length,
          total: totalLugar,
          porcentaje: porcentaje
        }
      })
      
      html += `
        <div class="page-break"></div>
        <div class="section">
          <h2>Resumen por Ubicaciones</h2>
          
          <div class="table-container keep-together">
            <div class="table-caption">Tabla 2</div>
            <p><em>Distribución de desechos por ubicación</em></p>
            <table>
              <thead>
                <tr>
                  <th style="width: 40%;">Ubicación</th>
                  <th style="width: 20%; text-align: center;">Registros</th>
                  <th style="width: 20%; text-align: center;">Peso Total (kg)</th>
                  <th style="width: 20%; text-align: center;">Porcentaje (%)</th>
                </tr>
              </thead>
              <tbody>
      `
      
      ubicacionesResumen.forEach((ubicacion, index) => {
        html += `
          <tr>
            <td>${ubicacion.lugar}</td>
            <td style="text-align: center;">${ubicacion.registros}</td>
            <td style="text-align: center;">${ubicacion.total.toFixed(2)}kg</td>
            <td style="text-align: center;">${ubicacion.porcentaje.toFixed(2)}%</td>
          </tr>
        `
      })
      
      html += `
                <tr class="summary-row">
                  <td><strong>TOTAL</strong></td>
                  <td style="text-align: center;"><strong>${caracterizacionFiltrada.length}</strong></td>
                  <td style="text-align: center;"><strong>${totalDesechos.toFixed(2)} kg</strong></td>
                  <td style="text-align: center;"><strong>100%</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="table-note">
              <p><em>Nota.</em> Distribución de desechos sólidos domiciliarios por ubicación de muestreo.</p>
            </div>
          </div>
        </div>
      `
    }

    html += `
          <div class="note">
            <p><em>Nota.</em> Este reporte fue generado automáticamente a partir de los datos recopilados en el estudio de 
            caracterización de desechos sólidos domiciliarios. Los datos presentados representan muestras recolectadas 
            y caracterizadas durante el período de estudio.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([html], { 
      type: 'application/msword;charset=utf-8' 
    })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.href = url
    link.download = `Reporte_Caracterizacion_Desechos_${new Date().toISOString().slice(0, 10)}.doc`
    
    document.body.appendChild(link)
    link.click()
    
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  // FUNCIÓN GENERAR PDF (se mantiene igual que en PC)
  const generarPDF = async () => {
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    const fechaCorta = new Date().toISOString().slice(0, 10)
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const marginLeft = 15
    const marginTop = 15
    const lineHeight = 6
    let currentY = marginTop

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    const titulo = 'Reporte de Caracterización de Desechos Sólidos Domiciliarios'
    const tituloWidth = pdf.getTextWidth(titulo)
    pdf.text(titulo, (pageWidth - tituloWidth) / 2, currentY)
    currentY += lineHeight * 1.5

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    
    pdf.text(`Fecha de generación: ${fecha}`, marginLeft, currentY)
    currentY += lineHeight
    pdf.text(`Ubicación: ${lugarCaracterizacion === "todos" ? "Todas las ubicaciones" : lugarCaracterizacion}`, marginLeft, currentY)
    currentY += lineHeight
    pdf.text(`Total de registros: ${caracterizacionFiltrada.length}`, marginLeft, currentY)
    currentY += lineHeight
    pdf.text(`Total de desechos: ${totalDesechos.toFixed(2)} kg`, marginLeft, currentY)
    currentY += lineHeight * 1.5

    if (incluirGrafico && chartRef.current) {
      try {
        const tipoGraficoOriginal = tipoGrafico
        if (tipoGrafico !== tipoGraficoPDF) {
          setTipoGrafico(tipoGraficoPDF)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

        const chartContainer = chartRef.current.querySelector('div[style*="width:"]') as HTMLElement
        if (chartContainer) {
          if (tipoGraficoPDF === 'torta') {
            await new Promise(resolve => setTimeout(resolve, 1500))
          }
          
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(12)
          pdf.text('1. Distribución de Desechos Sólidos por Categoría', marginLeft, currentY)
          currentY += lineHeight * 1.5

          const chartDataUrl = await toPng(chartContainer, {
            backgroundColor: '#ffffff',
            width: isMobile ? 350 : 819,
            height: isMobile ? 400 : 520,
            pixelRatio: 3,
            quality: 1.0,
            cacheBust: true,
            style: {
              width: `${isMobile ? 350 : 819}px`,
              height: `${isMobile ? 400 : 520}px`,
              backgroundColor: '#ffffff',
              display: 'block',
              position: 'relative'
            }
          })
          
          const maxImgWidth = 180
          const maxImgHeight = 120
          const imgAspectRatio = (isMobile ? 350 : 819) / (isMobile ? 400 : 520)
          
          let imgWidth = maxImgWidth
          let imgHeight = maxImgWidth / imgAspectRatio
          
          if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight
            imgWidth = maxImgHeight * imgAspectRatio
          }
          
          const imgX = (pageWidth - imgWidth) / 2
          
          if (currentY + imgHeight > pageHeight - 30) {
            pdf.addPage()
            currentY = marginTop
          }
          
          pdf.addImage(chartDataUrl, 'PNG', imgX, currentY, imgWidth, imgHeight)
          currentY += imgHeight + lineHeight
          
          pdf.setFont('helvetica', 'italic')
          pdf.setFontSize(9)
          const notaFigura = `Figura 1. Distribución porcentual de desechos sólidos por categoría principal. Gráfico de ${tipoGraficoPDF === "torta" ? "torta" : tipoGraficoPDF === "lineal" ? "líneas" : "barras"}.`
          const notaLines = pdf.splitTextToSize(notaFigura, pageWidth - marginLeft * 2)
          pdf.text(notaLines, marginLeft, currentY)
          currentY += (notaLines.length * lineHeight) + lineHeight * 1.5
        }

        if (tipoGrafico !== tipoGraficoOriginal) {
          setTipoGrafico(tipoGraficoOriginal)
        }
      } catch (error) {
        console.error('Error al agregar gráfico al PDF:', error)
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(9)
        pdf.text('Nota: El gráfico no pudo ser incluido en este documento.', marginLeft, currentY)
        currentY += lineHeight * 1.5
      }
    }

    if (incluirTabla) {
      if (currentY > pageHeight - 80) {
        pdf.addPage()
        currentY = marginTop
      }

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      const tipoTablaTexto = tipoTablaPDF === 'completa' 
        ? '2. Distribución Detallada por Subcategorías' 
        : '2. Distribución Resumida por Categorías'
      pdf.text(tipoTablaTexto, marginLeft, currentY)
      currentY += lineHeight * 1.5

      const { headers, data } = getDatosTablaParaDocumento(tipoTablaPDF)
      
      const tableColumnStyles = headers.length === 4
        ? { 
            0: { cellWidth: 40, fontStyle: 'bold' }, 
            1: { cellWidth: 60 }, 
            2: { cellWidth: 25, halign: 'right' }, 
            3: { cellWidth: 25, halign: 'right' } 
          }
        : { 
            0: { cellWidth: 80 }, 
            1: { cellWidth: 35, halign: 'right' }, 
            2: { cellWidth: 35, halign: 'right' } 
          }

      autoTable(pdf, {
        startY: currentY,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246],
          fontSize: 9,
          fontStyle: 'bold',
          textColor: [255, 255, 255],
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: tableColumnStyles,
        margin: { left: marginLeft, right: marginLeft },
        styles: { overflow: 'linebreak' },
        didParseCell: function(data) {
          if (data.cell.raw && typeof data.cell.raw === 'string') {
            if (data.cell.raw.includes('TOTAL') || data.cell.raw.includes('SUMA')) {
              data.cell.styles.fillColor = [230, 230, 230]
              data.cell.styles.fontStyle = 'bold'
            } else if (data.cell.raw.includes('Total ')) {
              data.cell.styles.fillColor = [245, 245, 245]
              data.cell.styles.fontStyle = 'bold'
            }
          }
        },
        willDrawPage: function(data) {
          pdf.setFontSize(8)
          pdf.setTextColor(128, 128, 128)
          pdf.text(
            `Página ${data.pageNumber} de ${data.pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )
        }
      })

      const finalY = (pdf as any).lastAutoTable.finalY || currentY
      currentY = finalY + lineHeight

      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(9)
      const notaTabla = `Tabla 1. ${tipoTablaPDF === 'completa' ? 'Distribución detallada de desechos por subcategorías' : 'Distribución resumida de desechos por categorías principales'}. Los valores se presentan en kilogramos (kg) con porcentajes relativos al total (${totalDesechos.toFixed(2)} kg).`
      const notaTablaLines = pdf.splitTextToSize(notaTabla, pageWidth - marginLeft * 2)
      pdf.text(notaTablaLines, marginLeft, currentY)
      currentY += (notaTablaLines.length * lineHeight) + lineHeight * 1.5
    }

    if (lugaresCaracterizacion.length > 1 && lugarCaracterizacion === "todos") {
      if (currentY > pageHeight - 80) {
        pdf.addPage()
        currentY = marginTop
      }

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('3. Resumen por Ubicaciones', marginLeft, currentY)
      currentY += lineHeight * 1.5

      const ubicacionesResumen = lugaresCaracterizacion.map(lugar => {
        const datosLugar = caracterizacionData.filter(r => r.lugar === lugar)
        const totalLugar = datosLugar.reduce((sum, registro) => {
          return sum + CATEGORIAS_DESECHOS.reduce((catSum, categoria) => {
            return catSum + categoria.subcategorias.reduce((subSum, subcat) => {
              const campo = subcat.key as keyof CaracterizacionRecord
              return subSum + (registro[campo] || 0)
            }, 0)
          }, 0)
        }, 0)
        
        const porcentaje = totalDesechos > 0 ? (totalLugar / totalDesechos) * 100 : 0
        
        return {
          lugar,
          registros: datosLugar.length,
          total: totalLugar,
          porcentaje: porcentaje
        }
      })

      const ubicacionHeaders = ["Ubicación", "Registros", "Peso Total (kg)", "Porcentaje (%)"]
      const ubicacionData = ubicacionesResumen.map(ubicacion => [
        ubicacion.lugar,
        ubicacion.registros.toString(),
        ubicacion.total.toFixed(2) + " kg",
        ubicacion.porcentaje.toFixed(2) + '%'
      ]).concat([
        ["TOTAL", caracterizacionFiltrada.length.toString(), totalDesechos.toFixed(2) + " kg", "100%"]
      ])

      autoTable(pdf, {
        startY: currentY,
        head: [ubicacionHeaders],
        body: ubicacionData,
        theme: 'grid',
        headStyles: { 
          fillColor: [75, 192, 192],
          fontSize: 9,
          fontStyle: 'bold',
          textColor: [255, 255, 255],
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: { 
          0: { cellWidth: 70 }, 
          1: { cellWidth: 30, halign: 'center' }, 
          2: { cellWidth: 40, halign: 'right' }, 
          3: { cellWidth: 40, halign: 'right' } 
        },
        margin: { left: marginLeft, right: marginLeft },
        didParseCell: function(data) {
          if (data.row.index === ubicacionData.length - 1) {
            data.cell.styles.fillColor = [230, 230, 230]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      })

      const finalYUbicacion = (pdf as any).lastAutoTable.finalY || currentY
      currentY = finalYUbicacion + lineHeight

      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(9)
      const notaUbicacion = `Tabla 2. Distribución de desechos sólidos domiciliarios por ubicación de muestreo.`
      pdf.text(notaUbicacion, marginLeft, currentY)
      currentY += lineHeight * 1.5
    }

    if (currentY > pageHeight - 40) {
      pdf.addPage()
      currentY = marginTop
    }

    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(9)
    pdf.text('Nota final:', marginLeft, currentY)
    currentY += lineHeight
    
    const notaFinal = `Este reporte fue generado automáticamente a partir de los datos recopilados en el estudio de 
    caracterización de desechos sólidos domiciliarios. Los datos presentados representan muestras recolectadas 
    y caracterizadas durante el período de estudio. Todos los valores están expresados en kilogramos (kg).`
    
    const notaFinalLines = pdf.splitTextToSize(notaFinal, pageWidth - marginLeft * 2)
    pdf.text(notaFinalLines, marginLeft, currentY)
    currentY += (notaFinalLines.length * lineHeight) + lineHeight

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(
      `Documento generado el ${fecha}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    pdf.save(`Reporte_Caracterizacion_Desechos_${fechaCorta}.pdf`)
  }

  const generarDocumento = async () => {
    if (formatoDescarga === 'pdf') {
      await generarPDF()
    } else {
      await generarWord()
    }

    setDialogOpen(false)
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
      {/* CSS Responsive inline para componentes específicos */}
      <style jsx>{`
        /* Estilos responsivos específicos */
        @media (max-width: 768px) {
          .responsive-container {
            padding: 0.5rem;
          }
          
          .responsive-card {
            margin-bottom: 1rem;
          }
          
          .responsive-table-container {
            overflow-x: auto;
            max-width: 100%;
          }
          
          .responsive-table {
            font-size: 0.875rem;
          }
          
          .responsive-table th,
          .responsive-table td {
            padding: 0.5rem;
          }
          
          .responsive-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .responsive-buttons button {
            width: 100%;
          }
          
          .responsive-flex {
            flex-direction: column;
          }
          
          .responsive-text {
            font-size: 0.875rem;
          }
          
          .responsive-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 640px) {
          .responsive-heading {
            font-size: 1.125rem;
          }
          
          .responsive-subheading {
            font-size: 0.875rem;
          }
          
          .responsive-small-text {
            font-size: 0.75rem;
          }
        }
        
        /* Estilos para modal en móvil */
        @media (max-width: 768px) {
          .responsive-dialog {
            width: 95vw;
            max-width: 95vw;
            margin: 1rem auto;
          }
          
          .responsive-dialog-content {
            max-height: 80vh;
            overflow-y: auto;
          }
        }
      `}</style>

      {/* Filtros - Responsive */}
      <Card className="responsive-card">
        <CardHeader className="pb-3 responsive-container">
          <div className="flex items-center justify-between responsive-flex">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg responsive-heading">Filtros</CardTitle>
            </div>
            {lugarCaracterizacion !== "todos" && (
              <Button onClick={limpiarFiltros} variant="ghost" size="sm" className="text-destructive mt-2 sm:mt-0">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="responsive-container">
          <div className="space-y-2">
            <Label className="responsive-text">Ubicación</Label>
            <Select value={lugarCaracterizacion} onValueChange={setLugarCaracterizacion}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="todos">Todas las ubicaciones</SelectItem>
                {lugaresCaracterizacion.map((lugar) => (
                  <SelectItem key={lugar} value={lugar} className="focus:bg-accent focus:text-accent-foreground">
                    {lugar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-3 text-sm text-muted-foreground responsive-small-text">
            Mostrando {caracterizacionFiltrada.length} de {caracterizacionData.length} registros. 
            Total de desechos: <span className="font-semibold">{totalDesechos.toFixed(2)} kg</span>
          </p>
        </CardContent>
      </Card>

      {/* Previsualización del Gráfico - Responsive */}
      <Card className="responsive-card">
        <CardHeader className="responsive-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg responsive-heading">Previsualización del Gráfico</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 responsive-buttons">
              <Button
                onClick={() => setTipoGrafico("barras")}
                variant={tipoGrafico === "barras" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Barras</span>
                <span className="sm:hidden">Bar</span>
              </Button>
              <Button
                onClick={() => setTipoGrafico("torta")}
                variant={tipoGrafico === "torta" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <PieChartIcon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Circular</span>
                <span className="sm:hidden">Circ</span>
              </Button>
              <Button
                onClick={() => setTipoGrafico("lineal")}
                variant={tipoGrafico === "lineal" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Línea</span>
                <span className="sm:hidden">Line</span>
              </Button>
            </div>
          </div>
          <CardDescription className="responsive-subheading">
            Distribución de desechos por categoría principal ({datosGrafico.length} categorías)
          </CardDescription>
        </CardHeader>
        <CardContent className="responsive-container">
          <div className="border border-gray-200 rounded-lg p-2 sm:p-4 bg-white shadow-sm overflow-x-auto">
            <div ref={chartRef} className="flex justify-center">
              <GraficoReusable 
                datos={datosGrafico} 
                tipo={tipoGrafico} 
                onRenderComplete={() => setChartReady(true)}
                esMovil={isMobile}
              />
            </div>
          </div>

          {/* Botones de descarga de gráfico MEJORADOS - Responsive */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground mr-2 self-center responsive-small-text">Descargar gráfico:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <Button onClick={() => descargarGrafico('png')} variant="outline" size="sm" className="w-full">
                <FileImage className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">PNG</span>
                <span className="sm:hidden">PNG</span>
              </Button>
              <Button onClick={() => descargarGrafico('jpeg')} variant="outline" size="sm" className="w-full">
                <FileImage className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">JPEG</span>
                <span className="sm:hidden">JPG</span>
              </Button>
              <Button onClick={() => descargarGrafico('svg')} variant="outline" size="sm" className="w-full">
                <FileImage className="w-4 h-4 mr-2" />
                SVG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previsualización de Tabla - Responsive */}
      <Card className="responsive-card">
        <CardHeader className="responsive-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg responsive-heading">Previsualización de Tabla</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 responsive-buttons">
              <Button
                onClick={() => setTipoTabla("categorias")}
                variant={tipoTabla === "categorias" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">15 Categorías</span>
                <span className="sm:hidden">15 Cat</span>
              </Button>
              <Button
                onClick={() => setTipoTabla("completa")}
                variant={tipoTabla === "completa" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">29 Subcategorías</span>
                <span className="sm:hidden">29 Sub</span>
              </Button>
            </div>
          </div>
          <CardDescription className="responsive-subheading">
            {tipoTabla === "categorias" 
              ? "Tabla resumida con las 15 categorías principales" 
              : "Tabla completa con las 29 subcategorías"}
          </CardDescription>
        </CardHeader>
        <CardContent className="responsive-container">
          <div ref={tablaRef} className="overflow-x-auto max-h-96 overflow-y-auto responsive-table-container">
            {tipoTabla === "categorias" ? (
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="responsive-text">Categoría</TableHead>
                    <TableHead className="text-right responsive-text">Peso (kg)</TableHead>
                    <TableHead className="text-right responsive-text">Porcentaje (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosGrafico.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium responsive-text">{item.name}</TableCell>
                      <TableCell className="text-right responsive-text">{item.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right responsive-text">{item.porcentaje.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell className="responsive-text">SUMA TOTAL</TableCell>
                    <TableCell className="text-right responsive-text">{totalDesechos.toFixed(2)}</TableCell>
                    <TableCell className="text-right responsive-text">100.00%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="responsive-text">Categoría / Subcategoría</TableHead>
                    <TableHead className="text-right responsive-text">Peso (kg)</TableHead>
                    <TableHead className="text-right responsive-text">Porcentaje (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tablasAgrupadas.map((grupo, idx) => (
                    <React.Fragment key={`cat-${idx}`}>
                      <TableRow className="bg-primary/5">
                        <TableCell className="font-bold responsive-text">{grupo.categoria}</TableCell>
                        <TableCell className="text-right"></TableCell>
                        <TableCell className="text-right"></TableCell>
                      </TableRow>
                      {grupo.subcategorias.map((sub, subIdx) => (
                        <TableRow key={`sub-${idx}-${subIdx}`}>
                          <TableCell className="pl-4 sm:pl-8 text-muted-foreground responsive-text">{sub.label}</TableCell>
                          <TableCell className="text-right responsive-text">{sub.peso.toFixed(2)}</TableCell>
                          <TableCell className="text-right responsive-text">{sub.porcentaje.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-accent/10 font-semibold">
                        <TableCell className="responsive-text">Total {grupo.categoria}</TableCell>
                        <TableCell className="text-right responsive-text">{grupo.totalCategoria.toFixed(2)}</TableCell>
                        <TableCell className="text-right responsive-text">{grupo.totalPorcentaje.toFixed(2)}%</TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell className="responsive-text">TOTAL GENERAL</TableCell>
                    <TableCell className="text-right responsive-text">{totalDesechos.toFixed(2)}</TableCell>
                    <TableCell className="text-right responsive-text">100.00%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Descargas - Responsive */}
      <Card className="responsive-card">
        <CardHeader className="responsive-container">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg responsive-heading">Descargar Datos</CardTitle>
          </div>
          <CardDescription className="responsive-subheading">
            Exporta los datos en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 responsive-container">
          {/* Descargar datos de tabla */}
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2 responsive-text">
              <FileSpreadsheet className="w-4 h-4" />
              Datos de la tabla filtrada
            </h4>
            <p className="text-sm text-muted-foreground responsive-small-text">
              Exporta los datos de {tipoTabla === "categorias" ? "15 categorías" : "29 subcategorías"} según la previsualización actual
            </p>
            <div className="flex flex-wrap gap-2 responsive-buttons">
              <Button 
                onClick={() => exportarCSV(
                  getDatosTablaSeccion(),
                  `tabla_${tipoTabla}`
                )} 
                variant="outline" 
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                onClick={() => exportarExcel(
                  getDatosTablaSeccion(),
                  `tabla_${tipoTabla}`
                )} 
                variant="outline" 
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">XLSX</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button 
                onClick={() => exportarJSON(
                  getDatosTablaSeccion(),
                  `tabla_${tipoTabla}`
                )} 
                variant="outline" 
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* Descargar datos completos de la BD */}
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2 responsive-text">
              <FileSpreadsheet className="w-4 h-4" />
              Datos completos de la base de datos
            </h4>
            <p className="text-sm text-muted-foreground responsive-small-text">
              Exporta todos los registros filtrados ({caracterizacionFiltrada.length}) con nombres de campos correctos
            </p>
            <div className="flex flex-wrap gap-2 responsive-buttons">
              <Button onClick={() => exportarCSV(getDatosDBConNombresCorrectos(), "bd_caracterizacion")} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportarExcel(getDatosDBConNombresCorrectos(), "bd_caracterizacion")} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">XLSX</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button onClick={() => exportarJSON(getDatosDBConNombresCorrectos(), "bd_caracterizacion")} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* Descargar PDF/Word */}
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2 responsive-text">
              <FileText className="w-4 h-4" />
              Reporte completo (PDF / Word)
            </h4>
            <p className="text-sm text-muted-foreground responsive-small-text">
              Genera un reporte incluyendo gráfico y tabla
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="w-full sm:w-auto">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Configurar y Descargar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md responsive-dialog">
                <DialogHeader>
                  <DialogTitle className="responsive-heading">Configurar Reporte</DialogTitle>
                  <DialogDescription className="responsive-subheading">
                    Selecciona qué elementos incluir en el reporte
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 responsive-dialog-content">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="incluirGrafico" 
                      checked={incluirGrafico} 
                      onCheckedChange={(checked) => setIncluirGrafico(checked as boolean)}
                    />
                    <Label htmlFor="incluirGrafico" className="responsive-text">Incluir gráfico</Label>
                  </div>
                  {incluirGrafico && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm text-muted-foreground responsive-small-text">Tipo de gráfico:</Label>
                      <Select value={tipoGraficoPDF} onValueChange={(v: "barras" | "torta" | "lineal") => setTipoGraficoPDF(v)}>
                        <SelectTrigger className="bg-background border-input responsive-text">
                          <SelectValue placeholder="Seleccionar tipo de gráfico" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="barras" className="focus:bg-accent focus:text-accent-foreground responsive-text">Gráfico de Barras</SelectItem>
                          <SelectItem value="torta" className="focus:bg-accent focus:text-accent-foreground responsive-text">Gráfico Circular</SelectItem>
                          <SelectItem value="lineal" className="focus:bg-accent focus:text-accent-foreground responsive-text">Gráfico de Línea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="incluirTabla" 
                      checked={incluirTabla} 
                      onCheckedChange={(checked) => setIncluirTabla(checked as boolean)}
                    />
                    <Label htmlFor="incluirTabla" className="responsive-text">Incluir tabla</Label>
                  </div>
                  {incluirTabla && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm text-muted-foreground responsive-small-text">Tipo de tabla:</Label>
                      <Select value={tipoTablaPDF} onValueChange={(v: "completa" | "categorias") => setTipoTablaPDF(v)}>
                        <SelectTrigger className="bg-background border-input responsive-text">
                          <SelectValue placeholder="Seleccionar tipo de tabla" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="categorias" className="focus:bg-accent focus:text-accent-foreground responsive-text">15 Categorías</SelectItem>
                          <SelectItem value="completa" className="focus:bg-accent focus:text-accent-foreground responsive-text">29 Subcategorías</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="responsive-text">Formato de descarga:</Label>
                    <Select value={formatoDescarga} onValueChange={(v: "pdf" | "docx") => setFormatoDescarga(v)}>
                      <SelectTrigger className="bg-background border-input responsive-text">
                        <SelectValue placeholder="Seleccionar formato" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="pdf" className="focus:bg-accent focus:text-accent-foreground responsive-text">PDF</SelectItem>
                        <SelectItem value="docx" className="focus:bg-accent focus:text-accent-foreground responsive-text">Word</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="responsive-buttons">
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">
                    Cancelar
                  </Button>
                  <Button onClick={generarDocumento} disabled={!incluirGrafico && !incluirTabla} className="flex-1 sm:flex-none">
                    <FileText className="w-4 h-4 mr-2" />
                    Generar {formatoDescarga === 'pdf' ? 'PDF' : 'Word'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
