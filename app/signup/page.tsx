'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSignup, useRedirectIfAuthenticated } from '@/hooks/use-auth'
import { validateSignupForm, type SignupFormData } from '@/lib/client-utils'

function SignupForm() {
  const { signup, loading, error, clearError } = useSignup()
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) clearError()
    setFieldErrors({})
  }, [formData, error, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setFieldErrors({})

    // Validate form
    const validationErrors = validateSignupForm(formData)
    if (validationErrors.length > 0) {
      const errorMap = validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message
        return acc
      }, {} as Record<string, string>)
      setFieldErrors(errorMap)
      return
    }

    await signup(formData)
  }

  const handleChange = (field: keyof SignupFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              Join TeamBoard and start collaborating with your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={fieldErrors.name}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={fieldErrors.email}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={fieldErrors.password}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <p className="text-xs text-muted-500">
                  Must be at least 8 characters long
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive-50 p-3">
                  <p className="text-sm text-destructive-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center">
            <p className="text-sm text-muted-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-500">
            Want to see a demo first?{' '}
            <Link
              href="/"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Try the demo
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:no-underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:no-underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function SignupPage() {
  useRedirectIfAuthenticated()

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-96 h-96 bg-secondary-200 rounded-lg"></div>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}

export default SignupPage