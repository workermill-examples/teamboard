'use client'

import React, { ReactNode } from 'react'
import { motion, Variants, HTMLMotionProps, AnimatePresence } from 'framer-motion'

/**
 * Common transition configurations for consistent animations across the app
 */
export const TRANSITIONS = {
  // Basic easing curves
  ease: {
    smooth: [0.25, 0.1, 0.25, 1],
    snappy: [0.4, 0, 0.2, 1],
    gentle: [0.25, 0.46, 0.45, 0.94],
    bouncy: [0.68, -0.55, 0.265, 1.55]
  },

  // Common durations
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    slower: 0.5
  },

  // Spring configurations
  spring: {
    gentle: { type: 'spring', stiffness: 300, damping: 30 },
    bouncy: { type: 'spring', stiffness: 400, damping: 20 },
    wobbly: { type: 'spring', stiffness: 180, damping: 12 },
    stiff: { type: 'spring', stiffness: 500, damping: 40 }
  }
} as const

/**
 * Predefined animation variants for common UI patterns
 */
export const ANIMATION_VARIANTS = {
  // Fade transitions
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },

  // Slide transitions
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },

  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },

  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },

  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },

  // Scale transitions
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },

  scaleUp: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  },

  // Zoom transitions for modals
  zoom: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.6 }
  },

  // Flip transitions
  flip: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 }
  },

  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  },

  // Individual stagger items
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  }
} as const

export type AnimationVariant = keyof typeof ANIMATION_VARIANTS

/**
 * Props for animated components
 */
export interface AnimatedComponentProps {
  children: ReactNode
  variant?: AnimationVariant
  duration?: keyof typeof TRANSITIONS.duration | number
  delay?: number
  className?: string
  custom?: any
  layout?: boolean
  layoutId?: string
}

/**
 * Generic animated container component
 */
export function AnimatedContainer({
  children,
  variant = 'fade',
  duration = 'normal',
  delay = 0,
  className,
  custom,
  layout,
  layoutId,
  ...props
}: AnimatedComponentProps & HTMLMotionProps<'div'>) {
  const variants = ANIMATION_VARIANTS[variant]
  const transitionDuration = typeof duration === 'number' ? duration : TRANSITIONS.duration[duration]

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={custom}
      layout={layout}
      layoutId={layoutId}
      transition={{
        duration: transitionDuration,
        delay,
        ease: TRANSITIONS.ease.smooth
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade transition component
 */
export function FadeTransition({ children, ...props }: AnimatedComponentProps) {
  return (
    <AnimatedContainer variant="fade" {...props}>
      {children}
    </AnimatedContainer>
  )
}

/**
 * Slide up transition component
 */
export function SlideUpTransition({ children, ...props }: AnimatedComponentProps) {
  return (
    <AnimatedContainer variant="slideUp" {...props}>
      {children}
    </AnimatedContainer>
  )
}

/**
 * Scale transition component
 */
export function ScaleTransition({ children, ...props }: AnimatedComponentProps) {
  return (
    <AnimatedContainer variant="scale" {...props}>
      {children}
    </AnimatedContainer>
  )
}

/**
 * Stagger animation container
 */
interface StaggerContainerProps extends AnimatedComponentProps {
  staggerDelay?: number
  childDelay?: number
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  childDelay = 0.1,
  duration = 'normal',
  className,
  ...props
}: StaggerContainerProps) {
  const transitionDuration = typeof duration === 'number' ? duration : TRANSITIONS.duration[duration]

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: childDelay,
            duration: transitionDuration
          }
        }
      }}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual stagger item
 */
