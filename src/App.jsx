import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AccessDenied } from './pages/public/AccessDenied';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { LifestyleQuiz } from './pages/buyer/LifestyleQuiz';
import { BuyerProfile } from './pages/buyer/BuyerProfile';
import { RecommendationsPage } from './pages/buyer/RecommendationsPage';
import { PropertyDetailPage } from './pages/buyer/PropertyDetailPage';
import { ComparisonPage } from './pages/buyer/ComparisonPage';
import { ShortlistPage } from './pages/buyer/ShortlistPage';
import { SearchHistoryPage } from './pages/buyer/SearchHistoryPage';
import { AiSearchPage } from './pages/buyer/AiSearchPage';

// Seller Pages
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerPropertiesPage } from './pages/seller/SellerPropertiesPage';
import { AddEditPropertyPage } from './pages/seller/AddEditPropertyPage';
import { BuyerInsightsPage } from './pages/seller/BuyerInsightsPage';
import { SellerAnalyticsPage } from './pages/seller/SellerAnalyticsPage';
import { SellerEnquiriesPage } from './pages/seller/SellerEnquiriesPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSellersPage } from './pages/admin/AdminSellersPage';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* ── PUBLIC ROUTES ────────────────────────────── */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* ── BUYER PROTECTED ROUTES ──────────────────── */}
                <Route element={<ProtectedRoute allowedRole="buyer" />}>
                  <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                  <Route path="/buyer/quiz" element={<LifestyleQuiz />} />
                  <Route path="/buyer/profile" element={<BuyerProfile />} />
                  <Route path="/buyer/recommendations" element={<RecommendationsPage />} />
                  <Route path="/buyer/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/buyer/compare" element={<ComparisonPage />} />
                  <Route path="/buyer/shortlist" element={<ShortlistPage />} />
                  <Route path="/buyer/history" element={<SearchHistoryPage />} />
                  <Route path="/buyer/ai-search" element={<AiSearchPage />} />
                </Route>

                {/* ── SELLER PROTECTED ROUTES ─────────────────── */}
                <Route element={<ProtectedRoute allowedRole="seller" />}>
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/properties" element={<SellerPropertiesPage />} />
                  <Route path="/seller/add" element={<AddEditPropertyPage />} />
                  <Route path="/seller/edit/:id" element={<AddEditPropertyPage />} />
                  <Route path="/seller/insights/:id" element={<BuyerInsightsPage />} />
                  <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
                  <Route path="/seller/enquiries" element={<SellerEnquiriesPage />} />
                </Route>

                {/* ── ADMIN PROTECTED ROUTES ──────────────────── */}
                <Route element={<ProtectedRoute allowedRole="admin" />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/sellers" element={<AdminSellersPage />} />
                  <Route path="/admin/properties" element={<AdminPropertiesPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Fallback to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
