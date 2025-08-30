"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log('AuthCallback: Page loaded')
    console.log('AuthCallback: Current user:', user)
    console.log('AuthCallback: Loading:', loading)
    
    const handleCallback = async () => {
      try {
        // Aguarda o carregamento da autenticação
        if (loading) {
          console.log('AuthCallback: Still loading, waiting...')
          return
        }
        
        if (user) {
          console.log('AuthCallback: User authenticated:', user.email)
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Redireciona baseado no email
          setTimeout(() => {
            if (user.email === 'admin@yoobe.co') {
              router.push('/admin/dashboard')
            } else if (user.email === 'gestor@jointecnologia.com') {
              router.push('/gestor/dashboard')
            } else if (user.email === 'user@jointecnologia.com') {
              router.push('/store/dashboard')
            } else {
              router.push('/choose-environment')
            }
          }, 2000)
        } else {
          console.log('AuthCallback: No user found, redirecting to login')
          setStatus('error')
          setMessage('Authentication failed. Redirecting to login...')
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        }
      } catch (error) {
        console.error('AuthCallback: Error:', error)
        setStatus('error')
        setMessage('Authentication error. Redirecting to login...')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    }

    handleCallback()
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">Y</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Processing Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-green-600 font-medium">Success!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-red-600 font-medium">Error</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Information:</h3>
            <p className="text-sm text-gray-600">Status: {status}</p>
            <p className="text-sm text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600">User: {user ? user.email : 'None'}</p>
            <p className="text-sm text-gray-600">URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
