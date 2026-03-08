'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface TasksByStatusPieProps {
  data: Record<string, number>
}

const COLORS = [
  '#6366f1', // Primary (Indigo)
  '#8b5cf6', // Accent (Purple)
  '#22c55e', // Success (Green)
  '#f59e0b', // Warning (Amber)
  '#ef4444', // Destructive (Red)
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f97316', // Orange
  '#6b7280', // Gray
]

export function TasksByStatusPie({ data }: TasksByStatusPieProps) {
  // Convert data object to array format for Recharts
  const chartData = Object.entries(data).map(([status, count], index) => ({
    name: status,
    value: count,
    color: COLORS[index % COLORS.length],
  }))

  // Calculate total for percentage display
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  // Custom tooltip
  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0]
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0'

      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-card-foreground">{data.name}</p>
          <p className="text-sm text-muted-600">
            {data.value} cards ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label function for pie slices
  const renderLabel = (entry: any) => {
    const percentage = total > 0 ? ((entry.value / total) * 100) : 0
    // Only show label if slice is significant enough (>5%)
    return percentage > 5 ? `${percentage.toFixed(0)}%` : ''
  }

  // Show empty state if no data
  if (chartData.length === 0 || total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-600">
        <div className="text-center">
          <div className="text-sm font-medium mb-1">No tasks found</div>
          <div className="text-xs">Create some cards to see the distribution</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px',
            }}
            formatter={(value: string, entry: any) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}