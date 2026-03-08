'use client'

// Form validation utilities
export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  if (email.length < 3) return 'Email must be at least 3 characters'
  if (email.length > 254) return 'Email is too long'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'

  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'

  return null
}

export function validateName(name: string): string | null {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 100) return 'Name is too long'

  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(name)) return 'Name can only contain letters, spaces, hyphens and apostrophes'

  return null
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
}

export function validateLoginForm(data: LoginFormData): ValidationError[] {
  const errors: ValidationError[] = []

  const emailError = validateEmail(data.email)
  if (emailError) errors.push({ field: 'email', message: emailError })

  const passwordError = validatePassword(data.password)
  if (passwordError) errors.push({ field: 'password', message: passwordError })

  return errors
}

export function validateSignupForm(data: SignupFormData): ValidationError[] {
  const errors: ValidationError[] = []

  const nameError = validateName(data.name)
  if (nameError) errors.push({ field: 'name', message: nameError })

  const emailError = validateEmail(data.email)
  if (emailError) errors.push({ field: 'email', message: emailError })

  const passwordError = validatePassword(data.password)
  if (passwordError) errors.push({ field: 'password', message: passwordError })

  return errors
}

// URL validation utility to prevent open redirect attacks
export function validateRedirectUrl(url: string, origin: string): string {
  if (!url) return '/workspaces'

  try {
    // If it's a relative path, it's safe
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url
    }

    // If it's an absolute URL, make sure it's same origin
    const urlObj = new URL(url, origin)
    if (urlObj.origin === origin) {
      return urlObj.pathname + urlObj.search
    }
  } catch {
    // Invalid URL, return safe default
  }

  return '/workspaces'
}

// Auth error message formatting
export function formatAuthError(error: string): string {
  switch (error) {
    case 'CredentialsSignin':
      return 'Invalid email or password'
    case 'CallbackRouteError':
      return 'Authentication failed. Please try again.'
    case 'OAuthAccountNotLinked':
      return 'Account already exists with different credentials'
    case 'EmailCreateAccount':
      return 'Unable to create account with this email'
    case 'Signin':
      return 'Sign in failed'
    case 'OAuthSignin':
      return 'OAuth sign in failed'
    case 'OAuthCallback':
      return 'OAuth callback failed'
    case 'OAuthCreateAccount':
      return 'OAuth account creation failed'
    case 'EmailSignin':
      return 'Email sign in failed'
    case 'CredentialsCallback':
      return 'Credentials callback failed'
    case 'SessionRequired':
      return 'You must be signed in to access this page'
    default:
      return 'An authentication error occurred'
  }
}

// Loading state helper for forms
export function createFormLoadingState() {
  return {
    loading: false,
    error: null as string | null,
    fieldErrors: {} as Record<string, string>,
  }
}