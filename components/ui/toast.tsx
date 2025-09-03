'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  onDismiss: (id: string) => void
}

const toastVariants = {
  default: {
    icon: Info,
    className: 'bg-white border-gray-200 text-gray-900'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-900'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900'
  },
  destructive: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-900'
  }
}

export function Toast({ id, title, description, variant = 'default', duration = 5000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  
  const variantConfig = toastVariants[variant]
  const Icon = variantConfig.icon

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Animar progresso
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressTimer)
          return 0
        }
        return prev - (100 / (duration / 100))
      })
    }, 100)

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
      clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(id), 300)
  }

  return (
    <div
      className={cn(
        'relative w-full max-w-sm bg-white border rounded-lg shadow-lg transition-all duration-300 ease-in-out',
        variantConfig.className,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={cn(
            'h-5 w-5',
            variant === 'success' && 'text-green-600',
            variant === 'warning' && 'text-yellow-600',
            variant === 'destructive' && 'text-red-600',
            variant === 'default' && 'text-blue-600'
          )} />
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className={cn(
              'inline-flex rounded-md p-1.5 transition-colors',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              variant === 'success' && 'hover:bg-green-100',
              variant === 'warning' && 'hover:bg-yellow-100',
              variant === 'destructive' && 'hover:bg-red-100'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: { toasts: any[], onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

