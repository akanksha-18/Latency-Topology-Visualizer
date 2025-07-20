// 'use client'

// import { useState } from 'react'
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
// import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
// import type { ExchangeData, LatencyData } from '../types/index'

// interface LatencyChartProps {
//   exchangeData: ExchangeData
//   latencyData: LatencyData[]
//   timeRange: '1h' | '24h' | '7d' | '30d'
// }

// export function LatencyChart({ exchangeData, latencyData, timeRange }: LatencyChartProps) {
//   const [selectedTimeRange, setSelectedTimeRange] = useState<typeof timeRange>(timeRange)

//   // Generate mock historical data for demonstration
//   const generateHistoricalData = (range: string) => {
//     const now = Date.now()
//     const points = range === '1h' ? 60 : range === '24h' ? 24 : range === '7d' ? 7 : 30
//     const interval = range === '1h' ? 60000 : range === '24h' ? 3600000 : range === '7d' ? 86400000 : 86400000
    
//     return Array.from({ length: points }, (_, i) => {
//       const time = now - (points - 1 - i) * interval
//       const baseLatency = exchangeData.latency
//       const variation = (Math.random() - 0.5) * 40
//       const latency = Math.max(10, baseLatency + variation)
      
//       return {
//         time: new Date(time).toLocaleTimeString([], { 
//           hour: '2-digit', 
//           minute: '2-digit',
//           ...(range === '7d' || range === '30d' ? { month: 'short', day: 'numeric' } : {})
//         }),
//         latency: Math.round(latency),
//         timestamp: time
//       }
//     })
//   }

//   const chartData = generateHistoricalData(selectedTimeRange)
//   const currentLatency = chartData[chartData.length - 1]?.latency || exchangeData.latency
//   const previousLatency = chartData[chartData.length - 2]?.latency || exchangeData.latency
//   const trend = currentLatency - previousLatency
//   const avgLatency = Math.round(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length)
//   const minLatency = Math.min(...chartData.map(d => d.latency))
//   const maxLatency = Math.max(...chartData.map(d => d.latency))

//   const timeRanges = [
//     { key: '1h', label: '1 Hour' },
//     { key: '24h', label: '24 Hours' },
//     { key: '7d', label: '7 Days' },
//     { key: '30d', label: '30 Days' },
//   ] as const

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//           {exchangeData.name} Latency
//         </h3>
//         <div className="flex items-center space-x-1">
//           {timeRanges.map(range => (
//             <button
//               key={range.key}
//               onClick={() => setSelectedTimeRange(range.key)}
//               className={`px-3 py-1 text-xs rounded-md transition-colors ${
//                 selectedTimeRange === range.key
//                   ? 'bg-cyber-blue text-white'
//                   : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
//               }`}
//             >
//               {range.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Stats Row */}
//       <div className="grid grid-cols-4 gap-3">
//         <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
//           <div className={`text-lg font-bold ${
//             currentLatency < 50 ? 'text-green-600' :
//             currentLatency < 150 ? 'text-yellow-600' :
//             'text-red-600'
//           }`}>
//             {currentLatency}ms
//           </div>
//           <div className="flex items-center text-xs">
//             {trend > 0 ? (
//               <TrendingUp className="w-3 h-3 text-red-500 mr-1" />
//             ) : (
//               <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
//             )}
//             <span className={trend > 0 ? 'text-red-500' : 'text-green-500'}>
//               {Math.abs(trend)}ms
//             </span>
//           </div>
//         </div>

//         <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
//           <div className="text-lg font-bold text-gray-900 dark:text-white">{avgLatency}ms</div>
//         </div>

//         <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <div className="text-xs text-gray-500 dark:text-gray-400">Min</div>
//           <div className="text-lg font-bold text-green-600">{minLatency}ms</div>
//         </div>

//         <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <div className="text-xs text-gray-500 dark:text-gray-400">Max</div>
//           <div className="text-lg font-bold text-red-600">{maxLatency}ms</div>
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="h-64">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={chartData}>
//             <defs>
//               <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
//             <XAxis 
//               dataKey="time" 
//               tick={{ fontSize: 12, fill: '#6b7280' }}
//               tickLine={{ stroke: '#6b7280' }}
//             />
//             <YAxis 
//               tick={{ fontSize: 12, fill: '#6b7280' }}
//               tickLine={{ stroke: '#6b7280' }}
//               domain={['dataMin - 10', 'dataMax + 10']}
//             />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: '#1f2937',
//                 border: '1px solid #374151',
//                 borderRadius: '8px',
//                 color: '#f9fafb'
//               }}
//               labelStyle={{ color: '#9ca3af' }}
//             />
//             <Area
//               type="monotone"
//               dataKey="latency"
//               stroke="#00f5ff"
//               strokeWidth={2}
//               fill="url(#latencyGradient)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Exchange Details */}
//       <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
//         <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exchange Details</h4>
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Location:</span>
//             <span className="ml-2 text-gray-900 dark:text-white">
//               {exchangeData.location.city}, {exchangeData.location.country}
//             </span>
//           </div>
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Cloud Provider:</span>
//             <span className={`ml-2 font-medium ${
//               exchangeData.cloudProvider === 'aws' ? 'text-orange-600' :
//               exchangeData.cloudProvider === 'gcp' ? 'text-blue-600' :
//               'text-purple-600'
//             }`}>
//               {exchangeData.cloudProvider.toUpperCase()}
//             </span>
//           </div>
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Region:</span>
//             <span className="ml-2 text-gray-900 dark:text-white">{exchangeData.region}</span>
//           </div>
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Status:</span>
//             <span className="ml-2">
//               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
//                 Online
//               </span>
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ExchangeData, LatencyData } from '../types/index'

