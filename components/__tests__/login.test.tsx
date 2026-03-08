import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { validateEmail, validatePassword } from '@/lib/client-utils'

// Mock all external dependencies completely
vi.mock('next-auth/react')
vi.mock('next/navigation')

// Mock the auth hooks with safe no-op implementations
const mockUseRedirectIfAuthenticated = vi.fn(() => ({
  isAuthenticated: false,
  isLoading: false
}))

const mockLogin = vi.fn()
const mockClearError = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useRedirectIfAuthenticated: mockUseRedirectIfAuthenticated,
  useLogin: () => ({
    login: mockLogin,
    loading: false,
    error: null,
    clearError: mockClearError,
  }),
}))

// Create minimal mock implementations
const mockUseSession = vi.mocked(useSession)
const mockUseRouter = vi.mocked(useRouter)
const mockUseSearchParams = vi.mocked(useSearchParams)
const mockPush = vi.fn()

describe('Login Form Validation Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up minimal mocks to prevent hanging
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    })

    mockUseSearchParams.mockReturnValue({
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
    })
  })

  describe('Email Validation', () => {
    it('validates empty email', () => {
      const error = validateEmail('')
      expect(error).toBe('Email is required')
    })

    it('validates invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address')
    })

    it('accepts valid email formats', () => {
      expect(validateEmail('user@domain.com')).toBeNull()
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

    it('accepts valid password', () => {
      expect(validatePassword('validPassword123')).toBeNull()
    })
  })

  describe('Login Form Component', () => {
    it('renders without hanging', async () => {
      // Import the LoginPage component dynamically to ensure mocks are set up
      const { default: LoginPage } = await import('@/app/login/page')

      render(<LoginPage />)

      // Just verify it renders without hanging - basic smoke test
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('displays validation errors for invalid input', async () => {
      const { default: LoginPage } = await import('@/app/login/page')

      render(<LoginPage />)

      // Enter invalid data
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'short' } })

      // Submit the form
      const form = emailInput.closest('form')
      fireEvent.submit(form!)

      // Wait for validation errors to appear
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Verify the mock login function was NOT called due to validation errors
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('calls login function with valid data', async () => {
      const { default: LoginPage } = await import('@/app/login/page')

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Enter valid data
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'validPassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'validPassword123'
        })
      })
    })
  })
})