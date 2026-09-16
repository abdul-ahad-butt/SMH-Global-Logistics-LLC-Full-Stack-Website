import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute.js'
import PublicLayout from './layouts/PublicLayout.js'
import AdminLayout from './layouts/AdminLayout.js'

// Public pages (lazy loaded)
const Home = lazy(() => import('./pages/Home.js'))
const About = lazy(() => import('./pages/About.js'))
const Services = lazy(() => import('./pages/Services.js'))
const Quote = lazy(() => import('./pages/Quote.js'))
const Track = lazy(() => import('./pages/Track.js'))
const Contact = lazy(() => import('./pages/Contact.js'))
const FAQ = lazy(() => import('./pages/FAQ.js'))
const Privacy = lazy(() => import('./pages/Privacy.js'))
const Terms = lazy(() => import('./pages/Terms.js'))
const NotFound = lazy(() => import('./pages/NotFound.js'))

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
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/track" element={<Track />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Login (no layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
