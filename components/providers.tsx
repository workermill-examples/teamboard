'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/toast'
import { PWAProvider } from '@/components/pwa-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PWAProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </PWAProvider>
    </SessionProvider>
  )
}