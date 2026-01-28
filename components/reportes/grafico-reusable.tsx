"use client"

import React, { useState, useEffect } from "react"
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
  Label,
} from "recharts"

interface GraficoReusableProps {
  datos: { name: string; value: number; porcentaje: number; categoria?: string }[]
  tipo: "barras" | "torta" | "lineal"
  tituloX?: string
  tituloY?: string
  esSubcategorias?: boolean
  colors: Array<{ bg: string; border: string }>
  altura?: number
}

export function GraficoReusable({
  datos,
  tipo,
  tituloX = "Categorías",
  tituloY = "Valor",
  esSubcategorias = false,
  colors,
  altura
}: GraficoReusableProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-text">
        No hay datos disponibles para mostrar
      </div>
    )
  }

  const margin = isMobile
    ? { top: 20, right: 10, left: 50, bottom: 120 }
    : { top: 30, right: 30, left: 80, bottom: 150 }

  const datosMostrados = esSubcategorias && tipo === "barras" ? datos.slice(0, 15) : datos
  const alturaGrafico = altura || (isMobile ? 450 : 550)

  return (
    <div className="w-full bg-white p-4 rounded-lg" style={{ height: `${alturaGrafico}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        {tipo === "barras" ? (
          <BarChart data={datosMostrados} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              height={isMobile ? 100 : 120}
              tick={{ fontSize: isMobile ? 9 : 10, fill: "#4b5563" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              tickMargin={10}
            >
              <Label value={tituloX} offset={isMobile ? -90 : -110} position="insideBottom" style={{ fill: '#4b5563', fontSize: isMobile ? 11 : 12 }} />
            </XAxis>
            <YAxis fontSize={isMobile ? 10 : 11} tick={{ fill: "#4b5563" }}>
              <Label value={tituloY} angle={-90} position="insideLeft" offset={-30} style={{ fill: '#4b5563', fontSize: isMobile ? 11 : 12 }} />
            </YAxis>
            <Tooltip
              formatter={(value: number) => {
                const porcentaje = datosMostrados.find(d => d.value === value)?.porcentaje || 0
                return [`${typeof value === 'number' ? value.toFixed(2) : value} (${porcentaje.toFixed(2)}%)`, "Valor"]
              }}
              labelFormatter={(label) => `Categoría: ${label}`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: isMobile ? "11px" : "12px",
                padding: "8px",
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]}
              name={tituloY.includes('kg') ? 'Peso' : 'Cantidad'}
            >
              {datosMostrados.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length].bg}
                  stroke={colors[index % colors.length].border}
                  strokeWidth={1}
                />
              ))}
            </Bar>
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{
                fontSize: isMobile ? "10px" : "11px",
                paddingBottom: "10px"
              }}
            />
          </BarChart>
        ) : tipo === "torta" ? (
          <PieChart>
            <Pie
              data={datos}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={(entry: any) => {
                const porcentaje = entry.porcentaje || 0
                if (porcentaje < 2) return ""
                if (isMobile && porcentaje < 5) return `${porcentaje.toFixed(0)}%`
                return `${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} (${porcentaje.toFixed(1)}%)`
              }}
              outerRadius={isMobile ? 80 : 120}
              innerRadius={isMobile ? 30 : 50}
              dataKey="value"
              paddingAngle={1}
              nameKey="name"
            >
              {datos.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length].border}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name, props) => {
                const porcentaje = props.payload.porcentaje || 0
                return [`${typeof value === 'number' ? value.toFixed(2) : value} (${porcentaje.toFixed(2)}%)`, "Valor"]
              }}
              labelFormatter={(label) => `Categoría: ${label}`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: isMobile ? "11px" : "12px",
                padding: "8px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={isMobile ? 100 : 120}
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: isMobile ? "9px" : "10px",
              }}
              formatter={(value, entry) => {
                const porcentaje = (entry as any).payload?.porcentaje || 0
                return <span style={{ color: '#374151', fontSize: isMobile ? '9px' : '10px' }}>{`${value} (${porcentaje.toFixed(1)}%)`}</span>
              }}
            />
          </PieChart>
        ) : (
          <LineChart data={datos} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              height={isMobile ? 100 : 120}
              tick={{ fontSize: isMobile ? 9 : 10, fill: "#4b5563" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              tickMargin={10}
            >
              <Label value={tituloX} offset={isMobile ? -90 : -110} position="insideBottom" style={{ fill: '#4b5563', fontSize: isMobile ? 11 : 12 }} />
            </XAxis>
            <YAxis fontSize={isMobile ? 10 : 11} tick={{ fill: "#4b5563" }}>
              <Label value={tituloY} angle={-90} position="insideLeft" offset={-30} style={{ fill: '#4b5563', fontSize: isMobile ? 11 : 12 }} />
            </YAxis>
            <Tooltip
              formatter={(value: number) => {
                const porcentaje = datos.find(d => d.value === value)?.porcentaje || 0
                return [`${typeof value === 'number' ? value.toFixed(2) : value} (${porcentaje.toFixed(2)}%)`, "Valor"]
              }}
              labelFormatter={(label) => `Categoría: ${label}`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: isMobile ? "11px" : "12px",
                padding: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={isMobile ? 2 : 3}
              name={tituloY.includes('kg') ? 'Peso' : 'Cantidad'}
              dot={(props: any) => {
                const { cx, cy, index } = props
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={isMobile ? 3 : 4}
                    fill={colors[index % colors.length].bg}
                    stroke="white"
                    strokeWidth={1}
                  />
                )
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{
                fontSize: isMobile ? "10px" : "11px",
                paddingBottom: "10px"
              }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
