'use client'

import { useState } from 'react'
import Header from '@/components/layout/header'
import Sidebar, { getStoreSidebarItems } from '@/components/layout/sidebar'

interface StoreLayoutProps {
  children: React.ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Mock user data for demonstration
  const mockUser = {
    name: 'Maria Santos',
    email: 'maria.santos@techcorp.com',
    role: 'funcionario' as const,
    company_name: 'TechCorp Brasil'
  }

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked')
  }

  const handleProfile = () => {
    // Navigate to profile
    console.log('Profile clicked')
  }

  const handleSettings = () => {
    // Navigate to settings
    console.log('Settings clicked')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        user={mockUser}
        notifications={1}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          items={getStoreSidebarItems()}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={sidebarCollapsed ? 'w-16' : 'w-64'}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
