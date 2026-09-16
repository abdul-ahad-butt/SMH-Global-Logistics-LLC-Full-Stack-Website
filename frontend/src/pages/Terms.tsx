import { motion } from 'framer-motion'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-navy-950 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
)

export default function Terms() {
  return (
    <>
      <section className="pt-28 pb-12 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-xl text-white mb-3">Terms &amp; Conditions</h1>
            <p className="text-white/50 text-sm">Last updated: September 2026</p>
          </motion.div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="card prose max-w-none">
            <Section title="1. Acceptance of Terms">
              <p>By accessing and using this website, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this website.</p>
            </Section>
            <Section title="2. About SMH Global Logistics LLC">
              <p>SMH Global Logistics LLC is a licensed carrier and freight broker (USDOT 3145157, MC-101721), authorized as a Logistics Broker for interstate operations. We handle shipments directly and coordinate freight transportation between shippers and carriers.</p>
            </Section>
            <Section title="3. Services">
              <p>Information on this website describes freight brokerage and coordination services available through SMH Global Logistics LLC. Submitting a quote request does not constitute a binding agreement. All freight services are subject to a separate freight brokerage agreement between the parties.</p>
            </Section>
            <Section title="4. Information Accuracy">
              <p>We strive to keep the information on this website accurate and up to date. However, we make no warranty, express or implied, regarding the accuracy, completeness, or timeliness of any information on this site.</p>
            </Section>
            <Section title="5. Limitation of Liability">
              <p>To the fullest extent permitted by law, SMH Global Logistics LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website or our services.</p>
            </Section>
            <Section title="6. FMCSA Disclaimer">
              <p>This website is independently operated by SMH Global Logistics LLC and is not affiliated with or operated by the Federal Motor Carrier Safety Administration (FMCSA). FMCSA registration information is provided for reference only. Users are encouraged to verify carrier information directly at safer.fmcsa.dot.gov.</p>
            </Section>
            <Section title="7. Contact">
              <p>For questions about these Terms, contact us at:<br />
              SMH Global Logistics LLC<br />
              5424 Lake Street, Tangerine, FL 32777<br />
              Phone: (407) 271-6983</p>
            </Section>
          </div>
        </div>
      </section>
    </>
  )
}
