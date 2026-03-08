'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Activity } from './use-activity'

interface SSEEventData {
  type: string
  data?: any
  workspaceId?: string
  timestamp?: string
}

interface SSEOptions {
  onActivity?: (activity: Activity) => void
  onCardUpdate?: (card: any) => void
  onBoardUpdate?: (board: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useSSE(workspaceSlug?: string, options: SSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const baseReconnectDelay = 1000 // 1 second

  const connect = useCallback(() => {
    if (!workspaceSlug) return

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(`/api/workspaces/${workspaceSlug}/stream`, {
        withCredentials: true,
      })

      eventSource.onopen = () => {
        console.log('SSE connection opened')
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts on successful connection
        options.onConnect?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const eventData: SSEEventData = JSON.parse(event.data)

          switch (eventData.type) {
            case 'connected':
              console.log('SSE connected to workspace:', eventData.workspaceId)
              break

            case 'activity':
              if (eventData.data && options.onActivity) {
                options.onActivity(eventData.data)
              }
              break

            case 'card_updated':
            case 'card_created':
            case 'card_moved':
            case 'card_deleted':
              if (eventData.data && options.onCardUpdate) {
                options.onCardUpdate(eventData.data)
              }
              break

            case 'board_updated':
              if (eventData.data && options.onBoardUpdate) {
                options.onBoardUpdate(eventData.data)
              }
              break

            case 'keep-alive':
              // Keep-alive heartbeat - no action needed
              console.debug('SSE keep-alive received')
              break

            default:
              console.log('Unknown SSE event type:', eventData.type)
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err)
        }
      }

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event)
        options.onError?.(event)

        // Only attempt reconnection if we haven't exceeded the limit
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current)
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else {
          console.error('Max reconnection attempts reached. SSE connection failed permanently.')
          options.onDisconnect?.()
        }
      }

      eventSourceRef.current = eventSource
    } catch (err) {
      console.error('Failed to create SSE connection:', err)
      options.onError?.(new ErrorEvent('connection_failed'))
    }
  }, [workspaceSlug, options])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    options.onDisconnect?.()
  }, [options])

  useEffect(() => {
    if (workspaceSlug) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [workspaceSlug, connect, disconnect])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    isConnected: () => eventSourceRef.current?.readyState === EventSource.OPEN,
  }
}