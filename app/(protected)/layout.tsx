"use client"

import { NavigationMenu } from "@/components/navigation-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
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


