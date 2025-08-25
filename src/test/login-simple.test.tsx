import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      loading: false,
      error: null,
      hasRole: vi.fn(() => false),
      refreshToken: vi.fn(),
    }),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Login Component - Simple Test', () => {
  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );
    
    // Just check if the component renders without throwing
    expect(document.body).toBeInTheDocument();
  });
});