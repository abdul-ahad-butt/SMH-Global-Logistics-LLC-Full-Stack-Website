import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Eye, Trash2, Plus, RefreshCw } from 'lucide-react'
import { shipmentsApi } from '../../services/api.js'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  'Quote Requested': 'badge-blue',
  'Booked': 'badge-blue',
  'Carrier Assigned': 'badge-yellow',
  'Pickup Scheduled': 'badge-yellow',
  'Picked Up': 'badge-yellow',
  'In Transit': 'badge-blue',
  'At Destination': 'badge-blue',
  'Delivered': 'badge-green',
  'Cancelled': 'badge-red',
}

export default function AdminShipments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newShipment, setNewShipment] = useState({ origin: '', destination: '', customer_name: '', customer_email: '', freight_type: '' })
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const status = searchParams.get('status') ?? ''
  const qc = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-shipments', page, search, status],
    queryFn: () => shipmentsApi.adminList({ page, limit: 15, search: search || undefined, status: status || undefined }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: () => shipmentsApi.adminCreate(newShipment),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-shipments'] })
      toast.success(`Shipment created: ${res.tracking_number}`)
      setShowCreate(false)
      setNewShipment({ origin: '', destination: '', customer_name: '', customer_email: '', freight_type: '' })
    },
    onError: () => toast.error('Failed to create shipment'),
  })

  const deleteMutation = useMutation({
    mutationFn: shipmentsApi.adminDelete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-shipments'] })
      toast.success('Shipment deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const STATUSES = ['', 'Quote Requested', 'Booked', 'Carrier Assigned', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'At Destination', 'Delivered', 'Cancelled']

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Shipments</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.total ?? 0} total shipments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn-secondary py-2">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Shipment
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 border-l-4 border-accent-500"
        >
          <h2 className="font-semibold text-navy-950 mb-4">Create New Shipment</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Origin <span className="text-red-500">*</span></label>
              <input value={newShipment.origin} onChange={(e) => setNewShipment(p => ({ ...p, origin: e.target.value }))} className="input-field" placeholder="e.g., Miami, FL" />
            </div>
            <div>
              <label className="label">Destination <span className="text-red-500">*</span></label>
              <input value={newShipment.destination} onChange={(e) => setNewShipment(p => ({ ...p, destination: e.target.value }))} className="input-field" placeholder="e.g., New York, NY" />
            </div>
            <div>
              <label className="label">Customer Name</label>
              <input value={newShipment.customer_name} onChange={(e) => setNewShipment(p => ({ ...p, customer_name: e.target.value }))} className="input-field" placeholder="Optional" />
            </div>
            <div>
              <label className="label">Customer Email</label>
              <input type="email" value={newShipment.customer_email} onChange={(e) => setNewShipment(p => ({ ...p, customer_email: e.target.value }))} className="input-field" placeholder="Optional" />
            </div>
            <div>
              <label className="label">Freight Type</label>
              <select value={newShipment.freight_type} onChange={(e) => setNewShipment(p => ({ ...p, freight_type: e.target.value }))} className="input-field">
                <option value="">Select...</option>
                <option value="General Freight">General Freight</option>
                <option value="Refrigerated Freight">Refrigerated Freight</option>
                <option value="Fresh Produce">Fresh Produce</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!newShipment.origin || !newShipment.destination || createMutation.isPending}
              className="btn-primary disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Shipment'}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchParams({ page: '1', status })}
              placeholder="Search by tracking number, customer..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setSearchParams({ page: '1', status: e.target.value })}
            className="input-field w-48"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === '' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : data?.items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No shipments found.</td></tr>
              ) : data?.items.map((s) => (
                <tr key={s.id} className="group">
                  <td className="font-mono text-sm font-medium">{s.tracking_number}</td>
                  <td>
                    <p className="font-medium text-sm text-gray-900">{s.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{s.customer_email || ''}</p>
                  </td>
                  <td>
                    <p className="text-xs">{s.origin}</p>
                    <p className="text-xs text-gray-400">→ {s.destination}</p>
                  </td>
                  <td>
                    <span className={STATUS_COLORS[s.current_status] ?? 'badge-gray'}>
                      {s.current_status}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">{new Date(s.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/shipments/${s.id}`} className="p-1.5 text-gray-400 hover:text-navy-950 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => { if (confirm('Delete shipment?')) deleteMutation.mutate(s.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setSearchParams({ page: String(i + 1), status })}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-navy-950 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
