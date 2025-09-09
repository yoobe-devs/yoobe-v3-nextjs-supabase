'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EligibilityBadgeProps {
  isAllowed: boolean
  reason: string
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export function EligibilityBadge({ 
  isAllowed, 
  reason, 
  className,
  showIcon = true,
  variant = 'default'
}: EligibilityBadgeProps) {
  const getBadgeConfig = () => {
    if (isAllowed) {
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'Elegível'
      }
    } else {
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
        icon: <XCircle className="h-3 w-3" />,
        text: 'Bloqueado'
      }
    }
  }

  const config = getBadgeConfig()

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={config.variant}
              className={cn(
                'cursor-help',
                config.className,
                className
              )}
            >
              {showIcon && config.icon}
              <span className="ml-1">{config.text}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge 
          variant={config.variant}
          className={cn(config.className)}
        >
          {showIcon && config.icon}
          <span className="ml-1">{config.text}</span>
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  // Variant 'default'
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={cn(
              'cursor-help',
              config.className,
              className
            )}
          >
            {showIcon && config.icon}
            <span className="ml-1">{config.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ProductTagsDisplayProps {
  tags: Array<{
    key: string
    value: string
    description?: string
    color?: string
  }>
  className?: string
  maxDisplay?: number
}

export function ProductTagsDisplay({ 
  tags, 
  className,
  maxDisplay = 3
}: ProductTagsDisplayProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  const displayTags = tags.slice(0, maxDisplay)
  const remainingCount = tags.length - maxDisplay

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {displayTags.map((tag, index) => (
        <Badge
          key={`${tag.key}-${tag.value}-${index}`}
          variant="outline"
          className="text-xs"
          style={{ 
            borderColor: tag.color || '#3B82F6',
            color: tag.color || '#3B82F6'
          }}
        >
          {tag.key}: {tag.value}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs text-gray-500">
          +{remainingCount} mais
        </Badge>
      )}
    </div>
  )
}

interface EligibilityFilterProps {
  onlyEligible: boolean
  onToggle: (onlyEligible: boolean) => void
  className?: string
}

export function EligibilityFilter({ 
  onlyEligible, 
  onToggle, 
  className 
}: EligibilityFilterProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        type="checkbox"
        id="only-eligible"
        checked={onlyEligible}
        onChange={(e) => onToggle(e.target.checked)}
        className="rounded border-gray-300"
      />
      <label 
        htmlFor="only-eligible" 
        className="text-sm font-medium text-gray-700 cursor-pointer"
      >
        Mostrar apenas elegíveis
      </label>
    </div>
  )
}
