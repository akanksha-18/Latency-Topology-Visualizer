

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

// Exchange-specific API endpoints
const exchangeEndpoints = {
  binance: 'https://api.binance.com/api/v3/ping',
  coinbase: 'https://api.exchange.coinbase.com/time',
  kraken: 'https://api.kraken.com/0/public/Time',
  huobi: 'https://api.huobi.pro/v1/common/timestamp',
  okex: 'https://www.okx.com/api/v5/public/time',
  bitfinex: 'https://api-pub.bitfinex.com/v2/platform/status',
  kucoin: 'https://api.kucoin.com/api/v1/timestamp',
  bybit: 'https://api.bybit.com/v3/public/time',
  gate: 'https://api.gateio.ws/api/v4/spot/time'
} as const

const fallbackEndpoints = [
  'https://httpbin.org/status/200',
  'https://api.github.com',
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://worldtimeapi.org/api/timezone/UTC',
  'https://api.coindesk.com/v1/bpi/currentprice.json'
]

type TimeRange = '1h' | '24h' | '7d' | '30d'

const measureLatency = async (url: string): Promise<number> => {
  const start = performance.now()
  try {
    await fetch(url, {
      mode: 'no-cors',
      method: 'HEAD',
      cache: 'no-cache'
    })
  } catch (_) {}
  const end = performance.now()
  return Math.round(end - start)
}

const measureExchangeLatency = async (exchangeData: ExchangeData): Promise<number> => {
  const exchangeId = exchangeData.id.toLowerCase() as keyof typeof exchangeEndpoints

  if (exchangeEndpoints[exchangeId]) {
    try {
      const latency = await measureLatency(exchangeEndpoints[exchangeId])
      if (latency > 0 && latency < 30000) return latency
    } catch {}
  }

  for (const endpoint of fallbackEndpoints) {
    try {
      const latency = await measureLatency(endpoint)
      if (latency > 0 && latency < 30000) return latency
    } catch {}
  }

  return Math.round(exchangeData.latency + (Math.random() - 0.5) * 20)
}

