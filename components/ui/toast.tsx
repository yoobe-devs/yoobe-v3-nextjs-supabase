"use client"

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  onDismiss: (id: string) => void
}

const variantStyles = {
  default: 'bg-white border-gray-200 text-gray-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-green-50 border-green-200 text-green-900'
}

const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle
}

export function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = variantIcons[variant]

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(id), 150)
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm transform transition-all duration-200 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className={cn(
        'rounded-lg border p-4 shadow-lg',
        variantStyles[variant]
      )}>
        <div className="flex items-start space-x-3">
          <Icon className={cn(
            'h-5 w-5 mt-0.5',
            variant === 'default' && 'text-blue-600',
            variant === 'destructive' && 'text-red-600',
            variant === 'success' && 'text-green-600'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="text-sm mt-1 opacity-90">{description}</p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: { toasts: any[], onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
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
