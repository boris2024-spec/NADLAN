import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import AuthErrorPage from './pages/AuthErrorPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyListingsPage from './pages/MyListingsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';

// Layout
import Layout from './components/layout/Layout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-dark-50 font-hebrew transition-colors">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/properties/:id" element={<PropertyDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<EmailVerificationPage />} />

                  {/* Auth Routes */}
                  <Route path="/auth/success" element={<AuthSuccessPage />} />
                  <Route path="/auth/error" element={<AuthErrorPage />} />

                  {/* Protected Routes */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/my-listings" element={<MyListingsPage />} />
                  <Route path="/properties/create" element={<CreatePropertyPage />} />
                  <Route path="/create-property" element={<CreatePropertyPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/admin" element={<AdminPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </Router>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
