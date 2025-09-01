"use client"

import { GestorNavigationMenu } from "@/components/gestor-navigation-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <GestorNavigationMenu />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}


