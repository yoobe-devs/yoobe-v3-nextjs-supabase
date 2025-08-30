"use client"

import { AdminNavigationMenu } from "@/components/admin-navigation-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AdminNavigationMenu />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
