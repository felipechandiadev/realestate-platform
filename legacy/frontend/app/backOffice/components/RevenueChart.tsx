'use client'

import React, { useEffect, useRef } from 'react'
import Card from '@/shared/components/ui/Card/Card'

interface RevenueChartProps {
  data: number[] // 6 months of data
  months?: string[]
}

export default function RevenueChart({ 
  data = [8.5, 9.2, 8.8, 11.5, 12.3, 14.2],
  months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
}: RevenueChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth - 32 // Account for padding
      canvas.height = 300
    }

    // Dimensions
    const padding = 50
    const width = canvas.width - padding * 2
    const height = canvas.height - padding * 2
    const maxValue = 16 // Max on Y-axis (16M)
    const pointSpacing = width / (data.length - 1)

    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines (horizontal)
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * height) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Draw Y-axis labels
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i <= 4; i++) {
      const value = (4 - i) * (maxValue / 4)
      const y = padding + (i * height) / 4
      const label = value === 0 ? '0' : `${value.toFixed(1)}M`
      ctx.fillText(label, padding - 12, y)
    }

    // Draw X-axis
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()

    // Calculate points
    const points = data.map((value, index) => ({
      x: padding + index * pointSpacing,
      y: canvas.height - padding - (value / maxValue) * height
    }))

    // Draw line with shadow
    ctx.shadowColor = 'rgba(59, 130, 246, 0.2)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()

    // Reset shadow
    ctx.shadowColor = 'transparent'

    // Draw points
    ctx.fillStyle = '#3b82f6'
    points.forEach(point => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      ctx.fill()

      // White circle inside
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#3b82f6'
    })

    // Draw X-axis labels (months)
    ctx.fillStyle = '#666666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    months.forEach((month, index) => {
      const x = padding + index * pointSpacing
      ctx.fillText(month, x, canvas.height - padding + 12)
    })

  }, [data, months])

  return (
    <Card className="bg-white border border-gray-200 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Ingresos por Mes</h2>
      <div className="w-full overflow-x-auto">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ minHeight: '300px' }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Últimos 6 meses (en millones)
      </p>
    </Card>
  )
}
