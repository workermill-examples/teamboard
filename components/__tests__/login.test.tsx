import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { validateLoginForm, validateEmail, validatePassword } from '@/lib/client-utils'
import LoginPage from '@/app/login/page'

// Mock Next.js hooks and NextAuth
vi.mock('next-auth/react')
vi.mock('next/navigation')
vi.mock('@/hooks/use-auth')

const mockUseSession = useSession as any<typeof useSession>
const mockSignIn = signIn as any<typeof signIn>
const mockUseRouter = useRouter as any<typeof useRouter>
const mockUseSearchParams = useSearchParams as any<typeof useSearchParams>

// Mock the auth hooks
import * as useAuth from '@/hooks/use-auth'
const mockLogin = vi.fn()
const mockUseLogin = vi.fn(() => ({
  login: mockLogin,
  loading: false,
  error: null,
  clearError: vi.fn()
}))
const mockUseRedirectIfAuthenticated = vi.fn(() => ({
  isAuthenticated: false,
  isLoading: false
}))

vi.mocked(useAuth.useLogin).mockImplementation(mockUseLogin)
vi.mocked(useAuth.useRedirectIfAuthenticated).mockImplementation(mockUseRedirectIfAuthenticated)

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}

const mockSearchParams = {
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  sort: vi.fn(),
  toString: vi.fn(),
  forEach: vi.fn(),
  append: vi.fn(),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
}

describe('Login Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    mockUseRouter.mockReturnValue(mockRouter)
    mockUseSearchParams.mockReturnValue(mockSearchParams)
    mockSearchParams.get.mockReturnValue(null)

    // Reset auth hook mocks with clean state
    mockLogin.mockReset()
    mockUseLogin.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      clearError: vi.fn()
    })
    mockUseRedirectIfAuthenticated.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    })
  })

  describe('Email Validation', () => {
    it('validates empty email', () => {
      const error = validateEmail('')
      expect(error).toBe('Email is required')
    })

    it('validates short email', () => {
      const error = validateEmail('a@')
      expect(error).toBe('Email must be at least 3 characters')
    })

    it('validates invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address')
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address')
      expect(validateEmail('user@')).toBe('Please enter a valid email address')
      expect(validateEmail('user@domain')).toBe('Please enter a valid email address')
    })

    it('validates too long email', () => {
      const longEmail = 'a'.repeat(250) + '@domain.com'
      const error = validateEmail(longEmail)
      expect(error).toBe('Email is too long')
    })

    it('accepts valid email formats', () => {
      expect(validateEmail('user@domain.com')).toBeNull()
      expect(validateEmail('test.email+tag@example.org')).toBeNull()
      expect(validateEmail('user123@test-domain.co.uk')).toBeNull()
    })
  })

  describe('Password Validation', () => {
    it('validates empty password', () => {
      const error = validatePassword('')
      expect(error).toBe('Password is required')
    })

    it('validates short password', () => {
      const error = validatePassword('short')
      expect(error).toBe('Password must be at least 8 characters')
    })

    it('validates too long password', () => {
      const longPassword = 'a'.repeat(130)
      const error = validatePassword(longPassword)
      expect(error).toBe('Password is too long')
    })

    it('accepts valid password', () => {
      expect(validatePassword('validPassword123')).toBeNull()
      expect(validatePassword('anotherValidPass')).toBeNull()
    })
  })

  describe('Form Validation Integration', () => {
    it('validates complete login form with errors', () => {
      const formData = {
        email: '',
        password: 'short'
      }

      const errors = validateLoginForm(formData)

      expect(errors).toHaveLength(2)
      expect(errors).toEqual(
        expect.arrayContaining([
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password must be at least 8 characters' }
        ])
      )
    })

    it('validates complete login form with valid data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'validPassword123'
      }

      const errors = validateLoginForm(formData)
      expect(errors).toHaveLength(0)
    })
  })

  describe('Login Form Component', () => {
    it('renders login form with all required fields', () => {
      render(<LoginPage />)

      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your TeamBoard account')).toBeInTheDocument()

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('has link to signup page', () => {
      render(<LoginPage />)

      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toBeInTheDocument()
      expect(signupLink).toHaveAttribute('href', '/signup')
    })

    it('has link back to demo', () => {
      render(<LoginPage />)

      const demoLink = screen.getByRole('link', { name: /try the demo/i })
      expect(demoLink).toBeInTheDocument()
      expect(demoLink).toHaveAttribute('href', '/')
    })

    it('displays field validation errors on invalid input', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Try to submit with empty form
      await user.click(submitButton)

      await waitFor(() => {
        // The validation happens client-side so we should see error messages
        // Even though we mocked the login hook, the form validation still runs
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('clears validation errors when user starts typing', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Submit empty form to trigger validation errors
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Start typing in email field
      await user.type(emailInput, 't')

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('disables form while loading', async () => {
      // Mock loading state
      mockUseLogin.mockReturnValue({
        login: mockLogin,
        loading: true,
        error: null,
        clearError: vi.fn()
      })

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /signing in.../i })

      // Form should be disabled when loading
      expect(submitButton).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })

    it('shows authentication error message', () => {
      // Mock error state
      mockUseLogin.mockReturnValue({
        login: mockLogin,
        loading: false,
        error: 'Invalid email or password',
        clearError: vi.fn()
      })

      render(<LoginPage />)

      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    it('calls login function on form submission', async () => {
      mockLogin.mockResolvedValueOnce(true)

      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'demo@workermill.com')
      await user.type(passwordInput, 'demo1234')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'demo@workermill.com',
          password: 'demo1234',
        })
      })
    })

    it('redirects authenticated users away from login page', () => {
      mockUseRedirectIfAuthenticated.mockReturnValue({
        isAuthenticated: true,
        isLoading: false
      })

      render(<LoginPage />)

      // The redirect would be handled by the hook, we just verify it was called
      expect(mockUseRedirectIfAuthenticated).toHaveBeenCalled()
    })

    it('maintains proper form accessibility', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      // Check for proper input attributes
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
      expect(emailInput).toHaveAttribute('required')

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
      expect(passwordInput).toHaveAttribute('required')

      // Check for proper form structure
      const form = emailInput.closest('form')
      expect(form).toBeInTheDocument()
      expect(form).toContainElement(passwordInput)
    })
  })
})