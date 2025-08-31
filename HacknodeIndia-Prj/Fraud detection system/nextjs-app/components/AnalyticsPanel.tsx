'use client'

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const COLORS = ['#FF4D4F', '#00C49F']; // Red = suspicious, Green = normal

interface AnalyticsProps {
  metrics: {
    totalAccesses: number
    branchActivity: Record<string, number>
    suspiciousAttempts: number
  }
}

export default function AnalyticsPanel({ metrics }: AnalyticsProps) {
  const branchData = Object.keys(metrics.branchActivity).map(branch => ({
    name: branch,
    accesses: metrics.branchActivity[branch]
  }))

  const normalAttempts = Math.max(0, metrics.totalAccesses - metrics.suspiciousAttempts);

  const suspiciousData = [
    { name: 'Suspicious', value: metrics.suspiciousAttempts },
    { name: 'Normal', value: normalAttempts }
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 gap-6 bg-transparent text-white">
      <h2 className="text-2xl font-bold mb-2 text-center drop-shadow-lg">Analytics</h2>

      {/* Branch Accesses */}
      <div className="flex-1 min-h-[200px]">
        <h3 className="text-lg mb-2 text-center drop-shadow-md">Branch Accesses</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={branchData} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none' }} />
            <Bar dataKey="accesses" fill="#00ffcc" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Suspicious Attempts Pie */}
      <h3 className="text-lg mb-2 text-center">Suspicious Attempts</h3>
      {metrics.totalAccesses > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={suspiciousData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {suspiciousData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center mt-12">No suspicious attempts yet</div>
      )}
    </div>
  )
}
