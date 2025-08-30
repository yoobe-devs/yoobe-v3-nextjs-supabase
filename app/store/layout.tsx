"use client"

import { StoreNavigationMenu } from "@/components/store-navigation-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <StoreNavigationMenu />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}


