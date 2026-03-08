'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
  onClose?: () => void
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearAll = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ id, title, description, variant = 'default', onClose }: ToastProps) {
  const { removeToast } = useToast()

  const handleClose = () => {
    onClose?.()
    removeToast(id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
        {
          'bg-background border-border': variant === 'default',
          'bg-success-50 border-success-200 text-success-900': variant === 'success',
          'bg-destructive-50 border-destructive-200 text-destructive-900': variant === 'error',
          'bg-warning-50 border-warning-200 text-warning-900': variant === 'warning',
        }
      )}
    >
      <div className="grid gap-1">
        {title && (
          <div className="text-sm font-semibold leading-none tracking-tight">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90 leading-relaxed">
            {description}
          </div>
        )}
      </div>

      <button
        onClick={handleClose}
        className="absolute right-1 top-1 rounded-md p-1 text-current/50 opacity-0 transition-opacity hover:text-current focus:opacity-100 group-hover:opacity-100"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
        <span className="sr-only">Close</span>
      </button>
    </motion.div>
  )
}

// Helper functions for common toast types
export function toast(props: Omit<ToastProps, 'id'>) {
  // This will be used with the hook in components
}

export function useToastHelpers() {
  const { addToast } = useToast()

  return React.useMemo(() => ({
    success: (props: Omit<ToastProps, 'id' | 'variant'>) =>
      addToast({ ...props, variant: 'success' }),
    error: (props: Omit<ToastProps, 'id' | 'variant'>) =>
      addToast({ ...props, variant: 'error' }),
    warning: (props: Omit<ToastProps, 'id' | 'variant'>) =>
      addToast({ ...props, variant: 'warning' }),
    info: (props: Omit<ToastProps, 'id' | 'variant'>) =>
      addToast({ ...props, variant: 'default' }),
  }), [addToast])
}

export { Toast }