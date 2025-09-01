import './globals.css'
import { AuthProviderSimple as AuthProvider } from "@/components/auth/auth-provider-simple"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
            />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

