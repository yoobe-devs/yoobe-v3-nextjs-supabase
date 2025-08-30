"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Smartphone, Link, Chrome, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithOTP, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("password")

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await signIn(email, password)
      // Não mostra mensagem de sucesso, o redirecionamento será automático
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await signInWithOTP(email)
      setMessage({ type: 'success', text: 'Código OTP enviado para seu email!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await signInWithMagicLink(email)
      setMessage({ type: 'success', text: 'Link mágico enviado para seu email!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)

    try {
      await signInWithGoogle()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="font-bold text-2xl">Yoobe</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Escolha seu método de autenticação preferido
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticação</CardTitle>
            <CardDescription>
              Acesse sua conta usando qualquer método abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  OTP
                </TabsTrigger>
                <TabsTrigger value="magic" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Link Mágico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar com Senha"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp" className="space-y-4">
                <form onSubmit={handleOTPLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-otp">Email</Label>
                    <Input
                      id="email-otp"
                      name="email-otp"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Código OTP"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="magic" className="space-y-4">
                <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-magic">Email</Label>
                    <Input
                      id="email-magic"
                      name="email-magic"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Link Mágico"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continuar com Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Criar conta
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
