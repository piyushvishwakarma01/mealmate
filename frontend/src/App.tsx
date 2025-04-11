import type React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "react-query"

// Auth
import { AuthProvider } from "./contexts/AuthContext"
import AuthLayout from "./layouts/AuthLayout"

// Pages - Auth
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"

// Pages - Common
import HomePage from "./pages/HomePage"

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            \
