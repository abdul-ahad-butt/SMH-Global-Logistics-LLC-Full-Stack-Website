import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How do I request a freight quote?',
    a: 'You can request a quote by completing our online quote request form on the Request a Quote page. Provide your shipment details including pickup and delivery locations, freight type, and estimated weight. We will review your request and follow up with a quote.',
  },
  {
    q: 'What information is needed for a quote?',
    a: 'We typically need: pickup and delivery locations, desired pickup and delivery dates, type of freight (general, refrigerated, or fresh produce), commodity description, estimated weight, and any special handling requirements.',
  },
  {
    q: 'What types of freight do you coordinate?',
    a: 'We coordinate freight for general cargo, refrigerated food products, and fresh produce. As a licensed freight broker, we connect shippers with qualified carriers suited to their specific freight needs.',
  },
  {
    q: 'How can I track a shipment?',
    a: 'Once your shipment is booked and in transit, you will receive a tracking number in the format SMH-XXXXXX. Enter this number on our Track Shipment page to view the current status and history of your shipment.',
  },
  {
    q: 'How do I contact SMH Global Logistics LLC?',
    a: 'You can reach us by phone at (407) 271-6983, or by completing the contact form on our Contact page. Our mailing address is 5424 Lake Street, Tangerine, FL 32777.',
  },
  {
    q: "What is SMH Global Logistics LLC's USDOT number?",
    a: 'Our USDOT number is 3145157. You can verify our operating status on the FMCSA website at safer.fmcsa.dot.gov.',
  },
  {
    q: "What is SMH Global Logistics LLC's MC number?",
    a: 'Our MC number is MC-101721. We are authorized as a Logistics Broker for interstate operations.',
  },
  {
    q: 'Do you operate your own trucks?',
    a: 'No. SMH Global Logistics LLC is a freight broker, not a trucking company. As a broker, we coordinate freight between shippers and qualified transportation providers (carriers). We do not operate our own trucking fleet.',
  },
  {
    q: 'What states do you serve?',
    a: 'We are authorized for interstate freight coordination and can coordinate shipments across the United States.',
  },
]

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      className="border-b border-gray-100 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-navy-950 transition-colors"
        aria-expanded={open}
        id={`faq-btn-${i}`}
        aria-controls={`faq-panel-${i}`}
      >
        <span className={`font-semibold text-sm md:text-base ${open ? 'text-navy-950' : 'text-gray-700'}`}>{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className={`w-5 h-5 ${open ? 'text-accent-500' : 'text-gray-400'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-panel-${i}`}
            role="region"
            aria-labelledby={`faq-btn-${i}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-500 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <>
      <section className="pt-28 pb-16 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-label text-accent-400 mb-3">FAQ</p>
            <h1 className="heading-xl text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Answers to common questions about our freight brokerage services and how we work.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="card">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} i={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