export function StaggerItem({ children, className, ...props }: AnimatedComponentProps) {
  return (
    <motion.div
      className={className}
      variants={ANIMATION_VARIANTS.staggerItem}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Button press animation
 */
export interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  pressScale?: number
  children: ReactNode
}

export function AnimatedButton({
  children,
  pressScale = 0.95,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: pressScale }}
      transition={{
        duration: TRANSITIONS.duration.fast,
        ease: TRANSITIONS.ease.snappy
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * Hover lift animation for cards
 */
export interface HoverLiftProps extends HTMLMotionProps<'div'> {
  liftHeight?: number
  children: ReactNode
}

export function HoverLift({
  children,
  liftHeight = 4,
  className,
  ...props
}: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -liftHeight,
        transition: {
          duration: TRANSITIONS.duration.fast,
          ease: TRANSITIONS.ease.gentle
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Floating animation
 */
export interface FloatingProps extends HTMLMotionProps<'div'> {
  amplitude?: number
  duration?: number
  children: ReactNode
}

export function Floating({
  children,
  amplitude = 10,
  duration = 3,
  className,
  ...props
}: FloatingProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Pulse animation
 */
export interface PulseProps extends HTMLMotionProps<'div'> {
  scale?: [number, number]
  duration?: number
  children: ReactNode
}

export function Pulse({
  children,
  scale = [1, 1.05],
  duration = 2,
  className,
  ...props
}: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [scale[0], scale[1], scale[0]],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shake animation for errors
 */
export interface ShakeProps extends HTMLMotionProps<'div'> {
  intensity?: number
  children: ReactNode
}

export function Shake({ children, intensity = 10, className, ...props }: ShakeProps) {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, -intensity, intensity, -intensity, intensity, 0],
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut'
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Page transition wrapper
 */
export interface PageTransitionProps {
  children: ReactNode
  variant?: AnimationVariant
  className?: string
}

export function PageTransition({
  children,
  variant = 'slideUp',
  className
}: PageTransitionProps) {
  const variants = ANIMATION_VARIANTS[variant]

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        duration: TRANSITIONS.duration.normal,
        ease: TRANSITIONS.ease.smooth
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Modal/Dialog transition wrapper
 */
export interface ModalTransitionProps {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  backdrop?: boolean
  className?: string
}

export function ModalTransition({
  children,
  isOpen,
  onClose,
  backdrop = true,
  className
}: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TRANSITIONS.duration.fast }}
        >
          {backdrop && (
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <motion.div
            className={className}
            variants={ANIMATION_VARIANTS.zoom}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: TRANSITIONS.duration.normal,
              ease: TRANSITIONS.ease.smooth
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Toast notification transition
 */
export interface ToastTransitionProps {
  children: ReactNode
  isVisible: boolean
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right'
}

export function ToastTransition({
  children,
  isVisible,
  position = 'top-right'
}: ToastTransitionProps) {
  const getAnimationVariant = () => {
    switch (position) {
      case 'top':
        return ANIMATION_VARIANTS.slideDown
      case 'bottom':
        return ANIMATION_VARIANTS.slideUp
      case 'top-right':
      case 'bottom-right':
        return ANIMATION_VARIANTS.slideLeft
      default:
        return ANIMATION_VARIANTS.slideDown
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={getAnimationVariant()}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: TRANSITIONS.duration.normal,
            ease: TRANSITIONS.ease.smooth
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * List animation for adding/removing items
 */
export interface AnimatedListProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
}

export function AnimatedList({ children, className, itemClassName }: AnimatedListProps) {
  return (
    <motion.div className={className} layout>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            className={itemClassName}
            variants={ANIMATION_VARIANTS.slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            transition={{
              duration: TRANSITIONS.duration.normal,
              ease: TRANSITIONS.ease.smooth
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Utility to create custom transition components
 */
export function createTransition(variants: Variants, defaultTransition = {}) {
  return function CustomTransition({
    children,
    className,
    ...props
  }: AnimatedComponentProps & HTMLMotionProps<'div'>) {
    return (
      <motion.div
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{
          duration: TRANSITIONS.duration.normal,
          ease: TRANSITIONS.ease.smooth,
          ...defaultTransition
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
}