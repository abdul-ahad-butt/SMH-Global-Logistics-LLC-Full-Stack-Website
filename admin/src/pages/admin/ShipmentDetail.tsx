import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Plus, MapPin, Clock } from 'lucide-react'
import { shipmentsApi } from '../../services/api.js'
import type { ShipmentStatus } from '../../types/index.js'
import toast from 'react-hot-toast'

const STATUSES: ShipmentStatus[] = [
  'Quote Requested', 'Booked', 'Carrier Assigned', 'Pickup Scheduled',
  'Picked Up', 'In Transit', 'At Destination', 'Delivered', 'Cancelled',
]

export default function AdminShipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['admin-shipment', id],
    queryFn: () => shipmentsApi.adminGet(id!),
    enabled: !!id,
  })

  const [editData, setEditData] = useState<Partial<typeof shipment>>({})
  const [newEvent, setNewEvent] = useState({ status: '', location: '', description: '' })
  const [showEventForm, setShowEventForm] = useState(false)

  useEffect(() => {
    if (shipment) {
      setEditData({
        current_status: shipment.current_status,
        customer_name: shipment.customer_name ?? '',
        customer_email: shipment.customer_email ?? '',
        origin: shipment.origin,
        destination: shipment.destination,
        pickup_date: shipment.pickup_date ?? '',
        estimated_delivery: shipment.estimated_delivery ?? '',
        notes: shipment.notes ?? '',
      })
    }
  }, [shipment])

  const updateMutation = useMutation({
    mutationFn: () => shipmentsApi.adminUpdate(id!, editData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-shipment', id] })
      qc.invalidateQueries({ queryKey: ['admin-shipments'] })
      toast.success('Shipment updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const addEventMutation = useMutation({
    mutationFn: () => shipmentsApi.adminAddEvent(id!, newEvent),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-shipment', id] })
      setNewEvent({ status: '', location: '', description: '' })
      setShowEventForm(false)
      toast.success('Event added')
    },
    onError: () => toast.error('Failed to add event'),
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!shipment) return <div className="text-center py-20 text-gray-400">Shipment not found.</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/shipments" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-950 font-mono">{shipment.tracking_number}</h1>
          <p className="text-gray-400 text-sm">{shipment.origin} → {shipment.destination}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold text-navy-950 mb-4">Shipment Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Customer Name</label>
                <input value={editData.customer_name ?? ''} onChange={e => setEditData(p => ({ ...p, customer_name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Customer Email</label>
                <input type="email" value={editData.customer_email ?? ''} onChange={e => setEditData(p => ({ ...p, customer_email: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Origin</label>
                <input value={editData.origin ?? ''} onChange={e => setEditData(p => ({ ...p, origin: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Destination</label>
                <input value={editData.destination ?? ''} onChange={e => setEditData(p => ({ ...p, destination: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Pickup Date</label>
                <input type="date" value={editData.pickup_date ?? ''} onChange={e => setEditData(p => ({ ...p, pickup_date: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Est. Delivery Date</label>
                <input type="date" value={editData.estimated_delivery ?? ''} onChange={e => setEditData(p => ({ ...p, estimated_delivery: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Current Status</label>
                <select value={editData.current_status ?? ''} onChange={e => setEditData(p => ({ ...p, current_status: e.target.value as ShipmentStatus }))} className="input-field">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Internal Notes</label>
              <textarea value={editData.notes ?? ''} onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))} rows={3} className="input-field resize-none" />
            </div>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="btn-primary mt-4 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-950 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline Events
              </h2>
              <button onClick={() => setShowEventForm(!showEventForm)} className="btn-secondary py-1.5 text-sm gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Event
              </button>
            </div>

            {showEventForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Status <span className="text-red-500">*</span></label>
                    <select value={newEvent.status} onChange={e => setNewEvent(p => ({ ...p, status: e.target.value }))} className="input-field">
                      <option value="">Select status</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} className="input-field" placeholder="City, ST" />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <input value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="Optional additional details..." />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addEventMutation.mutate()}
                    disabled={!newEvent.status || addEventMutation.isPending}
                    className="btn-primary py-2 text-sm disabled:opacity-60"
                  >
                    {addEventMutation.isPending ? 'Adding...' : 'Add Event'}
                  </button>
                  <button onClick={() => setShowEventForm(false)} className="btn-secondary py-2 text-sm">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(!shipment.events || shipment.events.length === 0) ? (
                <p className="text-sm text-gray-400 text-center py-4">No events yet. Add the first event above.</p>
              ) : [...shipment.events].reverse().map((ev) => (
                <div key={ev.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-6 h-6 bg-navy-950 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{ev.status}</p>
                    {ev.location && <p className="text-xs text-gray-500">{ev.location}</p>}
                    {ev.description && <p className="text-xs text-gray-400 mt-0.5">{ev.description}</p>}
                    <p className="text-xs text-gray-300 mt-1">{new Date(ev.event_time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="card h-fit">
          <h2 className="font-semibold text-navy-950 mb-4">Quick Info</h2>
          <dl className="space-y-3">
            {[
              ['Tracking #', shipment.tracking_number],
              ['Status', shipment.current_status],
              ['Freight Type', shipment.freight_type || '—'],
              ['Created', new Date(shipment.created_at).toLocaleDateString()],
              ['Updated', new Date(shipment.updated_at).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
