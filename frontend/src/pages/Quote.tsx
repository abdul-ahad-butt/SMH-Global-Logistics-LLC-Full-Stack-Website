import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ArrowRight, ArrowLeft, User, Package, FileText, Send } from 'lucide-react'
import { quotesApi } from '../services/api.js'
import toast from 'react-hot-toast'

// Zod schemas per step
const step1Schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  company_name: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
})

const step2Schema = z.object({
  pickup_location: z.string().min(2, 'Pickup location is required'),
  delivery_location: z.string().min(2, 'Delivery location is required'),
  pickup_date: z.string().optional(),
  delivery_date: z.string().optional(),
  freight_type: z.enum(['general', 'refrigerated', 'produce'], { errorMap: () => ({ message: 'Select a freight type' }) }),
  commodity: z.string().optional(),
  weight: z.string().optional(),
  pieces: z.string().optional(),
  equipment_type: z.string().optional(),
  shipment_notes: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const steps = [
  { label: 'Contact Info', icon: User },
  { label: 'Shipment Details', icon: Package },
  { label: 'Review', icon: FileText },
  { label: 'Confirmation', icon: CheckCircle },
]

interface ConfirmationData {
  public_request_id: string
}

export default function Quote() {
  const [step, setStep] = useState(0)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(1)
  }

  const handleStep2 = (data: Step2Data) => {
    setStep2Data(data)
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!step1Data || !step2Data) return
    setIsSubmitting(true)
    try {
      const result = await quotesApi.submit({
        ...step1Data,
        company_name: step1Data.company_name ?? '',
        phone: step1Data.phone ?? '',
        ...step2Data,
        freight_type: step2Data.freight_type as 'general' | 'refrigerated' | 'produce',
        commodity: step2Data.commodity ?? '',
        weight: step2Data.weight ?? '',
        pieces: step2Data.pieces ?? '',
        equipment_type: step2Data.equipment_type ?? '',
        shipment_notes: step2Data.shipment_notes ?? '',
        pickup_date: step2Data.pickup_date ?? '',
        delivery_date: step2Data.delivery_date ?? '',
      })
      setConfirmation({ public_request_id: result.public_request_id })
      setStep(3)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-label text-accent-400 mb-3">Get Started</p>
            <h1 className="heading-xl text-white mb-4">Request a Freight Quote</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Fill out the form below with your shipment details and we will review your request and follow up.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-3xl mx-auto">
          {/* Step indicator */}
          {step < 4 && (
            <div className="flex items-center justify-center mb-10">
              {steps.map(({ label, icon: Icon }, i) => (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      i < step ? 'bg-green-500 text-white' :
                      i === step ? 'bg-navy-950 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {i < step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium hidden sm:block ${i === step ? 'text-navy-950' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-4 transition-colors duration-300 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 0: Contact Info */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="card">
                  <h2 className="heading-sm text-navy-950 mb-6">Contact Information</h2>
                  <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="full_name" className="label">Full Name <span className="text-red-500">*</span></label>
                        <input id="full_name" {...form1.register('full_name')} className={`input-field ${form1.formState.errors.full_name ? 'input-error' : ''}`} placeholder="John Smith" />
                        {form1.formState.errors.full_name && <p className="error-text">{form1.formState.errors.full_name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="company_name" className="label">Company Name</label>
                        <input id="company_name" {...form1.register('company_name')} className="input-field" placeholder="Your Company LLC" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="label">Email Address <span className="text-red-500">*</span></label>
                        <input id="email" type="email" {...form1.register('email')} className={`input-field ${form1.formState.errors.email ? 'input-error' : ''}`} placeholder="you@company.com" />
                        {form1.formState.errors.email && <p className="error-text">{form1.formState.errors.email.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="label">Phone Number</label>
                        <input id="phone" type="tel" {...form1.register('phone')} className="input-field" placeholder="(555) 000-0000" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Step 1: Shipment Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="card">
                  <h2 className="heading-sm text-navy-950 mb-6">Shipment Details</h2>
                  <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="pickup_location" className="label">Pickup Location <span className="text-red-500">*</span></label>
                        <input id="pickup_location" {...form2.register('pickup_location')} className={`input-field ${form2.formState.errors.pickup_location ? 'input-error' : ''}`} placeholder="City, State or ZIP" />
                        {form2.formState.errors.pickup_location && <p className="error-text">{form2.formState.errors.pickup_location.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="delivery_location" className="label">Delivery Location <span className="text-red-500">*</span></label>
                        <input id="delivery_location" {...form2.register('delivery_location')} className={`input-field ${form2.formState.errors.delivery_location ? 'input-error' : ''}`} placeholder="City, State or ZIP" />
                        {form2.formState.errors.delivery_location && <p className="error-text">{form2.formState.errors.delivery_location.message}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="pickup_date" className="label">Pickup Date</label>
                        <input id="pickup_date" type="date" {...form2.register('pickup_date')} className="input-field" />
                      </div>
                      <div>
                        <label htmlFor="delivery_date" className="label">Desired Delivery Date</label>
                        <input id="delivery_date" type="date" {...form2.register('delivery_date')} className="input-field" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="freight_type" className="label">Freight Type <span className="text-red-500">*</span></label>
                      <select id="freight_type" {...form2.register('freight_type')} className={`input-field ${form2.formState.errors.freight_type ? 'input-error' : ''}`}>
                        <option value="">Select freight type</option>
                        <option value="general">General Freight</option>
                        <option value="refrigerated">Refrigerated Freight</option>
                        <option value="produce">Fresh Produce</option>
                      </select>
                      {form2.formState.errors.freight_type && <p className="error-text">{form2.formState.errors.freight_type.message}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="commodity" className="label">Commodity Description</label>
                        <input id="commodity" {...form2.register('commodity')} className="input-field" placeholder="e.g., Electronics, Produce" />
                      </div>
                      <div>
                        <label htmlFor="equipment_type" className="label">Equipment Type</label>
                        <select id="equipment_type" {...form2.register('equipment_type')} className="input-field">
                          <option value="">Not sure / Any</option>
                          <option value="Dry Van">Dry Van</option>
                          <option value="Refrigerated (Reefer)">Refrigerated (Reefer)</option>
                          <option value="Flatbed">Flatbed</option>
                          <option value="Step Deck">Step Deck</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="weight" className="label">Estimated Weight</label>
                        <input id="weight" {...form2.register('weight')} className="input-field" placeholder="e.g., 10,000 lbs" />
                      </div>
                      <div>
                        <label htmlFor="pieces" className="label">Number of Pieces / Pallets</label>
                        <input id="pieces" type="number" {...form2.register('pieces')} className="input-field" placeholder="e.g., 20" min="1" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="shipment_notes" className="label">Special Requirements or Notes</label>
                      <textarea id="shipment_notes" {...form2.register('shipment_notes')} rows={3} className="input-field resize-none" placeholder="Any special handling, temperature requirements, or other notes..." />
                    </div>

                    <div className="flex justify-between">
                      <button type="button" onClick={() => setStep(0)} className="btn-secondary">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button type="submit" className="btn-primary">
                        Review Quote
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && step1Data && step2Data && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="card">
                  <h2 className="heading-sm text-navy-950 mb-6">Review Your Quote Request</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact Information</h3>
                      <dl className="grid sm:grid-cols-2 gap-3">
                        {[
                          ['Full Name', step1Data.full_name],
                          ['Company', step1Data.company_name || '—'],
                          ['Email', step1Data.email],
                          ['Phone', step1Data.phone || '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
                            <dt className="text-xs text-gray-400">{label}</dt>
                            <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Shipment Details</h3>
                      <dl className="grid sm:grid-cols-2 gap-3">
                        {[
                          ['Pickup Location', step2Data.pickup_location],
                          ['Delivery Location', step2Data.delivery_location],
                          ['Pickup Date', step2Data.pickup_date || '—'],
                          ['Delivery Date', step2Data.delivery_date || '—'],
                          ['Freight Type', step2Data.freight_type === 'general' ? 'General Freight' : step2Data.freight_type === 'refrigerated' ? 'Refrigerated Freight' : 'Fresh Produce'],
                          ['Commodity', step2Data.commodity || '—'],
                          ['Weight', step2Data.weight || '—'],
                          ['Equipment Type', step2Data.equipment_type || '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
                            <dt className="text-xs text-gray-400">{label}</dt>
                            <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      {step2Data.shipment_notes && (
                        <div className="bg-gray-50 rounded-lg px-4 py-3 mt-3">
                          <dt className="text-xs text-gray-400">Notes</dt>
                          <dd className="text-sm text-gray-900 mt-0.5">{step2Data.shipment_notes}</dd>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(1)} className="btn-secondary">
                      <ArrowLeft className="w-4 h-4" />
                      Edit Details
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary disabled:opacity-60">
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Quote Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && confirmation && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="heading-md text-navy-950 mb-3">Quote Request Received!</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Thank you for your request. We will review your shipment details and follow up with you shortly.
                </p>
                <div className="inline-block bg-navy-950 text-white px-6 py-3 rounded-xl mb-6">
                  <p className="text-xs text-white/50 mb-1">Reference Number</p>
                  <p className="text-xl font-bold tracking-wider">{confirmation.public_request_id}</p>
                </div>
                <p className="text-sm text-gray-400">
                  Please save your reference number. You can use it to follow up on your quote request.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
