'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface TasksOverTimeLineProps {
  data: Array<{ date: string; count: number }>
}

export function TasksOverTimeLine({ data }: TasksOverTimeLineProps) {
  // Format data for display
  const chartData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    fullDate: format(parseISO(item.date), 'MMMM dd, yyyy'),
  }))

  // Custom tooltip
  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0]

      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-card-foreground mb-1">{data.payload.fullDate}</p>
          <p className="text-sm text-muted-600">
            {data.value} {data.value === 1 ? 'task' : 'tasks'} created
          </p>
        </div>
      )
    }
    return null
  }

  // Custom dot component for highlighting data points
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.count > 0) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="hsl(var(--primary))"
          stroke="white"
          strokeWidth={2}
        />
      )
    }
    // Return empty circle element instead of null to satisfy type requirements
    return <circle cx={0} cy={0} r={0} opacity={0} />
  }

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-600">
        <div className="text-center">
          <div className="text-sm font-medium mb-1">No data available</div>
          <div className="text-xs">Task creation history will appear here</div>
        </div>
      </div>
    )
  }

  // Calculate some basic stats for context
  const totalTasks = data.reduce((sum, item) => sum + item.count, 0)
  const avgTasksPerDay = totalTasks / data.length
  const maxTasksInDay = Math.max(...data.map(item => item.count))

  return (
    <div>
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-muted-50 rounded-lg p-3">
          <div className="text-sm font-medium text-muted-600">Total Created</div>
          <div className="text-lg font-semibold">{totalTasks}</div>
        </div>
        <div className="bg-muted-50 rounded-lg p-3">
          <div className="text-sm font-medium text-muted-600">Daily Average</div>
          <div className="text-lg font-semibold">{avgTasksPerDay.toFixed(1)}</div>
        </div>
        <div className="bg-muted-50 rounded-lg p-3">
          <div className="text-sm font-medium text-muted-600">Peak Day</div>
          <div className="text-lg font-semibold">{maxTasksInDay}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="formattedDate"
              tick={{
                fontSize: 12,
                fill: 'hsl(var(--muted-foreground))',
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{
                fontSize: 12,
                fill: 'hsl(var(--muted-foreground))',
              }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax']}
            />
            <Tooltip content={renderTooltip} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={renderDot}
              activeDot={{
                r: 5,
                fill: 'hsl(var(--primary))',
                stroke: 'white',
                strokeWidth: 2,
              }}
              animationDuration={800}
              animationBegin={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}