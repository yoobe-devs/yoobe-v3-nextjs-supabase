import React from 'react'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 ${className}`}
    >
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <Icon className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{description}</p>
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {primaryAction && (
              <Button onClick={primaryAction.onClick}>
                {primaryAction.icon && (
                  <primaryAction.icon className="h-4 w-4 mr-2" />
                )}
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.icon && (
                  <secondaryAction.icon className="h-4 w-4 mr-2" />
                )}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
