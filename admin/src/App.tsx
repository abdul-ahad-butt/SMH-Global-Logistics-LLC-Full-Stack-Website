import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute.js'
import AdminLayout from './layouts/AdminLayout.js'

// Admin pages (lazy loaded)
const AdminLogin = lazy(() => import('./pages/admin/Login.js'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.js'))
const AdminQuotes = lazy(() => import('./pages/admin/Quotes.js'))
const AdminQuoteDetail = lazy(() => import('./pages/admin/QuoteDetail.js'))
const AdminShipments = lazy(() => import('./pages/admin/Shipments.js'))
const AdminShipmentDetail = lazy(() => import('./pages/admin/ShipmentDetail.js'))
const AdminMessages = lazy(() => import('./pages/admin/Messages.js'))
const AdminContent = lazy(() => import('./pages/admin/Content.js'))
const AdminSettings = lazy(() => import('./pages/admin/Settings.js'))

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="quotes/:id" element={<AdminQuoteDetail />} />
            <Route path="shipments" element={<AdminShipments />} />
            <Route path="shipments/:id" element={<AdminShipmentDetail />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all redirect to / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
