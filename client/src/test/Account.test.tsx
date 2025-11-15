import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Account from '@/pages/account'

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { 
      firstName: 'Test', 
      lastName: 'User', 
      email: 'test@example.com',
      subscriptionType: 'PRO' 
    },
    isLoading: false,
    isAuthenticated: true,
    error: null,
    refetch: vi.fn(),
  })
}))

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

describe('Account Component', () => {
  it('renders account page with profile section', () => {
    const Wrapper = createWrapper()
    render(<Account />, { wrapper: Wrapper })
    
    expect(screen.getByText('Profil Bilgileri')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('User')).toBeInTheDocument()
  })

  it('has white text in input fields', () => {
    const Wrapper = createWrapper()
    render(<Account />, { wrapper: Wrapper })
    
    const firstNameInput = screen.getByDisplayValue('Test')
    const lastNameInput = screen.getByDisplayValue('User')
    
    expect(firstNameInput).toHaveStyle('color: white')
    expect(lastNameInput).toHaveStyle('color: white')
  })

  it('has account-page class for styling', () => {
    const Wrapper = createWrapper()
    const { container } = render(<Account />, { wrapper: Wrapper })
    
    expect(container.firstChild).toHaveClass('account-page')
  })
})