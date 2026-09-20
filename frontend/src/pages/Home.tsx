import { motion, Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Shield, CheckCircle, Package, Thermometer,
  Leaf, Search, Phone, MapPin, ExternalLink, Zap, Clock, Globe
} from 'lucide-react'

// Animation variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-[#0d1535] to-[#161f40]" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />

      {/* Animated route SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <motion.path
          d="M 50 500 Q 300 400 600 200 Q 900 50 1150 150"
          stroke="#6366f1" strokeWidth="2" fill="none"
          strokeDasharray="1000"
          initial={{ strokeDashoffset: 1000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 2 }}
        />
        <motion.path
          d="M 100 600 Q 400 500 700 300 Q 950 150 1180 250"
          stroke="#f97316" strokeWidth="1.5" fill="none"
          strokeDasharray="1000"
          initial={{ strokeDashoffset: 1000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3.5, ease: 'easeInOut', delay: 0.5, repeat: Infinity, repeatType: 'loop', repeatDelay: 1.5 }}
        />
        {/* Location dots */}
        {[
          { cx: 50, cy: 500 }, { cx: 600, cy: 200 }, { cx: 1150, cy: 150 },
          { cx: 100, cy: 600 }, { cx: 700, cy: 300 }, { cx: 1180, cy: 250 },
        ].map(({ cx, cy }, i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r="5"
            fill={i % 2 === 0 ? '#6366f1' : '#f97316'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.3 + 0.5 }}
          />
        ))}
      </svg>

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-900/10 rounded-full blur-3xl" />
    </div>
  )
}

function FloatingCard({ icon: Icon, title, value, delay }: {
  icon: React.ElementType; title: string; value: string; delay: number
}) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 text-white"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-white/50">{title}</p>
          <p className="font-semibold text-sm">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

const services = [
  {
    icon: Package,
    title: 'General Freight',
    description: 'Freight coordination for a wide range of general cargo shipments across the United States.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Thermometer,
    title: 'Refrigerated Freight',
    description: 'Coordination for temperature-sensitive cargo including refrigerated food products.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Leaf,
    title: 'Fresh Produce',
    description: 'Specialized freight coordination for fresh produce shipments requiring timely delivery.',
    color: 'bg-green-50 text-green-600',
  },
]

const trustItems = [
  { icon: Shield, label: 'Licensed Broker', sub: 'FMCSA Authorized' },
  { icon: CheckCircle, label: 'Active Status', sub: 'USDOT 3145157' },
  { icon: Globe, label: 'Interstate', sub: 'Nationwide Coordination' },
  { icon: Zap, label: 'Responsive', sub: 'Clear Communication' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16" aria-label="Hero section">
        <HeroBackground />

        <div className="relative container-custom py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-white/70 mb-6">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  USDOT 3145157 · MC-101721 · Active
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="heading-xl text-white mb-6"
              >
                Reliable Freight.{' '}
                <span className="text-accent-400">Smarter</span>{' '}
                Logistics.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg"
              >
                SMH Global Logistics LLC handles and coordinates freight and logistics services with a focus on dependable communication and efficient transportation across the United States.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                <Link to="/quote" className="btn-primary">
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="btn-outline">
                  Contact Us
                </Link>
              </motion.div>
            </div>

            {/* Floating cards */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3"
            >
              <FloatingCard icon={Shield} title="Authority" value="Carrier & Broker" delay={0} />
              <FloatingCard icon={CheckCircle} title="USDOT Status" value="Active" delay={1} />
              <FloatingCard icon={Globe} title="Operation" value="Interstate" delay={2} />
              <FloatingCard icon={Clock} title="Classification" value="Authorized For Hire" delay={3} />
              <div className="col-span-2">
                <FloatingCard icon={MapPin} title="Based In" value="Mount Dora, FL" delay={4} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Company Status Section */}
      <section className="section-padding bg-gray-50" aria-labelledby="status-heading">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="section-label mb-3">
              Verified Company Information
            </motion.p>
            <motion.h2 variants={fadeUp} id="status-heading" className="heading-lg text-navy-950">
              Licensed & Authorized
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 mt-3 max-w-xl mx-auto">
              SMH Global Logistics LLC is an active, FMCSA-registered carrier and freight broker. You can verify our operating status directly on the FMCSA website.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            {[
              { label: 'USDOT', value: '3145157' },
              { label: 'MC Number', value: 'MC-101721' },
              { label: 'Status', value: 'Active' },
              { label: 'Authority', value: 'Carrier/Broker' },
              { label: 'Operation', value: 'Interstate' },
              { label: 'Classification', value: 'Authorized For Hire' },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="card text-center hover:shadow-card-hover transition-shadow"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="font-bold text-navy-950 text-sm">{value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center">
            <a
              href="https://safer.fmcsa.dot.gov/query.asp?query_type=queryCarrierSnapshot&query_param=USDOT&query_string=3145157"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-950 hover:text-accent-600 transition-colors"
            >
              View Company Information on FMCSA
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-xs text-gray-400 mt-2">
              This website is independently operated by SMH Global Logistics LLC and is not affiliated with the FMCSA.
            </p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-padding" aria-labelledby="services-heading">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="section-label mb-3">What We Coordinate</motion.p>
            <motion.h2 variants={fadeUp} id="services-heading" className="heading-lg text-navy-950">
              Freight Services
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 mt-3 max-w-xl mx-auto">
              As a dual-authorized carrier and freight broker, we move and coordinate shipments for these freight categories.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {services.map(({ icon: Icon, title, description, color }) => (
              <motion.div key={title} variants={fadeUp} className="card-hover group">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-navy-950 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link to="/services" className="btn-secondary">
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Track CTA */}
      <section className="section-padding bg-navy-950" aria-labelledby="track-heading">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="section-label text-accent-400 mb-3">
                Track Your Freight
              </motion.p>
              <motion.h2 variants={fadeUp} id="track-heading" className="heading-lg text-white mb-4">
                Know Where Your Shipment Is
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/60 mb-8">
                Use your tracking number to check the current status and timeline of your shipment.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Enter tracking number (e.g. SMH-000001)"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val) window.location.href = `/track?q=${encodeURIComponent(val)}`
                    }
                  }}
                  aria-label="Tracking number"
                />
                <Link to="/track" className="btn-primary flex-shrink-0 justify-center">
                  <Search className="w-4 h-4" />
                  Track
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding" aria-labelledby="trust-heading">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="section-label mb-3">Why Choose Us</motion.p>
            <motion.h2 variants={fadeUp} id="trust-heading" className="heading-lg text-navy-950">
              Built Around Reliable Coordination
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {trustItems.map(({ icon: Icon, label, sub }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-7 h-7 text-navy-950" />
                </div>
                <h3 className="font-semibold text-navy-950 mb-1">{label}</h3>
                <p className="text-sm text-gray-400">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-br from-accent-500 to-accent-600" aria-labelledby="cta-heading">
        <div className="container-custom text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} id="cta-heading" className="heading-lg text-white mb-4">
              Ready to Ship?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/80 mb-8 max-w-md mx-auto">
              Get a freight quote today and let us coordinate your next shipment.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link to="/quote" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-accent-600 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
                <Phone className="w-4 h-4" />
                (407) 271-6983
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
