"use client"

import { usePathname } from "next/navigation"
import { NavigationMenu } from "@/components/navigation-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface AppContentProps {
  children: React.ReactNode
}

export function AppContent({ children }: AppContentProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/auth')
  const isPublicStoreRoute = pathname?.startsWith('/store')

  // Debug: log the pathname
  console.log('AppContent pathname:', pathname, 'isAuthRoute:', isAuthRoute)

  if (isAuthRoute || isPublicStoreRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <NavigationMenu />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
