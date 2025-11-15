import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from '@/components/layout/header'

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { firstName: 'Test User', subscriptionType: 'PRO' },
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

describe('Header Component', () => {
  it('renders puantroplus text', () => {
    const Wrapper = createWrapper()
    render(<Header />, { wrapper: Wrapper })
    
    expect(screen.getByText('puantroplus')).toBeInTheDocument()
  })

  it('renders user info when authenticated', () => {
    const Wrapper = createWrapper()
    render(<Header />, { wrapper: Wrapper })
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('PRO')).toBeInTheDocument()
  })

  it('has correct styling for puantroplus text', () => {
    const Wrapper = createWrapper()
    render(<Header />, { wrapper: Wrapper })
    
    const puantroplusButton = screen.getByText('puantroplus').closest('button')
    expect(puantroplusButton).toHaveStyle('color: white')
  })
})