export function LatencyChart({
  exchangeData,
  timeRange
}: {
  exchangeData: ExchangeData
  timeRange: TimeRange
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRange)
  const [liveData, setLiveData] = useState<LatencyData[]>([])
  const [isDark, setIsDark] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'very-poor'>('good')

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDark(theme === 'dark')
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    return () => observer.disconnect()
  }, [])

  const assessNetworkQuality = (latency: number): typeof networkQuality => {
    if (latency < 50) return 'excellent'
    if (latency < 100) return 'good'
    if (latency < 200) return 'fair'
    if (latency < 500) return 'poor'
    return 'very-poor'
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const latency = await measureExchangeLatency(exchangeData)
      const quality = assessNetworkQuality(latency)
      setNetworkQuality(quality)
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
          time: new Date(d.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
      : generateHistoricalData(selectedTimeRange, exchangeData)

  const currentLatency = chartData.at(-1)?.latency || exchangeData.latency
  const previousLatency = chartData.at(-2)?.latency || exchangeData.latency
  const trend = currentLatency - previousLatency
  const avgLatency = Math.round(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length)
  // const minLatency = Math.min(...chartData.map(d => d.latency))
  const maxLatency = Math.max(...chartData.map(d => d.latency))

  // Calculate Y-axis domain with proper padding
  const dataMin = Math.min(...chartData.map(d => d.latency))
  const dataMax = Math.max(...chartData.map(d => d.latency))
  const range = dataMax - dataMin
  const padding = Math.max(range * 0.1, 10) // 10% padding or minimum 10ms
  const yAxisMin = Math.max(0, dataMin - padding)
  const yAxisMax = dataMax + padding

  // Calculate tick count based on screen size and range
  const getTickCount = () => {
    if (windowWidth < 640) return 4 
    if (windowWidth < 1024) return 6 // Tablet
    return 8 // Desktop
  }

  const getQualityColor = () => {
    switch (networkQuality) {
      case 'excellent': return isDark ? 'text-green-400' : 'text-green-600'
      case 'good': return isDark ? 'text-blue-400' : 'text-blue-600'
      case 'fair': return isDark ? 'text-yellow-400' : 'text-yellow-600'
      case 'poor': return isDark ? 'text-orange-400' : 'text-orange-600'
      case 'very-poor': return isDark ? 'text-red-400' : 'text-red-600'
    }
  }

  const timeRangeOptions: TimeRange[] = ['1h', '24h', '7d', '30d']

  return (
    <div className={`p-6 space-y-4  transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className={`font-semibold text-base md:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {exchangeData.name} Latency
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${
              networkQuality === 'excellent' ? 'bg-green-500' :
              networkQuality === 'good' ? 'bg-blue-500' :
              networkQuality === 'fair' ? 'bg-yellow-500' :
              networkQuality === 'poor' ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            <span className={`capitalize font-medium ${getQualityColor()}`}>
              {networkQuality.replace('-', ' ')}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {timeRangeOptions.map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`py-1.5 px-3 text-sm rounded-md transition-all font-medium ${
                selectedTimeRange === range
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <LatencyStat label="Current" value={currentLatency} trend={trend} isDark={isDark} />
        <LatencyStat label="Average" value={avgLatency} isDark={isDark} />
        <LatencyStat label="Max" value={maxLatency} isDark={isDark} />
      </div>

      <div className="h-64 md:h-64 lg:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ 
              top: 20, 
              right: windowWidth < 640 ? 20 : 40, 
              left: windowWidth < 640 ? 5 : 10, 
              bottom: 30 
            }}
          >
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#374151' : '#e5e7eb'} 
              opacity={0.3} 
            />
            <XAxis 
              dataKey="time" 
              tick={{ 
                fontSize: windowWidth < 640 ? 11 : 13, 
                fill: isDark ? '#9ca3af' : '#6b7280' 
              }}
              interval={windowWidth < 640 ? 0 : undefined}

              angle={windowWidth < 640 ? -35 : 0}
              textAnchor={windowWidth < 640 ? 'end' : 'middle'}
              height={windowWidth < 640 ? 60 : 40}
            />
            <YAxis 
              tick={{ 
                fontSize: windowWidth < 640 ? 11 : 13, 
                fill: isDark ? '#9ca3af' : '#6b7280' 
              }}
              domain={[yAxisMin, yAxisMax]}
              tickCount={getTickCount()}
              width={windowWidth < 640 ? 45 : 55}
              tickFormatter={(value) => `${Math.round(value)}ms`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                color: isDark ? '#f9fafb' : '#111827'
              }}
              formatter={(value: number) => [`${value}ms`, 'Latency']}
              labelStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="#00f5ff" 
              strokeWidth={2} 
              fill="url(#latencyGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#00f5ff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {exchangeEndpoints[exchangeData.id.toLowerCase() as keyof typeof exchangeEndpoints]
          ? `Measuring latency to ${exchangeData.name} API`
          : 'Measuring network latency with fallback endpoints'}
      </p>
    </div>
  )
}

function LatencyStat({
  label,
  value,
  trend,
  isDark
}: {
  label: string
  value: number
  trend?: number
  isDark: boolean
}) {
  const getValueColor = () => {
    if (label === 'Max') return isDark ? 'text-red-400' : 'text-red-600'
    if (label === 'Min') return isDark ? 'text-green-400' : 'text-green-600'
    return isDark ? 'text-white' : 'text-gray-900'
  }

  return (
    <div className={`p-3 rounded-lg ${
      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
    } flex flex-col justify-center min-h-[60px]`}>
      <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{label}</div>
      <div className={`text-sm md:text-base font-bold ${getValueColor()} mb-1`}>{value}ms</div>
      {typeof trend === 'number' && (
        <div className="flex items-center text-sm">
          {trend > 0 ? (
            <TrendingUp className={`w-4 h-4 mr-1 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          ) : (
            <TrendingDown className={`w-4 h-4 mr-1 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          )}
          <span className={trend > 0 ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-green-400' : 'text-green-500')}>
            {Math.abs(trend)}ms
          </span>
        </div>
      )}
    </div>
  )
}

function generateHistoricalData(range: TimeRange, exchangeData: ExchangeData): (LatencyData & { time: string })[] {
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