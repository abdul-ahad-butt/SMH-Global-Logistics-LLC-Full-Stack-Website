import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { contactApi } from '../services/api.js'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await contactApi.submit(data)
      setSubmitted(true)
      toast.success('Message sent successfully!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <>
      <section className="pt-28 pb-16 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-label text-accent-400 mb-3">Get In Touch</p>
            <h1 className="heading-xl text-white mb-4">Contact Us</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Have a question about our services or want to request a quote? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-6"
            >
              <motion.div variants={fadeUp}>
                <h2 className="heading-sm text-navy-950 mb-4">Contact Information</h2>
              </motion.div>

              {[
                {
                  icon: Phone,
                  title: 'Phone',
                  content: (
                    <a href="tel:+14072716983" className="text-gray-600 hover:text-navy-950 transition-colors">
                      (407) 271-6983
                    </a>
                  ),
                },
                {
                  icon: MapPin,
                  title: 'Physical Address',
                  content: (
                    <p className="text-gray-600">
                      5879 Ansley Way<br />
                      Mount Dora, FL 32757<br />
                      United States
                    </p>
                  ),
                },
                {
                  icon: MapPin,
                  title: 'Mailing Address',
                  content: (
                    <p className="text-gray-600">
                      5424 Lake Street<br />
                      Tangerine, FL 32777<br />
                      United States
                    </p>
                  ),
                },
                {
                  icon: Clock,
                  title: 'Business Hours',
                  content: <p className="text-gray-600">Monday – Friday<br />8:00 AM – 5:00 PM EST</p>,
                },
              ].map(({ icon: Icon, title, content }) => (
                <motion.div key={title} variants={fadeUp} className="flex gap-4">
                  <div className="w-10 h-10 bg-navy-950 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950 mb-1">{title}</p>
                    {content}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-2"
            >
              {submitted ? (
                <div className="card text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="heading-sm text-navy-950 mb-2">Message Sent!</h2>
                  <p className="text-gray-500">
                    Thank you for reaching out. We will review your message and get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <div className="card">
                  <h2 className="heading-sm text-navy-950 mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact_name" className="label">Your Name <span className="text-red-500">*</span></label>
                        <input id="contact_name" {...register('name')} className={`input-field ${errors.name ? 'input-error' : ''}`} placeholder="John Smith" />
                        {errors.name && <p className="error-text">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="contact_company" className="label">Company</label>
                        <input id="contact_company" {...register('company')} className="input-field" placeholder="Optional" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact_email" className="label">Email Address <span className="text-red-500">*</span></label>
                        <input id="contact_email" type="email" {...register('email')} className={`input-field ${errors.email ? 'input-error' : ''}`} placeholder="you@company.com" />
                        {errors.email && <p className="error-text">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="contact_phone" className="label">Phone</label>
                        <input id="contact_phone" type="tel" {...register('phone')} className="input-field" placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact_subject" className="label">Subject <span className="text-red-500">*</span></label>
                      <input id="contact_subject" {...register('subject')} className={`input-field ${errors.subject ? 'input-error' : ''}`} placeholder="How can we help?" />
                      {errors.subject && <p className="error-text">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact_message" className="label">Message <span className="text-red-500">*</span></label>
                      <textarea id="contact_message" {...register('message')} rows={5} className={`input-field resize-none ${errors.message ? 'input-error' : ''}`} placeholder="Tell us about your freight needs..." />
                      {errors.message && <p className="error-text">{errors.message.message}</p>}
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
