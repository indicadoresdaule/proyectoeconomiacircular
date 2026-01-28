"use client"

import { useState, useEffect } from "react"
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

interface GraficosProps {
  datos: { name: string; value: number; porcentaje: number }[]
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

const calculateYAxisWidth = (datos: any[], isMobile: boolean, isLandscape: boolean) => {
  if (isMobile && isLandscape) return 45 // Más espacio en horizontal
  if (isMobile) return 35
  const maxValue = Math.max(...datos.map((d) => d.value))
  const maxDigits = maxValue.toFixed(0).length
  return Math.max(60, maxDigits * 10 + 30)
}

// Componente personalizado para ticks en móvil (vertical) y PC (horizontal)
const CustomXAxisTick = (props: any) => {
  const { x, y, payload, isMobile, isLandscape } = props
  
  if (isMobile && !isLandscape) {
    // En móvil vertical: texto vertical compacto
    return (
      <g transform={`translate(${x},${y}) rotate(-90)`}>
        <text
          x={0}
          y={0}
          dy={6}
          textAnchor="end"
          fontSize={8}
          fill="#4b5563"
          className="font-medium"
        >
          {payload.value.length > 10 ? payload.value.substring(0, 10) + "..." : payload.value}
        </text>
      </g>
    )
  } else if (isMobile && isLandscape) {
    // En móvil horizontal: texto diagonal más pequeño
    return (
      <g transform={`translate(${x},${y}) rotate(-45)`}>
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="end"
          fontSize={9}
          fill="#4b5563"
          className="font-medium"
        >
          {payload.value.length > 12 ? payload.value.substring(0, 12) + "..." : payload.value}
        </text>
      </g>
    )
  } else {
    // En PC: texto diagonal (45 grados)
    return (
      <g transform={`translate(${x},${y}) rotate(-45)`}>
        <text
          x={0}
          y={0}
          dy={20}
          textAnchor="end"
          fontSize={11}
          fill="#4b5563"
          className="font-medium"
        >
          {payload.value}
        </text>
      </g>
    )
  }
}

// Tooltip personalizado para mostrar cantidad y porcentaje
const CustomTooltip = ({ active, payload, label, isMobile }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className={`bg-white p-3 border border-gray-200 shadow-lg rounded-lg ${isMobile ? 'text-xs' : 'text-sm'}`}>
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

// Componente personalizado para etiquetas en gráfico de barras (MÓVIL)
const CustomBarLabelMobile = (props: any) => {
  const { x, y, width, value, index, isLandscape } = props
  const porcentaje = props.porcentaje ?? 0
  
  if (isLandscape) {
    // En horizontal: más espacio
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 20}
          textAnchor="middle"
          fontSize={8}
          fontWeight="600"
          fill="#1f2937"
        >
          {`${value.toFixed(0)}kg`}
        </text>
        <text
          x={x + width / 2}
          y={y - 10}
          textAnchor="middle"
          fontSize={7}
          fontWeight="500"
          fill="#059669"
        >
          {`${porcentaje.toFixed(1)}%`}
        </text>
      </g>
    )
  } else {
    // En vertical: compacto
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 15}
          textAnchor="middle"
          fontSize={7}
          fontWeight="600"
          fill="#1f2937"
        >
          {`${value.toFixed(0)}kg`}
        </text>
        <text
          x={x + width / 2}
          y={y - 7}
          textAnchor="middle"
          fontSize={6}
          fontWeight="500"
          fill="#059669"
        >
          {`${porcentaje.toFixed(1)}%`}
        </text>
      </g>
    )
  }
}

