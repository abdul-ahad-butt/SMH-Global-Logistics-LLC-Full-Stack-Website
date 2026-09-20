import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar, CheckCircle, Package, AlertCircle, Clock, Truck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { shipmentsApi } from '../services/api.js'
import type { PublicShipment } from '../types/index.js'

const statusOrder = [
  'Quote Requested', 'Booked', 'Carrier Assigned', 'Pickup Scheduled',
  'Picked Up', 'In Transit', 'At Destination', 'Delivered',
]

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  'Quote Requested': { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  'Booked': { color: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
  'Carrier Assigned': { color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-400' },
  'Pickup Scheduled': { color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-400' },
  'Picked Up': { color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-400' },
  'In Transit': { color: 'text-cyan-700', bg: 'bg-cyan-50', dot: 'bg-cyan-400' },
  'At Destination': { color: 'text-teal-700', bg: 'bg-teal-50', dot: 'bg-teal-400' },
  'Delivered': { color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  'Cancelled': { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Track() {
  const [searchParams] = useSearchParams()
  const [inputVal, setInputVal] = useState(searchParams.get('q') ?? '')
  const [shipment, setShipment] = useState<PublicShipment | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (tn: string) => {
    const num = tn.trim().toUpperCase()
    if (!num) return
    setIsLoading(true)
    setError('')
    setShipment(null)
    try {
      const data = await shipmentsApi.track(num)
      setShipment(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tracking number not found.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('q')) handleSearch(searchParams.get('q')!)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentStatusIndex = shipment ? statusOrder.indexOf(shipment.current_status) : -1
  const cfg = shipment ? (statusConfig[shipment.current_status] ?? statusConfig['Quote Requested']) : null

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-navy-950 to-[#1e2a5e]">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-label text-accent-400 mb-3">Track Your Freight</p>
            <h1 className="heading-xl text-white mb-6">Track Your Shipment</h1>
            <p className="text-white/60 mb-8">
              Enter your tracking number below to view the current status and history of your shipment.
            </p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputVal)}
                placeholder="e.g., SMH-000001"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                aria-label="Tracking number input"
              />
              <button
                onClick={() => handleSearch(inputVal)}
                disabled={isLoading || !inputVal.trim()}
                className="btn-primary px-8 flex-shrink-0 disabled:opacity-60"
                aria-label="Track shipment"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Track
              </button>
            </div>
            <p className="text-white/30 text-xs mt-3">Tracking numbers are in the format: SMH-XXXXXX</p>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding bg-gray-50 min-h-[400px]">
        <div className="container-custom max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card border-l-4 border-red-400"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Shipment Not Found</h2>
                    <p className="text-sm text-gray-500">{error}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Please check your tracking number and try again. Tracking numbers are in the format SMH-XXXXXX.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {shipment && cfg && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header card */}
                <div className="card">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tracking Number</p>
                      <h2 className="text-2xl font-bold text-navy-950 font-mono">{shipment.tracking_number}</h2>
                    </div>
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${cfg.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                      <span className={`font-semibold text-sm ${cfg.color}`}>{shipment.current_status}</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Origin</p>
                        <p className="font-medium text-sm text-gray-900">{shipment.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Destination</p>
                        <p className="font-medium text-sm text-gray-900">{shipment.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Est. Delivery</p>
                        <p className="font-medium text-sm text-gray-900">{formatDate(shipment.estimated_delivery)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {currentStatusIndex >= 0 && shipment.current_status !== 'Cancelled' && (
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Quote Requested</span>
                        <span>Delivered</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentStatusIndex + 1) / statusOrder.length) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="card">
                  <h3 className="font-bold text-navy-950 mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Shipment Timeline
                  </h3>
                  <div className="relative">
                    {shipment.events.length === 0 ? (
                      <p className="text-sm text-gray-400">No timeline events recorded yet.</p>
                    ) : (
                      <div className="space-y-0">
                        {[...shipment.events].reverse().map((event, i) => {
                          const eCfg = statusConfig[event.status] ?? statusConfig['Quote Requested']
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex gap-4 pb-6 last:pb-0 relative"
                            >
                              {/* Line */}
                              {i < shipment.events.length - 1 && (
                                <div className="absolute left-3.5 top-7 bottom-0 w-px bg-gray-100" />
                              )}
                              {/* Dot */}
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${i === 0 ? eCfg.bg : 'bg-gray-100'}`}>
                                {i === 0 ? (
                                  <CheckCircle className={`w-3.5 h-3.5 ${eCfg.color}`} />
                                ) : (
                                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <p className="font-semibold text-sm text-gray-900">{event.status}</p>
                                  {event.location && (
                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                      <MapPin className="w-3 h-3" />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                                {event.description && (
                                  <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(event.event_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Shipment status is updated by SMH Global Logistics LLC based on carrier communications. This is not a live GPS tracking system.
                </p>
              </motion.div>
            )}

            {!isLoading && !error && !shipment && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="font-semibold text-gray-500 mb-2">Enter a Tracking Number</h2>
                <p className="text-sm text-gray-400">
                  Your tracking number will be provided when your shipment is confirmed.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
