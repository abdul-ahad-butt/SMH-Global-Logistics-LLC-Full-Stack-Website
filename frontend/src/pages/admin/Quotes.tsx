import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Eye, Trash2, RefreshCw, Filter } from 'lucide-react'
import { quotesApi } from '../../services/api.js'
import type { QuoteStatus } from '../../types/index.js'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<QuoteStatus, string> = {
  new: 'badge-blue',
  reviewing: 'badge-yellow',
  quoted: 'badge-green',
  accepted: 'badge-green',
  declined: 'badge-red',
  archived: 'badge-gray',
}

export default function AdminQuotes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const status = searchParams.get('status') ?? ''
  const qc = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-quotes', page, search, status],
    queryFn: () => quotesApi.adminList({ page, limit: 15, search: search || undefined, status: status || undefined }),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: quotesApi.adminDelete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-quotes'] })
      toast.success('Quote request deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete quote request from ${name}?`)) {
      deleteMutation.mutate(id)
    }
  }

  const statuses: Array<QuoteStatus | ''> = ['', 'new', 'reviewing', 'quoted', 'accepted', 'declined', 'archived']

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Quote Requests</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.total ?? 0} total requests</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary gap-2 py-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

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
              placeholder="Search by name, email, location..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={status}
              onChange={(e) => setSearchParams({ page: '1', status: e.target.value })}
              className="input-field w-40"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === '' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Route</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No quote requests found.</td>
                </tr>
              ) : data?.items.map((q) => (
                <motion.tr
                  key={q.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group"
                >
                  <td>
                    <p className="font-medium text-gray-900">{q.full_name}</p>
                    <p className="text-xs text-gray-400">{q.email}</p>
                  </td>
                  <td>
                    <p className="text-xs">{q.pickup_location}</p>
                    <p className="text-xs text-gray-400">→ {q.delivery_location}</p>
                  </td>
                  <td className="capitalize text-xs">{q.freight_type}</td>
                  <td>
                    <span className={STATUS_COLORS[q.status]}>
                      {q.status}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/quotes/${q.id}`} className="p-1.5 text-gray-400 hover:text-navy-950 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id, q.full_name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {Array.from({ length: data.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setSearchParams({ page: String(i + 1), status })}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1 ? 'bg-navy-950 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
