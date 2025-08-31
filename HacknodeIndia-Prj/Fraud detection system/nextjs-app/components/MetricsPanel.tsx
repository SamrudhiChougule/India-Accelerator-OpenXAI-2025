'use client'

import React from 'react'  // ✅ Add this line

interface MetricsProps {
  metrics: {
    totalAccesses: number
    suspiciousAttempts: number
    activeUsers: number
    branchActivity: Record<string, number>
  }
}

export default function MetricsPanel({ metrics }: MetricsProps) {
  return (
    <div className="w-full flex gap-8 p-6 text-white">
      {/* Access Metrics */}
      <div className="flex-1 flex flex-col text-left">
        <h2 className="text-xl font-bold mb-4">Access Metrics</h2>
        <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-2 text-sm">
          <span>Total Accesses:</span>
          <span>{metrics.totalAccesses}</span>

          <span>Suspicious Attempts:</span>
          <span>{metrics.suspiciousAttempts}</span>

          <span>Active Users:</span>
          <span>{metrics.activeUsers}</span>
        </div>
      </div>

      {/* Branch Activity */}
      <div className="flex-1 flex flex-col text-left">
        <h2 className="text-xl font-bold mb-4">Branch Activity</h2>
        <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-2 text-sm">
          {Object.keys(metrics.branchActivity).map(branch => (
            <React.Fragment key={branch}>
              <span>{branch}:</span>
              <span>{metrics.branchActivity[branch]}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
