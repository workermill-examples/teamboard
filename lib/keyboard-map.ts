/**
 * Centralized keyboard shortcuts configuration for TeamBoard
 * Provides consistent mapping of keyboard shortcuts across the application
 */

export interface KeyboardShortcut {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  context?: string[] // Where this shortcut is active
}

export interface KeyboardShortcuts {
  [key: string]: KeyboardShortcut
}

/**
 * Global keyboard shortcuts available throughout the application
 */
export const GLOBAL_SHORTCUTS: KeyboardShortcuts = {
  // Navigation
  escape: {
    key: 'Escape',
    description: 'Close modal/dialog or clear selection',
    context: ['global']
  },

  // Quick actions
  refresh: {
    key: 'r',
    ctrl: true,
    description: 'Refresh current view',
    context: ['global']
  },

  // Search
  search: {
    key: '/',
    description: 'Focus search input',
    context: ['global']
  }
}

/**
 * Board-specific keyboard shortcuts
 */
export const BOARD_SHORTCUTS: KeyboardShortcuts = {
  // Card operations
  newCard: {
    key: 'n',
    description: 'Create new card in first column',
    context: ['board']
  },

  editCard: {
    key: 'e',
    description: 'Edit selected card',
    context: ['board', 'card-detail']
  },

  deleteCard: {
    key: 'Delete',
    description: 'Delete selected card',
    context: ['board', 'card-detail']
  },

  // Navigation
  nextCard: {
    key: 'ArrowDown',
    description: 'Select next card',
    context: ['board']
  },

  previousCard: {
    key: 'ArrowUp',
    description: 'Select previous card',
    context: ['board']
  },

  nextColumn: {
    key: 'ArrowRight',
    description: 'Move to next column',
    context: ['board']
  },

  previousColumn: {
    key: 'ArrowLeft',
    description: 'Move to previous column',
    context: ['board']
  },

  // Board actions
  addColumn: {
    key: 'c',
    shift: true,
    description: 'Add new column',
    context: ['board']
  },

  toggleFilter: {
    key: 'f',
    description: 'Toggle filter bar',
    context: ['board']
  }
}

/**
 * Card detail modal shortcuts
 */
export const CARD_DETAIL_SHORTCUTS: KeyboardShortcuts = {
  // Save operations
  save: {
    key: 'Enter',
    ctrl: true,
    description: 'Save changes',
    context: ['card-detail']
  },

  // Priority shortcuts
  priority1: {
    key: '1',
    description: 'Set priority to Urgent',
    context: ['card-detail']
  },

  priority2: {
    key: '2',
    description: 'Set priority to High',
    context: ['card-detail']
  },

  priority3: {
    key: '3',
    description: 'Set priority to Medium',
    context: ['card-detail']
  },

  priority4: {
    key: '4',
    description: 'Set priority to Low',
    context: ['card-detail']
  },

  // Quick actions
  addComment: {
    key: 'm',
    shift: true,
    description: 'Add comment',
    context: ['card-detail']
  },

  addChecklist: {
    key: 't',
    shift: true,
    description: 'Add checklist item',
    context: ['card-detail']
  }
}

/**
 * All keyboard shortcuts combined
 */
export const ALL_SHORTCUTS: KeyboardShortcuts = {
  ...GLOBAL_SHORTCUTS,
  ...BOARD_SHORTCUTS,
  ...CARD_DETAIL_SHORTCUTS
}

/**
 * Utility function to check if a keyboard event matches a shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // Normalize key comparison
  const eventKey = event.key === ' ' ? 'Space' : event.key
  const shortcutKey = shortcut.key === ' ' ? 'Space' : shortcut.key

  if (eventKey.toLowerCase() !== shortcutKey.toLowerCase()) {
    return false
  }

  // Check modifiers
  const ctrlPressed = event.ctrlKey || event.metaKey // Meta key for Mac compatibility
  const shiftPressed = event.shiftKey
  const altPressed = event.altKey

  if (shortcut.ctrl && !ctrlPressed) return false
  if (shortcut.shift && !shiftPressed) return false
  if (shortcut.alt && !altPressed) return false

  // If no modifiers specified, ensure none are pressed (except for special keys)
  if (!shortcut.ctrl && !shortcut.shift && !shortcut.alt) {
    if (ctrlPressed || shiftPressed || altPressed) {
      // Allow modifier keys for special navigation keys
      const specialKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter', 'Delete']
      if (!specialKeys.includes(shortcut.key)) {
        return false
      }
    }
  }

  return true
}

/**
 * Check if an element should prevent keyboard shortcuts
 */
export function shouldIgnoreKeyboard(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false
  }

  // Ignore shortcuts when typing in input fields
  const inputElements = ['INPUT', 'TEXTAREA', 'SELECT']
  if (inputElements.includes(target.tagName)) {
    return true
  }

  // Ignore when element is contentEditable
  if (target.contentEditable === 'true') {
    return true
  }

  // Ignore when inside a data-ignore-shortcuts container
  if (target.closest('[data-ignore-shortcuts]')) {
    return true
  }

  return false
}

/**
 * Get shortcuts for a specific context
 */
export function getShortcutsForContext(context: string): KeyboardShortcuts {
  const contextShortcuts: KeyboardShortcuts = {}

  Object.entries(ALL_SHORTCUTS).forEach(([key, shortcut]) => {
    if (!shortcut.context || shortcut.context.includes(context) || shortcut.context.includes('global')) {
      contextShortcuts[key] = shortcut
    }
  })

  return contextShortcuts
}

/**
 * Format shortcut for display (e.g., "Ctrl+N", "Shift+T")
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrl) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
  }

  if (shortcut.shift) {
    parts.push('⇧')
  }

  if (shortcut.alt) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt')
  }

  // Format special keys
  let key = shortcut.key
  switch (shortcut.key) {
    case 'ArrowUp':
      key = '↑'
      break
    case 'ArrowDown':
      key = '↓'
      break
    case 'ArrowLeft':
      key = '←'
      break
    case 'ArrowRight':
      key = '→'
      break
    case 'Escape':
      key = 'Esc'
      break
    case 'Delete':
      key = 'Del'
      break
    case ' ':
      key = 'Space'
      break
    default:
      // Capitalize single letters
      if (key.length === 1) {
        key = key.toUpperCase()
      }
  }

  parts.push(key)

  return parts.join('+')
}