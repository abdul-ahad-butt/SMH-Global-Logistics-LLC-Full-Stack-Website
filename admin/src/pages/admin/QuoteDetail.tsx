import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { quotesApi } from '../../services/api.js'
import type { QuoteStatus } from '../../types/index.js'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const STATUSES: QuoteStatus[] = ['new', 'reviewing', 'quoted', 'accepted', 'declined', 'archived']

export default function AdminQuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: quote, isLoading } = useQuery({
    queryKey: ['admin-quote', id],
    queryFn: () => quotesApi.adminGet(id!),
    enabled: !!id,
  })

  const [status, setStatus] = useState<QuoteStatus>('new')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (quote) {
      setStatus(quote.status)
      setNotes(quote.internal_notes ?? '')
    }
  }, [quote])

  const updateMutation = useMutation({
    mutationFn: () => quotesApi.adminUpdate(id!, { status, internal_notes: notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-quote', id] })
      qc.invalidateQueries({ queryKey: ['admin-quotes'] })
      toast.success('Quote request updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quote) return <div className="text-center py-20 text-gray-400">Quote request not found.</div>

  const fields = [
    ['Full Name', quote.full_name],
    ['Company', quote.company_name || '—'],
    ['Email', quote.email],
    ['Phone', quote.phone || '—'],
    ['Reference ID', quote.public_request_id],
    ['Pickup Location', quote.pickup_location],
    ['Delivery Location', quote.delivery_location],
    ['Pickup Date', quote.pickup_date || '—'],
    ['Delivery Date', quote.delivery_date || '—'],
    ['Freight Type', quote.freight_type],
    ['Commodity', quote.commodity || '—'],
    ['Weight', quote.weight || '—'],
    ['Pieces', quote.pieces ? String(quote.pieces) : '—'],
    ['Equipment Type', quote.equipment_type || '—'],
    ['Submitted', new Date(quote.created_at).toLocaleString()],
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/quotes" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Quote Request</h1>
          <p className="text-gray-400 text-sm">{quote.full_name} · {quote.public_request_id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-navy-950 mb-4">Request Details</h2>
          <dl className="grid sm:grid-cols-2 gap-4">
            {fields.map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{value}</dd>
              </div>
            ))}
          </dl>
          {quote.shipment_notes && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Customer Notes</p>
              <p className="text-sm text-gray-700">{quote.shipment_notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-navy-950 mb-4">Update Status</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="quote_status" className="label">Status</label>
                <select
                  id="quote_status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                  className="input-field"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quote_notes" className="label">Internal Notes</label>
                <textarea
                  id="quote_notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Notes for internal use only..."
                />
              </div>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="btn-primary w-full justify-center"
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
