import { motion } from 'framer-motion'
import { Package, Thermometer, Leaf, ArrowRight, CheckCircle, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

const services = [
  {
    icon: Shield,
    title: 'Freight Brokerage',
    description: 'As a licensed carrier and freight broker (MC-101721), we handle shipments directly and coordinate freight between shippers and qualified transportation providers. We manage the communication and logistics so you can focus on your business.',
    highlights: ['FMCSA Licensed Carrier', 'MC-101721 Authorized', 'Interstate Operations', 'Logistics Broker'],
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Package,
    title: 'General Freight',
    description: 'Freight coordination for general cargo shipments across the United States. We work to find reliable carriers suited to your freight requirements and timeline.',
    highlights: ['Dry Van Coordination', 'Flatbed Coordination', 'Various Equipment Types', 'Nationwide Routes'],
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Thermometer,
    title: 'Refrigerated Freight',
    description: 'Coordination for temperature-sensitive cargo, including refrigerated food products. We connect you with carriers equipped to maintain proper temperature control.',
    highlights: ['Temperature-Sensitive Cargo', 'Refrigerated Food Products', 'Reefer Equipment', 'Cold Chain Coordination'],
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Leaf,
    title: 'Fresh Produce',
    description: 'Specialized freight coordination for fresh produce shipments. Timely, efficient coordination is essential for perishable goods, and we prioritize clear communication throughout the process.',
    highlights: ['Perishable Cargo', 'Time-Sensitive Shipments', 'Produce Coordination', 'Fresh Food Freight'],
    color: 'bg-green-50 text-green-600',
  },
]

export default function Services() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="section-label text-accent-400 mb-3">What We Do</motion.p>
            <motion.h1 variants={fadeUp} className="heading-xl text-white mb-4">Our Services</motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 max-w-2xl mx-auto">
              SMH Global Logistics LLC is a licensed carrier and freight broker moving shipments for general cargo, refrigerated food, and fresh produce across the United States.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="space-y-12">
            {services.map(({ icon: Icon, title, description, highlights, color }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="card grid md:grid-cols-5 gap-8 items-start"
              >
                <div className="md:col-span-3">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="heading-sm text-navy-950 mb-3">{title}</h2>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Includes</p>
                  <ul className="space-y-2">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="heading-md text-navy-950 mb-4">How Our Services Work</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              As a dual-authorized carrier and freight broker, SMH Global Logistics LLC has the flexibility to move your freight with our own equipment or act as an intermediary between you and our network of carriers. We handle transportation on your behalf — managing communication, load matching, and logistics coordination.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Whether handling it directly or brokering the load, our value is in reliable execution and dependable communication.
            </p>
            <Link to="/quote" className="btn-primary">
              Request a Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
