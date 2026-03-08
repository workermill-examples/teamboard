'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { validateRedirectUrl, formatAuthError, type LoginFormData, type SignupFormData } from '@/lib/client-utils'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const user = session?.user
  const isLoading = status === 'loading'
  const isAuthenticated = !!user && status === 'authenticated'

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/')
  }, [router])

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
    updateSession: update,
  }
}

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const login = useCallback(async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(formatAuthError(result.error))
        return false
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl')
        const redirectUrl = validateRedirectUrl(callbackUrl || '', window.location.origin)
        router.push(redirectUrl)
        return true
      }

      return false
    } catch (err) {
      setError('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [router, searchParams])

  return {
    login,
    loading,
    error,
    clearError: () => setError(null),
  }
}

export function useSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signup = useCallback(async (data: SignupFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Call the signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Signup failed')
        return false
      }

      // If signup successful, sign them in
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('Account created but login failed. Please try signing in.')
        return false
      }

      if (signInResult?.ok) {
        router.push('/workspaces')
        return true
      }

      return false
    } catch (err) {
      setError('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [router])

  return {
    signup,
    loading,
    error,
    clearError: () => setError(null),
  }
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && !isAuthenticated) {
    router.push('/login')
  }

  return { isAuthenticated, isLoading }
}

export function useRedirectIfAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && isAuthenticated) {
    router.push('/workspaces')
  }

  return { isAuthenticated, isLoading }
}