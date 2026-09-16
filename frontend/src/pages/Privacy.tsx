import { motion } from 'framer-motion'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-navy-950 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
)

export default function Privacy() {
  return (
    <>
      <section className="pt-28 pb-12 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-xl text-white mb-3">Privacy Policy</h1>
            <p className="text-white/50 text-sm">Last updated: September 2026</p>
          </motion.div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="card prose max-w-none">
            <Section title="1. Introduction">
              <p>SMH Global Logistics LLC ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, and protecting that information.</p>
            </Section>
            <Section title="2. Information We Collect">
              <p>We collect information you provide directly to us when you:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit a freight quote request</li>
                <li>Complete our contact form</li>
                <li>Communicate with us by phone or email</li>
              </ul>
              <p>This may include: name, company name, email address, phone number, shipment details, and the content of your messages.</p>
            </Section>
            <Section title="3. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process and respond to quote requests</li>
                <li>Respond to your inquiries and messages</li>
                <li>Coordinate freight services you have requested</li>
                <li>Communicate with you about your shipments</li>
                <li>Improve our website and services</li>
              </ul>
            </Section>
            <Section title="4. Information Sharing">
              <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except as necessary to provide the services you have requested (such as sharing relevant information with transportation carriers to coordinate your shipment).</p>
            </Section>
            <Section title="5. Data Security">
              <p>We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
            </Section>
            <Section title="6. Contact Us">
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <p>SMH Global Logistics LLC<br />5424 Lake Street<br />Tangerine, FL 32777<br />Phone: (407) 271-6983</p>
            </Section>
            <p className="text-xs text-gray-400 mt-8">This website is independently operated by SMH Global Logistics LLC and is not affiliated with or operated by the Federal Motor Carrier Safety Administration.</p>
          </div>
        </div>
      </section>
    </>
  )
}
