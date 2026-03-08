'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { BoardAssignee, BoardLabel } from '@/hooks/use-board'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AssigneePicker, PriorityPicker, LabelPicker, DueDatePicker } from './pickers'

export interface FilterOptions {
  search: string
  assigneeIds: string[]
  priorities: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[]
  labelIds: string[]
  dueDateFilter: 'all' | 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'no_date'
}

interface FilterBarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableAssignees: BoardAssignee[]
  availableLabels: BoardLabel[]
  className?: string
}

export function FilterBar({
  filters,
  onFiltersChange,
  availableAssignees,
  availableLabels,
  className
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  // Check if any filters are active (excluding search)
  const hasActiveFilters = filters.assigneeIds.length > 0 ||
    filters.priorities.length > 0 ||
    filters.labelIds.length > 0 ||
    filters.dueDateFilter !== 'all'

  // Get selected items for display
  const selectedAssignees = availableAssignees.filter(a => filters.assigneeIds.includes(a.id))
  const selectedLabels = availableLabels.filter(l => filters.labelIds.includes(l.id))

  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      assigneeIds: [],
      priorities: [],
      labelIds: [],
      dueDateFilter: 'all'
    })
  }

  const dueDateOptions = [
    { value: 'all' as const, label: 'All cards' },
    { value: 'overdue' as const, label: 'Overdue' },
    { value: 'today' as const, label: 'Due today' },
    { value: 'tomorrow' as const, label: 'Due tomorrow' },
    { value: 'this_week' as const, label: 'Due this week' },
    { value: 'no_date' as const, label: 'No due date' },
  ]

  const selectedDueDate = dueDateOptions.find(opt => opt.value === filters.dueDateFilter)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search cards..."
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-600 hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'relative',
            (hasActiveFilters || showFilters) && 'border-primary-500 bg-primary-50'
          )}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-600 hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary-50 rounded-lg border">
          {/* Assignee Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-700">Assignee:</span>
            <AssigneePicker
              value={selectedAssignees[0] || null}
              onChange={(assignee) => {
                updateFilters({
                  assigneeIds: assignee ? [assignee.id] : []
                })
              }}
              availableAssignees={availableAssignees}
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-700">Priority:</span>
            <PriorityPicker
              value={filters.priorities[0] || 'MEDIUM'}
              onChange={(priority) => {
                const isSelected = filters.priorities.includes(priority)
                updateFilters({
                  priorities: isSelected ? [] : [priority]
                })
              }}
            />
          </div>

          {/* Labels Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-700">Labels:</span>
            <LabelPicker
              selectedLabels={selectedLabels}
              availableLabels={availableLabels}
              onChange={(labels) => {
                updateFilters({
                  labelIds: labels.map(l => l.id)
                })
              }}
            />
          </div>

          {/* Due Date Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-700">Due date:</span>
            <div className="relative">
              <select
                value={filters.dueDateFilter}
                onChange={(e) => updateFilters({
                  dueDateFilter: e.target.value as FilterOptions['dueDateFilter']
                })}
                className="appearance-none bg-white border border-border rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {dueDateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-700">Active filters:</span>

          {/* Selected Assignees */}
          {selectedAssignees.map((assignee) => (
            <div
              key={assignee.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700 border border-primary-200"
            >
              <span className="mr-1">👤 {assignee.name}</span>
              <button
                onClick={() => updateFilters({
                  assigneeIds: filters.assigneeIds.filter(id => id !== assignee.id)
                })}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </div>
          ))}

          {/* Selected Priorities */}
          {filters.priorities.map((priority) => (
            <div
              key={priority}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning-100 text-warning-700 border border-warning-200"
            >
              <span className="mr-1">⚡ {priority}</span>
              <button
                onClick={() => updateFilters({
                  priorities: filters.priorities.filter(p => p !== priority)
                })}
                className="ml-1 text-warning-600 hover:text-warning-800"
              >
                ×
              </button>
            </div>
          ))}

          {/* Selected Labels */}
          {selectedLabels.map((label) => (
            <div
              key={label.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs text-white border border-opacity-20"
              style={{ backgroundColor: label.color }}
            >
              <span className="mr-1">🏷️ {label.name}</span>
              <button
                onClick={() => updateFilters({
                  labelIds: filters.labelIds.filter(id => id !== label.id)
                })}
                className="ml-1 hover:text-opacity-80"
              >
                ×
              </button>
            </div>
          ))}

          {/* Due Date Filter */}
          {filters.dueDateFilter !== 'all' && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-700 border border-secondary-200">
              <span className="mr-1">📅 {selectedDueDate?.label}</span>
              <button
                onClick={() => updateFilters({ dueDateFilter: 'all' })}
                className="ml-1 text-secondary-600 hover:text-secondary-800"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}