interface LatencyChartProps {
  exchangeData: ExchangeData
  latencyData?: LatencyData[]
  timeRange: '1h' | '24h' | '7d' | '30d'
}

// Helper to simulate real-time latency
const measureLatency = async (url: string): Promise<number> => {
  const start = performance.now()
  try {
    await fetch(url, { mode: 'no-cors' })
  } catch (_) {}
  const end = performance.now()
  return Math.round(end - start)
}

export function LatencyChart({ exchangeData, timeRange }: LatencyChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<typeof timeRange>(timeRange)
  const [liveData, setLiveData] = useState<LatencyData[]>([])

  useEffect(() => {
    const interval = setInterval(async () => {
      const latency = await measureLatency('https://www.google.com')
      const now = Date.now()
      const newPoint: LatencyData = {
        id: `${exchangeData.id}-${now}`,
        sourceId: 'self',
        targetId: exchangeData.id,
        latency,
        timestamp: now,
        status: 'active'
      }
      setLiveData(prev => [...prev.slice(-59), newPoint])
    }, 5000)

    return () => clearInterval(interval)
  }, [exchangeData.id])

  const chartData =
    selectedTimeRange === '1h'
      ? liveData.map(d => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      : generateHistoricalData(selectedTimeRange, exchangeData)

  const currentLatency = chartData.at(-1)?.latency || exchangeData.latency
  const previousLatency = chartData.at(-2)?.latency || exchangeData.latency
  const trend = currentLatency - previousLatency
  const avgLatency = Math.round(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length)
  const minLatency = Math.min(...chartData.map(d => d.latency))
  const maxLatency = Math.max(...chartData.map(d => d.latency))

  const timeRanges = [
    { key: '1h', label: '1 Hour' },
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' }
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {exchangeData.name} Latency
        </h3>
        <div className="flex items-center space-x-1">
          {timeRanges.map(range => (
            <button
              key={range.key}
              onClick={() => setSelectedTimeRange(range.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedTimeRange === range.key
                  ? 'bg-cyber-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <LatencyStat label="Current" value={currentLatency} trend={trend} />
        <LatencyStat label="Average" value={avgLatency} />
        <LatencyStat label="Min" value={minLatency} />
        <LatencyStat label="Max" value={maxLatency} />
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area
              type="monotone"
              dataKey="latency"
              stroke="#00f5ff"
              strokeWidth={2}
              fill="url(#latencyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ✅ Component for latency stats
function LatencyStat({ label, value, trend }: { label: string; value: number; trend?: number }) {
  const color =
    label === 'Max' ? 'text-red-600' : label === 'Min' ? 'text-green-600' : 'text-gray-900'
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`text-lg font-bold ${color} dark:text-white`}>
        {value}ms
      </div>
      {typeof trend === 'number' && (
        <div className="flex items-center text-xs">
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-red-500 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
          )}
          <span className={trend > 0 ? 'text-red-500' : 'text-green-500'}>
            {Math.abs(trend)}ms
          </span>
        </div>
      )}
    </div>
  )
}

// ✅ Generate mock historical data
function generateHistoricalData(range: string, exchangeData: ExchangeData): LatencyData[] {
  const now = Date.now()
  const points = range === '1h' ? 60 : range === '24h' ? 24 : range === '7d' ? 7 : 30
  const interval = range === '1h' ? 60000 : 3600000
  const { id } = exchangeData

  return Array.from({ length: points }, (_, i) => {
    const time = now - (points - 1 - i) * interval
    const variation = (Math.random() - 0.5) * 40
    const latency = Math.max(10, exchangeData.latency + variation)

    return {
      id: `${id}-${time}`,
      sourceId: 'self',
      targetId: id,
      latency: Math.round(latency),
      timestamp: time,
      status: 'active',
      time: new Date(time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        ...(range === '7d' || range === '30d' ? { month: 'short', day: 'numeric' } : {})
      })
    } as LatencyData & { time: string }
  })
}
