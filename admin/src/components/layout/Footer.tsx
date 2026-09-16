import { Link } from 'react-router-dom'
import { Truck, Phone, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 text-white" role="contentinfo">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">SMH GLOBAL</p>
                <p className="text-xs text-white/50 leading-tight">LOGISTICS LLC</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Reliable freight coordination across the United States. Licensed freight brokerage.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/30" />
                <span>5879 Ansley Way, Mount Dora, FL 32757</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="w-4 h-4 flex-shrink-0 text-white/30" />
                <a href="tel:+14072716983" className="hover:text-white transition-colors">
                  (407) 271-6983
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/quote', label: 'Request a Quote' },
                { to: '/track', label: 'Track Shipment' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Legal</h3>
            <ul className="space-y-2">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/faq', label: 'FAQ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Company Info</h3>
            <div className="space-y-3">
              {[
                { label: 'USDOT', value: '3145157' },
                { label: 'MC Number', value: 'MC-101721' },
                { label: 'Status', value: 'Active' },
                { label: 'Authority', value: 'Logistics Broker' },
                { label: 'Operation', value: 'Interstate' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white/80 font-medium">{value}</span>
                </div>
              ))}
              <a
                href="https://safer.fmcsa.dot.gov/query.asp?query_type=queryCarrierSnapshot&query_param=USDOT&query_string=3145157"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors mt-1"
              >
                Verify on FMCSA
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-xs text-white/40">
              © {year} SMH Global Logistics LLC. All rights reserved.
            </p>
            <p className="text-xs text-white/30 max-w-md text-left sm:text-right">
              This website is independently operated by SMH Global Logistics LLC and is not affiliated with or operated by the Federal Motor Carrier Safety Administration (FMCSA).
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
