import './globals.css'
import { AuthProviderSimpleFixed as AuthProvider } from '@/components/auth/auth-provider-simple-fixed'
import { NotificationProviderSimple as NotificationProvider } from '@/components/notifications/notification-provider-simple'
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
            <Toaster position="top-right" richColors closeButton />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
