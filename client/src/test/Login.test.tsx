import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '@/pages/login'

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  })
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Login Component', () => {
  it('renders login form', () => {
    const Wrapper = createWrapper()
    render(<Login />, { wrapper: Wrapper })
    
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Şifre')).toBeInTheDocument()
  })

  it('has white text input styling', () => {
    const Wrapper = createWrapper()
    render(<Login />, { wrapper: Wrapper })
    
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Şifre')
    
    expect(emailInput).toHaveStyle('color: white')
    expect(passwordInput).toHaveStyle('color: white')
  })

  it('shows register link', () => {
    const Wrapper = createWrapper()
    render(<Login />, { wrapper: Wrapper })
    
    expect(screen.getByText('Hesabınız yok mu? Kaydolun')).toBeInTheDocument()
  })
})