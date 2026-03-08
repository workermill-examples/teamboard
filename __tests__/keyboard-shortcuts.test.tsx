/**
 * Basic usage examples and integration tests for keyboard shortcuts and animations
 * This file demonstrates how the new components should be used
 */

// Example 1: Using keyboard shortcuts in a board component
const ExampleBoardComponent = () => {
  // Using the contextual shortcuts hook
  const handlers = {
    newCard: () => console.log('Creating new card...'),
    editCard: () => console.log('Editing card...'),
    deleteCard: () => console.log('Deleting card...'),
    nextCard: () => console.log('Next card selected'),
    previousCard: () => console.log('Previous card selected'),
  }

  // This would be imported from: import { useContextualShortcuts } from '@/hooks/use-keyboard-shortcuts'
  // useContextualShortcuts('board', handlers)

  return null // JSX would go here
}

// Example 2: Using single keyboard shortcut
const ExampleModalComponent = () => {
  // This would be imported from: import { useKeyboardShortcut, GLOBAL_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts'
  // useKeyboardShortcut(
  //   GLOBAL_SHORTCUTS.escape,
  //   () => setModalOpen(false),
  //   { context: 'modal' }
  // )

  return null // JSX would go here
}

// Example 3: Using animated counter
const ExampleDashboardComponent = () => {
  // This would be imported from: import { AnimatedCounter } from '@/components/ui/animated-counter'

  // Basic counter
  // <AnimatedCounter value={42} />

  // Formatted counter
  // <AnimatedCounter
  //   value={1500}
  //   formatValue={(n) => `$${n.toLocaleString()}`}
  //   duration={1500}
  // />

  // Progress counter
  // <ProgressCounter value={75} max={100} showPercentage />

  return null // JSX would go here
}

// Example 4: Using transitions
const ExamplePageComponent = () => {
  // This would be imported from: import { SlideUpTransition, StaggerContainer, StaggerItem } from '@/components/ui/transitions'

  // Page transition
  // <SlideUpTransition>
  //   <div>Page content</div>
  // </SlideUpTransition>

  // Stagger animation
  // <StaggerContainer>
  //   {items.map((item) => (
  //     <StaggerItem key={item.id}>
  //       {item.content}
  //     </StaggerItem>
  //   ))}
  // </StaggerContainer>

  return null // JSX would go here
}

// Example 5: Complete integration in a card detail modal
const ExampleCardDetailModal = () => {
  // Combined usage of shortcuts and animations

  // Keyboard shortcuts for modal actions
  // useFormShortcuts({
  //   onSave: () => handleSave(),
  //   onCancel: () => handleClose(),
  //   context: 'card-detail'
  // })

  // Modal with transition animation
  // <ModalTransition isOpen={isOpen} onClose={handleClose}>
  //   <div className="p-6">
  //     <h2>Card Details</h2>
  //     <AnimatedCounter value={cardStats.comments} />
  //   </div>
  // </ModalTransition>

  return null // JSX would go here
}

export {
  ExampleBoardComponent,
  ExampleModalComponent,
  ExampleDashboardComponent,
  ExamplePageComponent,
  ExampleCardDetailModal
}