// Componente personalizado para etiquetas en gráfico de barras (PC)
const CustomBarLabelDesktop = (props: any) => {
  const { x, y, width, value, index } = props
  const porcentaje = props.porcentaje ?? 0
  
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 25}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${value.toFixed(0)} kg`}
      </text>
      <text
        x={x + width / 2}
        y={y - 12}
        textAnchor="middle"
        fontSize={9}
        fontWeight="500"
        fill="#059669"
      >
        {`${porcentaje.toFixed(1)}%`}
      </text>
    </g>
  )
}

// Componente personalizado para etiquetas en gráfico de líneas (MÓVIL)
const CustomLineLabelMobile = (props: any) => {
  const { x, y, payload, isLandscape } = props
  
  if (isLandscape) {
    // En horizontal: más espacio
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
          {`${payload.value.toFixed(0)}kg`}
        </text>
        <text
          x={x}
          y={y - 15}
          textAnchor="middle"
          fontSize={6}
          fontWeight="500"
          fill="#059669"
        >
          {`${payload.porcentaje.toFixed(1)}%`}
        </text>
      </g>
    )
  } else {
    // En vertical: compacto
    return (
      <g>
        <text
          x={x}
          y={y - 20}
          textAnchor="middle"
          fontSize={6}
          fontWeight="600"
          fill="#1f2937"
        >
          {`${payload.value.toFixed(0)}kg`}
        </text>
        <text
          x={x}
          y={y - 12}
          textAnchor="middle"
          fontSize={5}
          fontWeight="500"
          fill="#059669"
        >
          {`${payload.porcentaje.toFixed(1)}%`}
        </text>
      </g>
    )
  }
}

// Componente personalizado para etiquetas en gráfico de líneas (PC)
const CustomLineLabelDesktop = (props: any) => {
  const { x, y, payload } = props
  
  return (
    <g>
      <text
        x={x}
        y={y - 35}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill="#1f2937"
      >
        {`${payload.value.toFixed(0)} kg`}
      </text>
      <text
        x={x}
        y={y - 22}
        textAnchor="middle"
        fontSize={9}
        fontWeight="500"
        fill="#059669"
      >
        {`${payload.porcentaje.toFixed(1)}%`}
      </text>
    </g>
  )
}

export function CaracterizacionGraficos({ datos }: GraficosProps) {
  const [tipoGrafico, setTipoGrafico] = useState<"barras" | "torta" | "lineal">("barras")
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobileWidth = width < 768
      setIsMobile(isMobileWidth)
      setIsTablet(width >= 768 && width < 1024)
      // Detectar orientación en móvil
      setIsLandscape(isMobileWidth && width > height)
    }
    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [])

  const yAxisWidth = calculateYAxisWidth(datos, isMobile, isLandscape)
  
  // Configuraciones responsivas optimizadas para móvil vertical y horizontal
  const getBarChartMargin = () => {
    if (isMobile && isLandscape) {
      // Horizontal: más espacio lateral, menos inferior
      return { top: 40, right: 10, left: yAxisWidth, bottom: 100 }
    } else if (isMobile) {
      // Vertical: menos espacio lateral, más inferior
      return { top: 35, right: 5, left: yAxisWidth, bottom: 110 }
    } else if (isTablet) {
      return { top: 50, right: 20, left: yAxisWidth, bottom: 140 }
    } else {
      return { top: 60, right: 30, left: yAxisWidth, bottom: 160 }
    }
  }

  const getLineChartMargin = () => {
    if (isMobile && isLandscape) {
      return { top: 40, right: 10, left: yAxisWidth, bottom: 100 }
    } else if (isMobile) {
      return { top: 35, right: 5, left: yAxisWidth, bottom: 110 }
    } else if (isTablet) {
      return { top: 50, right: 20, left: yAxisWidth, bottom: 140 }
    } else {
      return { top: 60, right: 30, left: yAxisWidth, bottom: 160 }
    }
  }

  // Alturas optimizadas para móvil
  const getChartHeight = () => {
    if (isMobile && isLandscape) {
      return 400 // Más ancho, menos alto
    } else if (isMobile) {
      return 500 // Más alto para vertical
    } else if (isTablet) {
      return 600
    } else {
      return 650
    }
  }

  // Configuraciones para gráfico circular optimizadas
  const getPieChartConfig = () => {
    if (isMobile && isLandscape) {
      return {
        cx: "40%",
        cy: "50%",
        outerRadius: 70,
        innerRadius: 30,
        padding: 1,
        legendAlign: "right" as const,
        legendVerticalAlign: "middle" as const,
        legendLayout: "vertical" as const,
        legendWidth: "55%",
      }
    } else if (isMobile) {
      return {
        cx: "50%",
        cy: "45%",
        outerRadius: 80,
        innerRadius: 35,
        padding: 1,
        legendAlign: "center" as const,
        legendVerticalAlign: "bottom" as const,
        legendLayout: "horizontal" as const,
        legendWidth: "100%",
      }
    } else if (isTablet) {
      return {
        cx: "45%",
        cy: "50%",
        outerRadius: 130,
        innerRadius: 65,
        padding: 2,
        legendAlign: "right" as const,
        legendVerticalAlign: "middle" as const,
        legendLayout: "vertical" as const,
        legendWidth: "40%",
      }
    } else {
      return {
        cx: "42%",
        cy: "50%",
        outerRadius: 160,
        innerRadius: 80,
        padding: 3,
        legendAlign: "right" as const,
        legendVerticalAlign: "middle" as const,
        legendLayout: "vertical" as const,
        legendWidth: "35%",
      }
    }
  }

  const pieChartConfig = getPieChartConfig()

  // Función para obtener estilos de leyenda optimizados
  const getLegendStyle = () => {
    if (isMobile && isLandscape) {
      return {
        paddingLeft: "15px",
        fontSize: "8px",
        maxHeight: "250px",
        overflowY: "auto" as const,
        lineHeight: "1.3",
        width: pieChartConfig.legendWidth,
      }
    } else if (isMobile) {
      return {
        paddingTop: "10px",
        fontSize: "8px",
        maxHeight: "100px",
        overflowY: "auto" as const,
        lineHeight: "1.2",
        width: pieChartConfig.legendWidth,
      }
    } else if (isTablet) {
      return {
        paddingLeft: "15px",
        fontSize: "11px",
        maxHeight: "300px",
        overflowY: "auto" as const,
        lineHeight: "1.6",
        width: pieChartConfig.legendWidth,
      }
    } else {
      return {
        paddingLeft: "25px",
        fontSize: "12px",
        maxHeight: "350px",
        overflowY: "auto" as const,
        lineHeight: "1.7",
        width: pieChartConfig.legendWidth,
        backgroundColor: "rgba(249, 250, 251, 0.8)",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }
    }
  }

  return (
    <Card className="p-3 sm:p-4 md:p-6 border border-border overflow-hidden">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">
          Distribución de Desechos por Categoría
        </h3>
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
            <BarChart data={datos} margin={getBarChartMargin()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                height={isMobile && !isLandscape ? 90 : isMobile && isLandscape ? 70 : isTablet ? 120 : 140}
                tick={(props) => <CustomXAxisTick {...props} isMobile={isMobile} isLandscape={isLandscape} />}
                interval={0}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis 
                fontSize={isMobile ? (isLandscape ? 10 : 9) : 12} 
                tick={{ fill: "#4b5563" }} 
                width={yAxisWidth}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
                tickFormatter={(value) => `${value} kg`}
              />
              <Tooltip content={<CustomTooltip isMobile={isMobile} />} />
              <Bar
                dataKey="value"
                label={(props) => (
                  isMobile ? (
                    <CustomBarLabelMobile 
                      {...props} 
                      porcentaje={datos[props.index]?.porcentaje} 
                      isLandscape={isLandscape}
                    />
                  ) : (
                    <CustomBarLabelDesktop 
                      {...props} 
                      porcentaje={datos[props.index]?.porcentaje} 
                    />
                  )
                )}
                radius={[3, 3, 0, 0]}
              >
                {datos.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length].bg}
                    stroke={COLORS[index % COLORS.length].border}
                    strokeWidth={isMobile ? 1 : 2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tipoGrafico === "torta" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datos}
                cx={pieChartConfig.cx}
                cy={pieChartConfig.cy}
                labelLine={false}
                label={null}
                outerRadius={pieChartConfig.outerRadius}
                innerRadius={pieChartConfig.innerRadius}
                dataKey="value"
                paddingAngle={pieChartConfig.padding}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {datos.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SOLID_COLORS[index % SOLID_COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={isMobile ? 1.5 : isTablet ? 2 : 2.5}
                    strokeOpacity={0.9}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip isMobile={isMobile} />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend
                verticalAlign={pieChartConfig.legendVerticalAlign}
                align={pieChartConfig.legendAlign}
                layout={pieChartConfig.legendLayout}
                wrapperStyle={getLegendStyle()}
                formatter={(value, entry: any) => {
                  const porcentaje = entry.payload?.porcentaje ?? 0
                  const valor = entry.payload?.value ?? 0
                  
                  if (isMobile) {
                    const maxLength = isLandscape ? 15 : 18
                    const shortName = value.length > maxLength ? value.substring(0, maxLength) + "..." : value
                    return (
                      <span>
                        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: isLandscape ? '0.9em' : '1em' }}>
                          {shortName}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: isLandscape ? '0.8em' : '0.9em' }}>
                          : {valor.toFixed(0)}kg ({porcentaje.toFixed(1)}%)
                        </span>
                      </span>
                    )
                  } else {
                    return (
                      <span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>
                          {value}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '0.95em' }}>
                          : {valor.toFixed(1)} kg ({porcentaje.toFixed(1)}%)
                        </span>
                      </span>
                    )
                  }
                }}
                iconSize={isMobile ? (isLandscape ? 7 : 8) : 12}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {tipoGrafico === "lineal" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={getLineChartMargin()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                height={isMobile && !isLandscape ? 90 : isMobile && isLandscape ? 70 : isTablet ? 120 : 140}
                tick={(props) => <CustomXAxisTick {...props} isMobile={isMobile} isLandscape={isLandscape} />}
                interval={0}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis 
                fontSize={isMobile ? (isLandscape ? 10 : 9) : 12} 
                tick={{ fill: "#4b5563" }} 
                width={yAxisWidth}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
                tickFormatter={(value) => `${value} kg`}
              />
              <Tooltip content={<CustomTooltip isMobile={isMobile} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={isMobile ? (isLandscape ? 2 : 1.5) : 3}
                dot={(props) => {
                  const { cx, cy, payload, index } = props
                  return (
                    <g key={`dot-${payload.name}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isMobile ? (isLandscape ? 5 : 4) : 7}
                        fill={COLORS[index % COLORS.length].bg}
                        stroke="white"
                        strokeWidth={isMobile ? 1 : 2}
                      />
                      {isMobile ? (
                        <CustomLineLabelMobile
                          x={cx}
                          y={cy}
                          payload={payload}
                          isLandscape={isLandscape}
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
                  r: isMobile ? (isLandscape ? 6 : 5) : 9,
                  stroke: "white",
                  strokeWidth: isMobile ? 1 : 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
