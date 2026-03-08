'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  KeyboardShortcut,
  matchesShortcut,
  shouldIgnoreKeyboard,
  getShortcutsForContext
} from '@/lib/keyboard-map'

export interface ShortcutHandler {
  (event: KeyboardEvent): void | boolean // Return false to prevent default
}

export interface ShortcutConfig {
  shortcut: KeyboardShortcut
  handler: ShortcutHandler
  enabled?: boolean
  preventDefault?: boolean
}

export interface UseKeyboardShortcutsOptions {
  context?: string
  enabled?: boolean
  ignoreWhenTyping?: boolean
}

/**
 * Hook for handling keyboard shortcuts with context awareness
 *
 * @param shortcuts - Object mapping shortcut names to configurations
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const shortcuts = {
 *   newCard: {
 *     shortcut: BOARD_SHORTCUTS.newCard,
 *     handler: () => handleNewCard(),
 *     preventDefault: true
 *   },
 *   deleteCard: {
 *     shortcut: BOARD_SHORTCUTS.deleteCard,
 *     handler: () => selectedCard && handleDeleteCard(),
 *     enabled: !!selectedCard
 *   }
 * }
 *
 * useKeyboardShortcuts(shortcuts, { context: 'board' })
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, ShortcutConfig>,
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    context = 'global',
    enabled = true,
    ignoreWhenTyping = true
  } = options

  const shortcutsRef = useRef(shortcuts)
  const optionsRef = useRef(options)

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentShortcuts = shortcutsRef.current
    const currentOptions = optionsRef.current

    // Check if shortcuts are enabled
    if (!currentOptions.enabled) {
      return
    }

    // Ignore if typing in input fields
    if (currentOptions.ignoreWhenTyping && shouldIgnoreKeyboard(event.target)) {
      return
    }

    // Check each shortcut
    Object.entries(currentShortcuts).forEach(([name, config]) => {
      const { shortcut, handler, enabled: shortcutEnabled = true, preventDefault = true } = config

      // Skip if this shortcut is disabled
      if (!shortcutEnabled) {
        return
      }

      // Check if shortcut matches
      if (matchesShortcut(event, shortcut)) {
        // Check if shortcut is valid in current context
        if (shortcut.context && !shortcut.context.includes(currentOptions.context || 'global')) {
          return
        }

        // Call handler
        const result = handler(event)

        // Prevent default unless handler explicitly returns false
        if (preventDefault && result !== false) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}

/**
 * Hook for a single keyboard shortcut
 *
 * @param shortcut - The keyboard shortcut configuration
 * @param handler - Function to call when shortcut is triggered
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * useKeyboardShortcut(
 *   BOARD_SHORTCUTS.newCard,
 *   () => handleNewCard(),
 *   { context: 'board' }
 * )
 * ```
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: ShortcutHandler,
  options: UseKeyboardShortcutsOptions & {
    enabled?: boolean
    preventDefault?: boolean
  } = {}
) {
  const { enabled = true, preventDefault = true, ...shortcutOptions } = options

  const shortcuts = {
    single: {
      shortcut,
      handler,
      enabled,
      preventDefault
    }
  }

  useKeyboardShortcuts(shortcuts, shortcutOptions)
}

/**
 * Hook that provides context-aware shortcuts with common handlers
 *
 * @param context - The context name to get shortcuts for
 * @param handlers - Object mapping shortcut names to handler functions
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const handlers = {
 *   newCard: () => handleNewCard(),
 *   editCard: () => selectedCard && handleEditCard(),
 *   deleteCard: () => selectedCard && handleDeleteCard()
 * }
 *
 * useContextualShortcuts('board', handlers)
 * ```
 */
export function useContextualShortcuts(
  contextName: string,
  handlers: Record<string, ShortcutHandler>,
  options: UseKeyboardShortcutsOptions = {}
) {
  const contextShortcuts = getShortcutsForContext(contextName)

  const shortcuts: Record<string, ShortcutConfig> = {}

  Object.entries(handlers).forEach(([name, handler]) => {
    const shortcut = contextShortcuts[name]
    if (shortcut) {
      shortcuts[name] = {
        shortcut,
        handler,
        preventDefault: true
      }
    }
  })

  useKeyboardShortcuts(shortcuts, { ...options, context: contextName })
}

/**
 * Hook for managing card navigation with keyboard
 * Provides arrow key navigation for card selection
 *
 * @param cards - Array of cards to navigate
 * @param selectedIndex - Current selected card index
 * @param onSelectionChange - Callback when selection changes
 * @param options - Configuration options
 */
export function useCardNavigation(
  cards: Array<{ id: string }>,
  selectedIndex: number,
  onSelectionChange: (index: number) => void,
  options: UseKeyboardShortcutsOptions = {}
) {
  const shortcuts = {
    nextCard: {
      shortcut: { key: 'ArrowDown', description: 'Next card' },
      handler: () => {
        if (selectedIndex < cards.length - 1) {
          onSelectionChange(selectedIndex + 1)
        }
      }
    },
    previousCard: {
      shortcut: { key: 'ArrowUp', description: 'Previous card' },
      handler: () => {
        if (selectedIndex > 0) {
          onSelectionChange(selectedIndex - 1)
        }
      }
    },
    firstCard: {
      shortcut: { key: 'Home', description: 'First card' },
      handler: () => {
        if (cards.length > 0) {
          onSelectionChange(0)
        }
      }
    },
    lastCard: {
      shortcut: { key: 'End', description: 'Last card' },
      handler: () => {
        if (cards.length > 0) {
          onSelectionChange(cards.length - 1)
        }
      }
    }
  }

  useKeyboardShortcuts(shortcuts, { ...options, context: 'navigation' })
}

/**
 * Hook for managing form shortcuts
 * Provides common form-related keyboard shortcuts
 *
 * @param options - Configuration options
 * @param onSave - Save handler
 * @param onCancel - Cancel handler
 */
export function useFormShortcuts(
  options: UseKeyboardShortcutsOptions & {
    onSave?: () => void
    onCancel?: () => void
    saveEnabled?: boolean
    cancelEnabled?: boolean
  }
) {
  const {
    onSave,
    onCancel,
    saveEnabled = true,
    cancelEnabled = true,
    ...shortcutOptions
  } = options

  const shortcuts: Record<string, ShortcutConfig> = {}

  if (onSave) {
    shortcuts.save = {
      shortcut: { key: 'Enter', ctrl: true, description: 'Save' },
      handler: onSave,
      enabled: saveEnabled,
      preventDefault: true
    }
  }

  if (onCancel) {
    shortcuts.cancel = {
      shortcut: { key: 'Escape', description: 'Cancel' },
      handler: onCancel,
      enabled: cancelEnabled,
      preventDefault: true
    }
  }

  useKeyboardShortcuts(shortcuts, { ...shortcutOptions, context: 'form' })
}

/**
 * Utility to get available shortcuts for help displays
 */
export function getAvailableShortcuts(
  context?: string
): Array<{ name: string; shortcut: KeyboardShortcut }> {
  const contextShortcuts = context ? getShortcutsForContext(context) : getShortcutsForContext('global')

  return Object.entries(contextShortcuts).map(([name, shortcut]) => ({
    name,
    shortcut
  }))
}