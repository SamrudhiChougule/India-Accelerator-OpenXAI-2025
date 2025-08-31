'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

// Dynamically import components to avoid SSR issues
const Globe = dynamic(() => import('../components/Globe'), { ssr: false })
const MetricsPanel = dynamic(() => import('../components/MetricsPanel'), { ssr: false })
const AnalyticsPanel = dynamic(() => import('../components/AnalyticsPanel'), { ssr: false })

interface AccessLog {
  user: string
  branch: string
  timestamp: string
  purpose: string
  suspicious: boolean
}

interface BranchMetrics {
  totalAccesses: number
  suspiciousAttempts: number
  activeUsers: number
  branchActivity: Record<string, number>
}

interface AlertMessage {
  id: number
  text: string
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [showLocations, setShowLocations] = useState(false)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [metrics, setMetrics] = useState<BranchMetrics>({
    totalAccesses: 0,
    suspiciousAttempts: 0,
    activeUsers: 0,
    branchActivity: {
      "New York": 0,
      "London": 0,
      "Tokyo": 0,
      "Mumbai": 0
    }
  })
  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>([])
  const [alertIdCounter, setAlertIdCounter] = useState(0)

  // Simulate real-time access logs
  useEffect(() => {
    if (!isRunning) return

    const users = ["Alice", "Bob", "Charlie", "David", "Eve"]
    const branches = Object.keys(metrics.branchActivity)
    const purposes = ["Report Access", "HR Data", "Finance Data", "Confidential Project"]

    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomBranch = branches[Math.floor(Math.random() * branches.length)]
      const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)]

      const hour = new Date().getHours()
      const isSuspicious = hour < 6 || hour > 22 || Math.random() < 0.05

      const newLog: AccessLog = {
        user: randomUser,
        branch: randomBranch,
        timestamp: new Date().toLocaleTimeString(),
        purpose: randomPurpose,
        suspicious: isSuspicious
      }

      setAccessLogs(prev => {
        const updatedLogs = [newLog, ...prev.slice(0, 19)] // keep last 20
        return updatedLogs
      })

      setMetrics(prev => {
        const updatedBranchActivity = { ...prev.branchActivity }
        updatedBranchActivity[randomBranch] += 1

        // derive activeUsers from current logs + new log
        const uniqueUsers = new Set([randomUser, ...accessLogs.map(log => log.user)])

        return {
          totalAccesses: prev.totalAccesses + 1,
          suspiciousAttempts: prev.suspiciousAttempts + (isSuspicious ? 1 : 0),
          activeUsers: uniqueUsers.size,
          branchActivity: updatedBranchActivity
        }
      })

      // Trigger alert if suspicious
      if (isSuspicious) {
        const msg = `⚠️ ${randomUser} accessed ${randomBranch} at ${newLog.timestamp}`
        setAlertMessages(prev => [
          ...prev,
          { id: alertIdCounter, text: msg }
        ])
        setAlertIdCounter(prev => prev + 1)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isRunning, alertIdCounter, accessLogs])

  const resetDashboard = () => {
    setAccessLogs([])
    setMetrics({
      totalAccesses: 0,
      suspiciousAttempts: 0,
      activeUsers: 0,
      branchActivity: {
        "New York": 0,
        "London": 0,
        "Tokyo": 0,
        "Mumbai": 0
      }
    })
    setIsRunning(false)
    setShowLocations(false)
    setAlertMessages([])
    setAlertIdCounter(0)
  }

  // derive alerts from suspicious logs
  const alerts = accessLogs.filter(log => log.suspicious)

  const dismissAlert = (id: number) => {
    setAlertMessages(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Globe */}
      <div className="absolute inset-0 z-0">
        <Globe accessLogs={accessLogs} showLocations={showLocations} alerts={alerts} />
      </div>

      {/* Left Panel: Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <button
          onClick={() => {
            setIsRunning(!isRunning)
            if (!isRunning) setShowLocations(true)
          }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : 'Start'} Monitoring
        </button>
        <button
          onClick={resetDashboard}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          <RotateCcw size={16} />
          Reset Dashboard
        </button>

        {/* Alert Notifications */}
        <div className="space-y-2 mt-2">
          {alertMessages.map((alert) => (
            <div
              key={alert.id}
              className="flex justify-between items-center px-3 py-2 bg-red-600 text-white rounded shadow"
            >
              <span>{alert.text}</span>
              <button onClick={() => dismissAlert(alert.id)}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Analytics */}
      <div className="absolute top-0 bottom-0 right-0 z-10 w-1/3 p-4">
        <AnalyticsPanel metrics={metrics} />
      </div>

      {/* Bottom Center: MetricsPanel */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-4xl px-4">
        <MetricsPanel metrics={metrics} />
      </div>

      {/* Bottom Left: Access Logs */}
      <div className="absolute bottom-4 left-4 z-10 max-w-md max-h-96 overflow-y-auto bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2">Recent Access Logs</h3>
        {accessLogs.map((log, idx) => (
          <div
            key={idx}
            className={`p-1 border-l-2 ${log.suspicious ? 'border-red-500' : 'border-green-500'} mb-1`}
          >
            <div>
              <span className="font-semibold">{log.user}</span> @ {log.branch}
            </div>
            <div className="text-xs">
              {log.purpose} • {log.timestamp}
            </div>
          </div>
        ))}
        {accessLogs.length === 0 && <div>No activity yet</div>}
      </div>
    </div>
  )
}
