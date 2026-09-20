import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Package, MessageSquare, AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { statsApi } from '../../services/api.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../../hooks/useAuth.js'

function StatCard({ title, value, sub, icon: Icon, color, to }: {
  title: string; value: number; sub: string; icon: React.ElementType; color: string; to: string
}) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -2 }}
        className="card-hover flex items-start gap-4"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-0.5">{title}</p>
          <p className="text-2xl font-bold text-navy-950">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      </motion.div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { admin, checkAuth } = useAuth()

  useEffect(() => { checkAuth() }, [checkAuth])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: statsApi.get,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-950">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, {admin?.email}</p>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Quote Requests"
          value={stats?.totalQuotes ?? 0}
          sub={`${stats?.newQuotes ?? 0} new`}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
          to="/admin/quotes"
        />
        <StatCard
          title="New Quotes"
          value={stats?.newQuotes ?? 0}
          sub="Awaiting review"
          icon={AlertCircle}
          color="bg-yellow-50 text-yellow-600"
          to="/admin/quotes?status=new"
        />
        <StatCard
          title="Contact Messages"
          value={stats?.totalMessages ?? 0}
          sub={`${stats?.unreadMessages ?? 0} unread`}
          icon={MessageSquare}
          color="bg-purple-50 text-purple-600"
          to="/admin/messages"
        />
        <StatCard
          title="Active Shipments"
          value={stats?.activeShipments ?? 0}
          sub="In progress"
          icon={Package}
          color="bg-orange-50 text-orange-600"
          to="/admin/shipments"
        />
        <StatCard
          title="Delivered Shipments"
          value={stats?.deliveredShipments ?? 0}
          sub="Completed"
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
          to="/admin/shipments?status=Delivered"
        />
        <StatCard
          title="Unread Messages"
          value={stats?.unreadMessages ?? 0}
          sub="Need attention"
          icon={Clock}
          color="bg-red-50 text-red-600"
          to="/admin/messages?status=unread"
        />
      </div>

      {/* Chart */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-navy-950">Quote Requests — Last 7 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.recentActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => {
                const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`
              }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v) => [v, 'Quotes']}
                labelFormatter={(label) => new Date(label as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Bar dataKey="count" fill="#1e1b4b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { to: '/admin/quotes', label: 'Manage Quotes', desc: 'View and respond to quote requests' },
          { to: '/admin/shipments', label: 'Manage Shipments', desc: 'Create and track shipments' },
          { to: '/admin/messages', label: 'View Messages', desc: 'Read and respond to contact messages' },
        ].map(({ to, label, desc }) => (
          <Link key={to} to={to} className="card hover:shadow-card-hover transition-shadow group">
            <h3 className="font-semibold text-navy-950 mb-1 group-hover:text-accent-600 transition-colors">{label}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
