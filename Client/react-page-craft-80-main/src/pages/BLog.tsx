import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface BlogProps {
  Title: string
  Description: string
  Url: string
}

const BLog: React.FC<BlogProps> = ({ Title, Description, Url }) => {
  return (
    <button 
      className="group w-full bg-white hover:bg-blue-50/50 p-4 rounded-xl 
        border border-gray-100 hover:border-blue-100
        flex justify-between items-center text-left
        transition-all duration-300 relative overflow-hidden"
      onClick={() => window.open(Url, '_blank')}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-2 max-w-[70%] relative">
        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 
          transition-colors line-clamp-2">{Title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{Description}</p>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 
          flex items-center justify-center transform group-hover:scale-105 
          transition-transform">
          <ArrowUpRight className="w-5 h-5 text-blue-600 transform 
            group-hover:translate-x-0.5 group-hover:-translate-y-0.5 
            transition-transform" />
        </div>
      </div>
    </button>
  )
}

export default BLog
