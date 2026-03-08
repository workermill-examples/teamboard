import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps) {
  const styles = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div
      className={cn(
        'bg-muted-200',
        {
          'animate-pulse': animation === 'pulse',
          'animate-shimmer': animation === 'wave',
          'rounded-md': variant === 'default' || variant === 'rectangular',
          'rounded-full': variant === 'circular',
          'h-4': variant === 'text',
          'h-12 w-12': variant === 'circular' && !width && !height,
          'h-20': variant === 'rectangular' && !height,
        },
        className
      )}
      style={styles}
      {...props}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: { lines?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 && 'w-3/4',
            className
          )}
          {...props}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({
  className,
  showAvatar = false,
  showBadge = false,
  ...props
}: {
  showAvatar?: boolean
  showBadge?: boolean
} & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-3 p-4', className)} {...props}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="flex items-center space-x-2">
        {showAvatar && <Skeleton variant="circular" className="h-6 w-6" />}
        {showBadge && <Skeleton className="h-5 w-16 rounded-full" />}
      </div>

      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: {
  rows?: number
  columns?: number
} & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={`header-${i}`} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}