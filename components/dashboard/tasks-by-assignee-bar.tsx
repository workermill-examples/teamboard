'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TasksByAssigneeBarProps {
  data: Record<string, { count: number; user: any }>
}

export function TasksByAssigneeBar({ data }: TasksByAssigneeBarProps) {
  // Convert data object to array format for Recharts
  const chartData = Object.entries(data).map(([key, { count, user }]) => ({
    name: key === 'unassigned' ? 'Unassigned' : (user?.name || user?.email || 'Unknown'),
    value: count,
    fullName: key === 'unassigned' ? 'Unassigned' : (user?.name || user?.email || 'Unknown'),
    avatar: key === 'unassigned' ? null : user?.avatar,
  }))

  // Sort by count descending
  chartData.sort((a, b) => b.value - a.value)

  // Limit to top 10 assignees for readability
  const limitedData = chartData.slice(0, 10)

  // Custom tooltip
  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0]

      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            {data.payload.avatar ? (
              <div className="w-6 h-6 rounded-full bg-muted-200 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.payload.avatar}
                  alt={data.payload.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted-200 flex items-center justify-center">
                <span className="text-xs font-medium text-muted-600">
                  {data.payload.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <p className="font-medium text-card-foreground">{data.payload.fullName}</p>
          </div>
          <p className="text-sm text-muted-600">
            {data.value} {data.value === 1 ? 'task' : 'tasks'}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom tick formatter to truncate long names
  const formatTick = (value: string) => {
    if (value.length > 12) {
      return value.substring(0, 9) + '...'
    }
    return value
  }

  // Show empty state if no data
  if (limitedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-600">
        <div className="text-center">
          <div className="text-sm font-medium mb-1">No assigned tasks found</div>
          <div className="text-xs">Assign cards to team members to see the distribution</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={limitedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60, // Extra space for rotated labels
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
              fill: 'hsl(var(--muted-foreground))',
            }}
            tickFormatter={formatTick}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{
              fontSize: 12,
              fill: 'hsl(var(--muted-foreground))',
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={renderTooltip} />
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationBegin={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}