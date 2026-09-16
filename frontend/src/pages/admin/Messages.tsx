import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Archive, Mail, RefreshCw, Trash2 } from 'lucide-react'
import { contactApi } from '../../services/api.js'
import type { MessageStatus } from '../../types/index.js'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<MessageStatus, string> = {
  unread: 'badge-blue',
  read: 'badge-gray',
  archived: 'badge-gray',
}

export default function AdminMessages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const status = searchParams.get('status') ?? ''
  const qc = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-messages', page, search, status],
    queryFn: () => contactApi.adminList({ page, limit: 15, search: search || undefined, status: status || undefined }),
    placeholderData: (prev) => prev,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => contactApi.adminUpdate(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: contactApi.adminDelete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
      toast.success('Message deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleExpand = (id: number, currentStatus: MessageStatus) => {
    setExpanded(expanded === id ? null : id)
    if (currentStatus === 'unread') {
      updateMutation.mutate({ id, status: 'read' })
    }
  }

  const statuses: Array<MessageStatus | ''> = ['', 'unread', 'read', 'archived']

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Messages</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.total ?? 0} messages</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary py-2">
          <RefreshCw className="w-4 h-4" />
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
              placeholder="Search messages..."
              className="input-field pl-10"
            />
          </div>
          <select value={status} onChange={(e) => setSearchParams({ page: '1', status: e.target.value })} className="input-field w-36">
            {statuses.map(s => (
              <option key={s} value={s}>{s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : data?.items.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No messages found.</div>
        ) : data?.items.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`card cursor-pointer hover:shadow-card-hover transition-all ${msg.status === 'unread' ? 'border-l-4 border-blue-400' : ''}`}
            onClick={() => handleExpand(msg.id, msg.status)}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.status === 'unread' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Mail className={`w-4 h-4 ${msg.status === 'unread' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-semibold text-sm ${msg.status === 'unread' ? 'text-navy-950' : 'text-gray-600'}`}>{msg.name}</p>
                    <span className={STATUS_COLORS[msg.status]}>{msg.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{msg.email}</p>
                  <p className={`text-sm mt-1 ${msg.status === 'unread' ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{msg.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: msg.id, status: 'archived' }) }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Archive"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete message?')) deleteMutation.mutate(msg.id) }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {expanded === msg.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {msg.company && <div><p className="text-xs text-gray-400">Company</p><p className="text-sm">{msg.company}</p></div>}
                  {msg.phone && <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm">{msg.phone}</p></div>}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`} className="btn-primary py-2 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setSearchParams({ page: String(i + 1), status })}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-navy-950 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
