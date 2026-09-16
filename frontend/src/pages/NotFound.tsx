import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
      <div className="container-custom max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-24 h-24 bg-navy-950 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white font-bold text-4xl">
            404
          </div>
          <h1 className="heading-lg text-navy-950 mb-4">Page Not Found</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved. Please check the URL or navigate back to the homepage.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button onClick={() => window.history.back()} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
