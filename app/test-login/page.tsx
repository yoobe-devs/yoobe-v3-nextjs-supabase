"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@yoobe.co')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState({
    currentUrl: '',
    userAgent: ''
  })
  const { signIn, signInWithOTP, signInWithGoogle, user, loading: authLoading, error: authError } = useAuth()

  useEffect(() => {
    setMounted(true)
    // Definir informações de debug apenas no cliente
    setDebugInfo({
      currentUrl: window.location.href,
      userAgent: window.navigator.userAgent
    })
    console.log('TestLoginPage: Component mounted')
    console.log('TestLoginPage: User:', user)
    console.log('TestLoginPage: Loading:', authLoading)
    console.log('TestLoginPage: Error:', authError)
  }, [user, authLoading, authError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('TestLoginPage: Attempting login with:', email, password)
      await signIn(email, password)
      setMessage('Login successful! Check console for details.')
    } catch (error: any) {
      console.error('TestLoginPage: Login error:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOTP = async () => {
    setLoading(true)
    setMessage('')

    try {
      console.log('TestLoginPage: Attempting OTP login with:', email)
      await signInWithOTP(email)
      setMessage('OTP email sent! Check your inbox or Inbucket.')
    } catch (error: any) {
      console.error('TestLoginPage: OTP error:', error)
      setMessage(`OTP Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setMessage('')

    try {
      console.log('TestLoginPage: Attempting Google login')
      await signInWithGoogle()
      setMessage('Google OAuth initiated!')
    } catch (error: any) {
      console.error('TestLoginPage: Google error:', error)
      setMessage(`Google Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Não renderizar até o componente estar montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Test Login Page
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Test the login functionality with detailed logs
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || authLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Sign in with Password'}
              </button>

              <button
                type="button"
                onClick={handleOTP}
                disabled={loading || authLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send OTP Email
              </button>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || authLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Sign in with Google
              </button>
            </div>
          </form>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          {authError && (
            <div className="p-4 bg-red-50 rounded-md">
              <h3 className="text-sm font-medium text-red-900 mb-2">Auth Error:</h3>
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status:</h3>
            <p className="text-sm text-gray-600">Loading: {authLoading ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600">User: {user ? user.email : 'None'}</p>
            <p className="text-sm text-gray-600">User ID: {user ? user.id : 'None'}</p>
            <p className="text-sm text-gray-600">User Created: {user ? new Date(user.created_at).toLocaleString() : 'None'}</p>
            <p className="text-sm text-gray-600">Last Sign In: {user ? new Date(user.last_sign_in_at || user.created_at).toLocaleString() : 'None'}</p>
          </div>

          {user && (
            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <h3 className="text-sm font-medium text-green-900 mb-2">Success! User is logged in.</h3>
              <p className="text-sm text-green-700">Email: {user.email}</p>
              <p className="text-sm text-green-700">ID: {user.id}</p>
              <div className="mt-4 space-y-2">
                <a
                  href="/admin/dashboard"
                  className="block w-full text-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Admin Dashboard
                </a>
                <a
                  href="/choose-environment"
                  className="block w-full text-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Choose Environment
                </a>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Debug Information:</h3>
            <p className="text-sm text-blue-700">Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p className="text-sm text-blue-700">App URL: {process.env.NEXT_PUBLIC_APP_URL}</p>
            <p className="text-sm text-blue-700">Current URL: {debugInfo.currentUrl}</p>
            <p className="text-sm text-blue-700">User Agent: {debugInfo.userAgent}</p>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Open browser console (F12) to see detailed logs</li>
              <li>• Check Inbucket at http://localhost:54324 for OTP emails</li>
              <li>• For Google OAuth, configure credentials in .env.local</li>
              <li>• Test users: admin@yoobe.co/admin123, gestor@jointecnologia.com/gestor123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
