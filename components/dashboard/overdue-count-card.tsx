'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OverdueCountCardProps {
  count: number
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: duration / 1000,
      ease: 'easeOut',
    })

    return controls.stop
  }, [motionValue, value, duration])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest)
    })

    return unsubscribe
  }, [rounded])

  return <motion.span>{displayValue}</motion.span>
}

export function OverdueCountCard({ count }: OverdueCountCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Small delay to trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Determine the severity level for styling
  const getSeverityLevel = (count: number) => {
    if (count === 0) return 'success'
    if (count <= 2) return 'warning'
    return 'danger'
  }

  const severityLevel = getSeverityLevel(count)

  const getCardStyles = () => {
    switch (severityLevel) {
      case 'success':
        return {
          border: 'border-success/20',
          bg: 'bg-success/5',
          text: 'text-success',
          icon: '✓',
        }
      case 'warning':
        return {
          border: 'border-warning/20',
          bg: 'bg-warning/5',
          text: 'text-warning',
          icon: '⚠',
        }
      case 'danger':
        return {
          border: 'border-destructive/20',
          bg: 'bg-destructive/5',
          text: 'text-destructive',
          icon: '⚡',
        }
    }
  }

  const styles = getCardStyles()

  const getMessage = () => {
    if (count === 0) return 'All caught up!'
    if (count === 1) return '1 overdue task'
    return `${count} overdue tasks`
  }

  return (
    <Card className={`${styles.border} ${styles.bg} transition-colors duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: isVisible ? 1 : 0,
            rotate: isVisible ? 0 : -180,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className={`text-lg ${styles.text}`}
        >
          {styles.icon}
        </motion.div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${styles.text}`} data-testid="overdue-count">
          {isVisible ? <AnimatedCounter value={count} duration={800} /> : 0}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 5,
          }}
          transition={{
            duration: 0.4,
            delay: 0.6,
          }}
          className="text-xs text-muted-600"
        >
          {getMessage()}
        </motion.p>

        {/* Progress indicator for non-zero values */}
        {count > 0 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isVisible ? 1 : 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: 'easeOut',
            }}
            className="mt-3 h-1 bg-muted-200 rounded-full overflow-hidden origin-left"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isVisible ? Math.min(count / 10, 1) : 0 }}
              transition={{
                duration: 1.2,
                delay: 0.8,
                ease: 'easeOut',
              }}
              className={`h-full origin-left transition-colors duration-300 ${
                severityLevel === 'warning' ? 'bg-warning' : 'bg-destructive'
              }`}
            />
          </motion.div>
        )}

        {/* Pulse effect for high counts */}
        {count >= 5 && (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-destructive/10 rounded-lg pointer-events-none"
          />
        )}
      </CardContent>
    </Card>
  )
}