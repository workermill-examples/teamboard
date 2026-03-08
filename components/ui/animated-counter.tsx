'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate as animateValue, AnimationOptions } from 'framer-motion'

export interface AnimatedCounterProps {
  /** Target value to animate to */
  value: number
  /** Duration of animation in milliseconds */
  duration?: number
  /** Animation easing function */
  easing?: AnimationOptions['ease']
  /** Format function for the displayed value */
  formatValue?: (value: number) => string
  /** Delay before animation starts */
  delay?: number
  /** Whether to animate immediately or wait for trigger */
  animate?: boolean
  /** Callback when animation completes */
  onAnimationComplete?: () => void
  /** Custom styling */
  className?: string
  /** Decimal places to show */
  decimals?: number
  /** Whether to show plus sign for positive numbers */
  showSign?: boolean
  /** Whether to use locale formatting (commas, etc.) */
  useLocaleFormat?: boolean
  /** Locale for number formatting */
  locale?: string
}

/**
 * Reusable animated counter component with framer-motion
 * Smoothly animates between numeric values with customizable easing and formatting
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AnimatedCounter value={42} />
 *
 * // Custom formatting
 * <AnimatedCounter
 *   value={1500}
 *   formatValue={(n) => `$${n.toLocaleString()}`}
 *   duration={1500}
 * />
 *
 * // Percentage counter
 * <AnimatedCounter
 *   value={75.5}
 *   formatValue={(n) => `${n.toFixed(1)}%`}
 *   decimals={1}
 * />
 * ```
 */
export function AnimatedCounter({
  value,
  duration = 1000,
  easing = 'easeOut',
  formatValue,
  delay = 0,
  animate = true,
  onAnimationComplete,
  className,
  decimals = 0,
  showSign = false,
  useLocaleFormat = false,
  locale = 'en-US'
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef(0)

  // Transform motion value to rounded number
  const rounded = useTransform(motionValue, (latest) => {
    if (decimals > 0) {
      return parseFloat(latest.toFixed(decimals))
    }
    return Math.round(latest)
  })

  // Start animation when value changes
  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    const startValue = previousValue.current
    previousValue.current = value

    setIsAnimating(true)

    const timer = setTimeout(() => {
      const controls = animateValue(startValue, value, {
        duration: duration / 1000,
        ease: easing,
        onUpdate: (latest) => motionValue.set(latest),
        onComplete: () => {
          setIsAnimating(false)
          onAnimationComplete?.()
        }
      })

      return () => controls.stop()
    }, delay)

    return () => clearTimeout(timer)
  }, [value, duration, easing, delay, animate, motionValue, onAnimationComplete])

  // Subscribe to motion value changes
  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest)
    })

    return unsubscribe
  }, [rounded])

  // Format the display value
  const formattedValue = formatValue
    ? formatValue(displayValue)
    : formatNumber(displayValue, {
        decimals,
        showSign,
        useLocaleFormat,
        locale
      })

  return (
    <motion.span
      className={className}
      data-testid="animated-counter"
      initial={false}
      animate={isAnimating ? { opacity: 1 } : {}}
      transition={{ duration: 0.2 }}
    >
      {formattedValue}
    </motion.span>
  )
}

/**
 * Format a number according to specified options
 */
function formatNumber(
  value: number,
  options: {
    decimals: number
    showSign: boolean
    useLocaleFormat: boolean
    locale: string
  }
): string {
  const { decimals, showSign, useLocaleFormat, locale } = options

  let formatted: string

  if (useLocaleFormat) {
    formatted = value.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  } else {
    formatted = decimals > 0 ? value.toFixed(decimals) : value.toString()
  }

  if (showSign && value > 0) {
    formatted = `+${formatted}`
  }

  return formatted
}

/**
 * Counter with incremental animation - shows each step
 */
export interface IncrementalCounterProps extends Omit<AnimatedCounterProps, 'duration'> {
  /** Time between each increment in milliseconds */
  incrementDelay?: number
  /** Number of steps to animate through */
  steps?: number
}

export function IncrementalCounter({
  value,
  incrementDelay = 50,
  steps = 20,
  ...props
}: IncrementalCounterProps) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (value === currentValue) return

    const increment = (value - currentValue) / steps
    let step = 0

    const interval = setInterval(() => {
      step++
      if (step >= steps) {
        setCurrentValue(value)
        clearInterval(interval)
      } else {
        setCurrentValue(prev => prev + increment)
      }
    }, incrementDelay)

    return () => clearInterval(interval)
  }, [value, currentValue, incrementDelay, steps])

  return <AnimatedCounter {...props} value={currentValue} animate={false} />
}

/**
 * Counter with typed animation effect
 */
export interface TypedCounterProps extends AnimatedCounterProps {
  /** Show typing cursor */
  showCursor?: boolean
}

export function TypedCounter({
  value,
  showCursor = true,
  formatValue,
  className,
  ...props
}: TypedCounterProps) {
  const [typedValue, setTypedValue] = useState('')
  const [showingCursor, setShowingCursor] = useState(false)

  const formattedTarget = formatValue ? formatValue(value) : value.toString()

  useEffect(() => {
    setShowingCursor(true)
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex <= formattedTarget.length) {
        setTypedValue(formattedTarget.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowingCursor(false), 500)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [formattedTarget])

  return (
    <span className={className} data-testid="typed-counter">
      {typedValue}
      {showCursor && showingCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  )
}

/**
 * Loading counter with skeleton effect
 */
export interface CounterSkeletonProps {
  /** Width of the skeleton */
  width?: string | number
  /** Height of the skeleton */
  height?: string | number
  /** Custom className */
  className?: string
}

export function CounterSkeleton({ width = 60, height = 24, className }: CounterSkeletonProps) {
  return (
    <motion.div
      className={`bg-muted-200 rounded animate-pulse ${className || ''}`}
      style={{ width, height }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      data-testid="counter-skeleton"
    />
  )
}

/**
 * Counter with progress bar underneath
 */
export interface ProgressCounterProps extends AnimatedCounterProps {
  /** Maximum value for progress calculation */
  max: number
  /** Progress bar color */
  progressColor?: string
  /** Show percentage instead of raw value */
  showPercentage?: boolean
}

export function ProgressCounter({
  value,
  max,
  progressColor = 'bg-primary',
  showPercentage = false,
  className,
  ...props
}: ProgressCounterProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <AnimatedCounter
        {...props}
        value={showPercentage ? percentage : value}
        formatValue={
          showPercentage
            ? (val) => `${val.toFixed(1)}%`
            : props.formatValue
        }
      />
      <div className="w-full bg-muted-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${progressColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: props.duration || 1000 }}
        />
      </div>
    </div>
  )
}