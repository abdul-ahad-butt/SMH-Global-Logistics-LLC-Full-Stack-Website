import { Shield, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'

export default function AdminSettings() {
  const { admin } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-950">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Account and system information</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account Info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-navy-950 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-navy-950">Account Information</h2>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <dt className="text-sm text-gray-400">Email Address</dt>
              <dd className="text-sm font-medium text-gray-900">{admin?.email}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <dt className="text-sm text-gray-400">Role</dt>
              <dd className="text-sm font-medium text-gray-900">Administrator</dd>
            </div>
          </dl>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              To change your admin password, use the Wrangler CLI to update the <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">admin_password_hash</code> field in the D1 database, or run the provided setup script.
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-navy-950">Company Information</h2>
          </div>
          <dl className="space-y-3">
            {[
              ['Legal Name', 'SMH Global Logistics LLC'],
              ['USDOT', '3145157'],
              ['MC Number', 'MC-101721'],
              ['Authority', 'Logistics Broker'],
              ['Operation', 'Interstate'],
              ['Status', 'Active'],
              ['Phone', '(407) 271-6983'],
              ['Physical Address', '5879 Ansley Way, Mount Dora, FL 32757'],
              ['Mailing Address', '5424 Lake Street, Tangerine, FL 32777'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0 gap-4">
                <dt className="text-sm text-gray-400 flex-shrink-0">{label}</dt>
                <dd className="text-sm text-gray-900 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
