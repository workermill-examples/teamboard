import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  icon?: React.ReactNode
  variant?: 'default' | 'minimal' | 'card'
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  action,
  className,
  icon,
  variant = 'default'
}: ErrorStateProps) {
  const defaultIcon = (
    <svg
      className="h-12 w-12 text-muted-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  )

  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4', className)}>
        <p className="text-sm text-muted-600 text-center">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm text-primary hover:text-primary-600 font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        'bg-card border border-border rounded-lg p-6',
        className
      )}>
        <div className="flex flex-col items-center text-center space-y-4">
          {icon || defaultIcon}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-600 max-w-md">{description}</p>
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      {icon || defaultIcon}

      <div className="mt-6 text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-600 max-w-md">{description}</p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export function NetworkErrorState({
  onRetry,
  className,
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
      className={className}
      icon={
        <svg
          className="h-12 w-12 text-muted-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v20M2 12h20"
          />
        </svg>
      }
    />
  )
}

export function NotFoundErrorState({
  title = 'Not Found',
  description = 'The page or resource you are looking for could not be found.',
  onGoBack,
  className,
}: {
  title?: string
  description?: string
  onGoBack?: () => void
  className?: string
}) {
  return (
    <ErrorState
      title={title}
      description={description}
      action={onGoBack ? { label: 'Go Back', onClick: onGoBack } : undefined}
      className={className}
      icon={
        <svg
          className="h-12 w-12 text-muted-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
    />
  )
}

export function PermissionErrorState({
  onSignIn,
  className,
}: {
  onSignIn?: () => void
  className?: string
}) {
  return (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to access this resource. Please sign in or contact your administrator."
      action={onSignIn ? { label: 'Sign In', onClick: onSignIn } : undefined}
      className={className}
      icon={
        <svg
          className="h-12 w-12 text-muted-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      }
    />
  )
}