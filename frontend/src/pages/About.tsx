import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, ExternalLink, Shield, CheckCircle, Globe } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

const companyDetails = [
  { label: 'Legal Name', value: 'SMH Global Logistics LLC' },
  { label: 'Entity Type', value: 'Carrier/Broker' },
  { label: 'USDOT Number', value: '3145157' },
  { label: 'MC Number', value: 'MC-101721' },
  { label: 'USDOT Status', value: 'Active' },
  { label: 'Operating Authority', value: 'Authorized Logistics Broker' },
  { label: 'Carrier Operation', value: 'Interstate' },
  { label: 'Operation Classification', value: 'Authorized For Hire' },
  { label: 'MCS-150 Form Date', value: '06/05/2025' },
  { label: 'DUNS Number', value: '81-335-269' },
]

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="section-label text-accent-400 mb-3">Who We Are</motion.p>
            <motion.h1 variants={fadeUp} className="heading-xl text-white mb-4">About SMH Global Logistics</motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 max-w-2xl mx-auto">
              A licensed carrier and freight brokerage based in Mount Dora, Florida, focused on reliable freight coordination across the United States.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* About content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.h2 variants={fadeUp} className="heading-md text-navy-950 mb-6">
                Built Around Reliable Freight Coordination
              </motion.h2>
              <motion.div variants={fadeUp} className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  SMH Global Logistics LLC is a licensed carrier and freight brokerage based in Mount Dora, Florida. We are authorized by the Federal Motor Carrier Safety Administration (FMCSA) for interstate operations across the United States.
                </p>
                <p>
                  Our focus is on freight coordination — connecting shippers with qualified transportation providers for general cargo, refrigerated food products, and fresh produce. We prioritize clear communication and dependable service throughout the logistics process.
                </p>
                <p>
                  Operating as both an authorized carrier and a freight broker, we have the flexibility to handle your shipments directly or coordinate with our network of qualified transportation providers. Our value lies in reliable execution, transparent communication, and efficient freight management on your behalf.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950 text-sm">FMCSA Licensed Carrier & Broker</p>
                    <p className="text-sm text-gray-500">Active operating authority for interstate property transport</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950 text-sm">Interstate Operations</p>
                    <p className="text-sm text-gray-500">Authorized for freight coordination across the United States</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950 text-sm">Verified & Active</p>
                    <p className="text-sm text-gray-500">USDOT 3145157 · MC-101721 · Status: Active</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Company details table */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="card">
                <h3 className="font-bold text-navy-950 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Official Company Details
                </h3>
                <dl className="space-y-3">
                  {companyDetails.map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0 gap-4">
                      <dt className="text-sm text-gray-400 flex-shrink-0">{label}</dt>
                      <dd className="text-sm font-medium text-navy-950 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href="https://safer.fmcsa.dot.gov/query.asp?query_type=queryCarrierSnapshot&query_param=USDOT&query_string=3145157"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700 font-medium"
                  >
                    Verify on FMCSA SAFER System
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact info */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: MapPin,
                title: 'Physical Address',
                lines: ['5879 Ansley Way', 'Mount Dora, FL 32757', 'United States'],
              },
              {
                icon: Mail,
                title: 'Mailing Address',
                lines: ['5424 Lake Street', 'Tangerine, FL 32777', 'United States'],
              },
              {
                icon: Phone,
                title: 'Phone',
                lines: ['(407) 271-6983'],
                link: 'tel:+14072716983',
              },
            ].map(({ icon: Icon, title, lines, link }) => (
              <motion.div key={title} variants={fadeUp} className="card text-center">
                <div className="w-10 h-10 bg-navy-950 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-navy-950 mb-2">{title}</h3>
                {lines.map((l) => (
                  link ? (
                    <a key={l} href={link} className="block text-sm text-gray-500 hover:text-navy-950 transition-colors">{l}</a>
                  ) : (
                    <p key={l} className="text-sm text-gray-500">{l}</p>
                  )
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
