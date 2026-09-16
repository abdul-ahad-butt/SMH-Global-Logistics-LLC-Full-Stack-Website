import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../../services/api.js'
import { Save, Globe, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminContent() {
  const qc = useQueryClient()
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const { data: contentItems, isLoading, refetch } = useQuery({
    queryKey: ['admin-content'],
    queryFn: contentApi.adminGetAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      contentApi.adminUpdate(key, value),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-content'] })
      setSaving(p => ({ ...p, [vars.key]: false }))
      toast.success('Content updated')
    },
    onError: (_, vars) => {
      setSaving(p => ({ ...p, [vars.key]: false }))
      toast.error('Failed to update')
    },
  })

  const handleSave = (key: string) => {
    const value = edits[key]
    if (value === undefined) return
    setSaving(p => ({ ...p, [key]: true }))
    updateMutation.mutate({ key, value })
  }

  const handleChange = (key: string, value: string) => {
    setEdits(p => ({ ...p, [key]: value }))
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Website Content</h1>
          <p className="text-gray-400 text-sm mt-0.5">Edit dynamic content displayed on the website</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary py-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {(!contentItems || contentItems.length === 0) ? (
          <div className="card text-center py-12 text-gray-400">
            <Globe className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No content items configured yet.</p>
            <p className="text-xs mt-1">Content items are seeded in the database during initial setup.</p>
          </div>
        ) : contentItems.map((item) => {
          const currentValue = edits[item.content_key] ?? item.content_value
          const isDirty = edits[item.content_key] !== undefined && edits[item.content_key] !== item.content_value
          const isTextarea = item.content_value.length > 100

          return (
            <div key={item.content_key} className={`card transition-all ${isDirty ? 'border-l-4 border-accent-400' : ''}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-navy-950">{item.content_key}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Last updated: {new Date(item.updated_at).toLocaleDateString()}
                  </p>
                </div>
                {isDirty && (
                  <button
                    onClick={() => handleSave(item.content_key)}
                    disabled={saving[item.content_key]}
                    className="btn-primary py-1.5 text-sm flex-shrink-0 disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving[item.content_key] ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
              {isTextarea ? (
                <textarea
                  value={currentValue}
                  onChange={(e) => handleChange(item.content_key, e.target.value)}
                  rows={4}
                  className="input-field resize-y"
                />
              ) : (
                <input
                  value={currentValue}
                  onChange={(e) => handleChange(item.content_key, e.target.value)}
                  className="input-field"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
