import React from 'react'

const BLog = (content: {Title: string, Description: string, Url: string}) => {
  return (
    <button 
      className="w-full bg-teal-800 text-white p-4 rounded-lg flex justify-between items-center text-left"
      onClick={() => window.open(content.Url, '_blank')}
    >
      <div className="space-y-1 max-w-[60%]">
        <h3 className="font-medium text-sm">{content.Title}</h3>
        <p className="text-xs">{content.Description}</p>
      </div>
      <div className="w-16 h-16 bg-teal-600 rounded-full"></div>
    </button>
  )
}

export default BLog
