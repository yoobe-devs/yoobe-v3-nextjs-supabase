'use client'

import { useState } from 'react'
import Header from '@/components/layout/header'
import Sidebar, { getGestorSidebarItems } from '@/components/layout/sidebar'

interface GestorLayoutProps {
  children: React.ReactNode
}

export default function GestorLayout({ children }: GestorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Usuário mock para desenvolvimento
  const user = {
    name: 'Gestor Yoobe',
    email: 'gestor@yoobe.com',
    role: 'manager',
    company_name: 'Yoobe',
  }

  const handleLogout = async () => {
    try {
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const handleProfile = () => {
    console.log('Profile clicked')
  }

  const handleSettings = () => {
    console.log('Settings clicked')
  }

  // Monta itens do sidebar com badges estáticas
  const baseItems = getGestorSidebarItems()
  const items = baseItems.map(it => {
    return it
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        user={user}
        notifications={3}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          items={items}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={sidebarCollapsed ? 'w-16' : 'w-64'}
        />

        {/* Main Content */}
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
