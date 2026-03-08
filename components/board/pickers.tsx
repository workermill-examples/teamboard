'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { BoardAssignee, BoardLabel } from '@/hooks/use-board'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

function Dropdown({ trigger, children, open, onOpenChange, className }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onOpenChange])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <div onClick={() => onOpenChange(!open)}>
        {trigger}
      </div>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-lg border bg-card shadow-lg animate-in fade-in-0 zoom-in-95">
          {children}
        </div>
      )}
    </div>
  )
}

interface PriorityPickerProps {
  value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  onChange: (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => void
  disabled?: boolean
}

export function PriorityPicker({ value, onChange, disabled }: PriorityPickerProps) {
  const [open, setOpen] = useState(false)

  const priorities = [
    { value: 'LOW' as const, label: 'Low', color: 'bg-muted-500' },
    { value: 'MEDIUM' as const, label: 'Medium', color: 'bg-primary-500' },
    { value: 'HIGH' as const, label: 'High', color: 'bg-warning-500' },
    { value: 'URGENT' as const, label: 'Urgent', color: 'bg-destructive-500' },
  ]

  const currentPriority = priorities.find(p => p.value === value)

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="justify-start h-8 px-3"
        >
          <div className={cn('w-2 h-2 rounded-full mr-2', currentPriority?.color)} />
          {currentPriority?.label}
          <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      }
    >
      <div className="p-1">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            onClick={() => {
              onChange(priority.value)
              setOpen(false)
            }}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary-100 transition-colors',
              value === priority.value && 'bg-secondary-100'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-2', priority.color)} />
            {priority.label}
          </button>
        ))}
      </div>
    </Dropdown>
  )
}

interface AssigneePickerProps {
  value: BoardAssignee | null
  onChange: (assignee: BoardAssignee | null) => void
  availableAssignees: BoardAssignee[]
  disabled?: boolean
}

export function AssigneePicker({ value, onChange, availableAssignees, disabled }: AssigneePickerProps) {
  const [open, setOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="justify-start h-8 px-3"
        >
          {value ? (
            <>
              <div className="w-4 h-4 rounded-full bg-primary-500 text-primary-50 text-xs font-medium flex items-center justify-center mr-2">
                {value.avatar ? (
                  <img
                    src={value.avatar}
                    alt={value.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(value.name)
                )}
              </div>
              {value.name}
            </>
          ) : (
            'No assignee'
          )}
          <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      }
    >
      <div className="p-1">
        <button
          onClick={() => {
            onChange(null)
            setOpen(false)
          }}
          className={cn(
            'w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary-100 transition-colors',
            !value && 'bg-secondary-100'
          )}
        >
          <div className="w-4 h-4 rounded border border-border mr-2 bg-muted-100" />
          No assignee
        </button>
        {availableAssignees.map((assignee) => (
          <button
            key={assignee.id}
            onClick={() => {
              onChange(assignee)
              setOpen(false)
            }}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary-100 transition-colors',
              value?.id === assignee.id && 'bg-secondary-100'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-primary-500 text-primary-50 text-xs font-medium flex items-center justify-center mr-2">
              {assignee.avatar ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(assignee.name)
              )}
            </div>
            {assignee.name}
          </button>
        ))}
      </div>
    </Dropdown>
  )
}

interface DueDatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  disabled?: boolean
}

export function DueDatePicker({ value, onChange, disabled }: DueDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value ? format(new Date(value), 'yyyy-MM-dd') : '')

  const quickOptions = [
    { label: 'Today', value: new Date() },
    { label: 'Tomorrow', value: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Next Week', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  ]

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value
    setInputValue(dateValue)
    onChange(dateValue ? new Date(dateValue).toISOString() : null)
    setOpen(false)
  }

  const handleQuickOption = (date: Date) => {
    const isoDate = date.toISOString()
    setInputValue(format(date, 'yyyy-MM-dd'))
    onChange(isoDate)
    setOpen(false)
  }

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="justify-start h-8 px-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {value ? format(new Date(value), 'MMM d, yyyy') : 'No due date'}
          <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      }
    >
      <div className="p-3">
        <div className="space-y-2">
          <Input
            type="date"
            value={inputValue}
            onChange={handleDateChange}
            className="w-full"
          />
          <div className="border-t pt-2">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleQuickOption(option.value)}
                className="w-full text-left px-2 py-1 text-sm rounded hover:bg-secondary-100 transition-colors"
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => {
                onChange(null)
                setInputValue('')
                setOpen(false)
              }}
              className="w-full text-left px-2 py-1 text-sm rounded hover:bg-secondary-100 transition-colors text-destructive"
            >
              Clear due date
            </button>
          </div>
        </div>
      </div>
    </Dropdown>
  )
}

interface LabelPickerProps {
  selectedLabels: BoardLabel[]
  availableLabels: BoardLabel[]
  onChange: (labels: BoardLabel[]) => void
  disabled?: boolean
}

export function LabelPicker({ selectedLabels, availableLabels, onChange, disabled }: LabelPickerProps) {
  const [open, setOpen] = useState(false)

  const toggleLabel = (label: BoardLabel) => {
    const isSelected = selectedLabels.some(l => l.id === label.id)
    if (isSelected) {
      onChange(selectedLabels.filter(l => l.id !== label.id))
    } else {
      onChange([...selectedLabels, label])
    }
  }

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="justify-start h-8 px-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {selectedLabels.length > 0 ? `${selectedLabels.length} labels` : 'No labels'}
          <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      }
    >
      <div className="p-1 max-h-60 overflow-y-auto">
        {availableLabels.map((label) => {
          const isSelected = selectedLabels.some(l => l.id === label.id)
          return (
            <button
              key={label.id}
              onClick={() => toggleLabel(label)}
              className={cn(
                'w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary-100 transition-colors',
                isSelected && 'bg-secondary-100'
              )}
            >
              <div
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: label.color }}
              />
              <span className="flex-1 text-left">{label.name}</span>
              {isSelected && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
        {availableLabels.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-600">No labels available</div>
        )}
      </div>
    </Dropdown>
  )
}

interface CoverColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
  disabled?: boolean
}

export function CoverColorPicker({ value, onChange, disabled }: CoverColorPickerProps) {
  const [open, setOpen] = useState(false)

  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#ec4899', // pink
    '#f43f5e', // rose
  ]

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="justify-start h-8 px-3"
        >
          {value ? (
            <div
              className="w-4 h-4 rounded mr-2 border border-border"
              style={{ backgroundColor: value }}
            />
          ) : (
            <div className="w-4 h-4 rounded mr-2 border border-border bg-muted-100" />
          )}
          Cover color
          <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      }
    >
      <div className="p-3">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChange(color)
                setOpen(false)
              }}
              className={cn(
                'w-6 h-6 rounded border-2 transition-all',
                value === color ? 'border-foreground scale-110' : 'border-border hover:scale-105'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button
          onClick={() => {
            onChange(null)
            setOpen(false)
          }}
          className="w-full text-left px-2 py-1 text-sm rounded hover:bg-secondary-100 transition-colors text-destructive"
        >
          Remove cover
        </button>
      </div>
    </Dropdown>
  )
}