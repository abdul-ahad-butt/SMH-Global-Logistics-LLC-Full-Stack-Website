import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Truck, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { to: '/', label: 'Home', exact: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/track', label: 'Track Shipment' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" aria-label="SMH Global Logistics LLC home">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                scrolled ? 'bg-navy-950' : 'bg-white/20 backdrop-blur-sm border border-white/30'
              }`}>
                <Truck className={`w-5 h-5 transition-colors duration-300 ${scrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <div className="hidden sm:block">
                <p className={`font-bold text-sm leading-tight transition-colors duration-300 ${
                  scrolled ? 'text-navy-950' : 'text-white'
                }`}>
                  SMH GLOBAL
                </p>
                <p className={`text-xs leading-tight transition-colors duration-300 ${
                  scrolled ? 'text-gray-400' : 'text-white/60'
                }`}>
                  LOGISTICS LLC
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navLinks.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? scrolled
                          ? 'text-navy-950 bg-gray-100'
                          : 'text-white bg-white/15'
                        : scrolled
                        ? 'text-gray-600 hover:text-navy-950 hover:bg-gray-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/quote"
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  scrolled
                    ? 'bg-navy-950 text-white hover:bg-navy-900'
                    : 'bg-accent-500 text-white hover:bg-accent-600'
                } shadow-sm hover:shadow-md`}
              >
                Get a Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                scrolled ? 'text-navy-950 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-lg lg:hidden"
          >
            <nav className="container-custom py-4 space-y-1" role="navigation" aria-label="Mobile navigation">
              {navLinks.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-navy-950 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/quote"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center mt-2"
                >
                  Get a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
