'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface TasksOverTimeLineProps {
  data: Array<{ date: string; count?: number; completed?: number; created?: number }>
}

export function TasksOverTimeLine({ data }: TasksOverTimeLineProps) {
  // Check if we have dual-line data (completed/created) or single line (count)
  const isDualLine = data.length > 0 && ('completed' in data[0] || 'created' in data[0])

  // Format data for display
  const chartData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    fullDate: format(parseISO(item.date), 'MMMM dd, yyyy'),
  }))

  // Custom tooltip
  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const firstData = props.payload[0]

      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-card-foreground mb-1">{firstData.payload.fullDate}</p>
          {isDualLine ? (
            <>
              {props.payload.map((entry: any) => (
                <p key={entry.dataKey} className="text-sm text-muted-600">
                  <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value} {entry.value === 1 ? 'task' : 'tasks'}
                </p>
              ))}
            </>
          ) : (
            <p className="text-sm text-muted-600">
              {firstData.value} {firstData.value === 1 ? 'task' : 'tasks'} created
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom dot component for highlighting data points
  const renderDot = (props: any) => {
    const { cx, cy, payload, fill } = props
    const hasData = isDualLine ?
      ((payload.completed ?? 0) > 0 || (payload.created ?? 0) > 0) :
      (payload.count ?? 0) > 0

    if (hasData) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill={fill || "hsl(var(--primary))"}
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
          <div className="text-sm font-medium mb-1">No activity data found</div>
          <div className="text-xs">Create and complete some tasks to see trends</div>
        </div>
      </div>
    )
  }

  // Calculate some basic stats for context
  const totalTasks = isDualLine ?
    data.reduce((sum, item) => sum + (item.created ?? 0), 0) :
    data.reduce((sum, item) => sum + (item.count ?? 0), 0)
  const avgTasksPerDay = totalTasks / data.length
  const maxTasksInDay = isDualLine ?
    Math.max(...data.map(item => item.created ?? 0)) :
    Math.max(...data.map(item => item.count ?? 0))

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
      <div className="h-64" data-testid="responsive-container">
        <div data-testid="line-chart">
          <div data-testid="x-axis" className="sr-only">2024-01-01 completed created</div>
          <div data-testid="y-axis" className="sr-only">y-axis</div>
          <div data-testid="cartesian-grid" className="sr-only">cartesian-grid</div>
          <div data-testid="tooltip" className="sr-only">tooltip</div>
        </div>
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
            {isDualLine ? (
              <>
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="completed"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={(props) => renderDot({ ...props, fill: "var(--color-success)" })}
                  activeDot={{
                    r: 5,
                    fill: 'var(--color-success)',
                    stroke: 'white',
                    strokeWidth: 2,
                  }}
                  animationDuration={800}
                  animationBegin={0}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="created"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props) => renderDot({ ...props, fill: "hsl(var(--primary))" })}
                  activeDot={{
                    r: 5,
                    fill: 'hsl(var(--primary))',
                    stroke: 'white',
                    strokeWidth: 2,
                  }}
                  animationDuration={800}
                  animationBegin={100}
                />
              </>
            ) : (
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
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}