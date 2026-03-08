'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary-600 shadow-sm',
  destructive: 'bg-destructive text-destructive-50 hover:bg-destructive-600',
  outline: 'border border-border bg-background hover:bg-secondary-50 hover:border-secondary-300',
  secondary: 'bg-secondary text-secondary-900 hover:bg-secondary-200',
  ghost: 'hover:bg-secondary-100 hover:text-secondary-900',
  link: 'text-primary underline-offset-4 hover:underline',
}

const buttonSizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs rounded-md',
  lg: 'h-12 px-8 text-base',
  icon: 'h-10 w-10',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }