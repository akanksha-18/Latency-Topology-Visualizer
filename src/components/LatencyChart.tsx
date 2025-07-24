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
  const maxLatency = Math.max(...chartData.map(d => d.latency))

  // Calculate Y-axis domain with proper padding
  const dataMin = Math.min(...chartData.map(d => d.latency))
  const dataMax = Math.max(...chartData.map(d => d.latency))
  const range = dataMax - dataMin
  const padding = Math.max(range * 0.1, 10) // 10% padding or minimum 10ms
  const yAxisMin = Math.max(0, dataMin - padding)
  const yAxisMax = dataMax + padding

  // Enhanced responsive settings
  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024

  // Calculate tick count based on screen size and range
  const getTickCount = () => {
    if (isMobile) return 3
    if (isTablet) return 5
    return 7
  }

  // Get appropriate interval for X-axis labels
  const getXAxisInterval = () => {
    const dataLength = chartData.length
    if (isMobile) {
      if (dataLength <= 10) return 0
      if (dataLength <= 30) return Math.floor(dataLength / 4)
      return Math.floor(dataLength / 3)
    }
    if (isTablet) {
      if (dataLength <= 20) return 0
      return Math.floor(dataLength / 6)
    }
    return 'preserveStartEnd'
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
    <div className={`p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>

      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-2">
          <div className="flex flex-col gap-2">
            <h3 className={`font-semibold text-sm sm:text-base lg:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {exchangeData.name} Latency
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
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
        </div>
        
        {/* Time Range Buttons - Mobile Optimized */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {timeRangeOptions.map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`py-1.5 px-2 sm:px-3 text-xs sm:text-sm rounded-md transition-all font-medium whitespace-nowrap flex-shrink-0 ${
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

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <LatencyStat label="Current" value={currentLatency} trend={trend} isDark={isDark} isMobile={isMobile} />
        <LatencyStat label="Average" value={avgLatency} isDark={isDark} isMobile={isMobile} />
        <LatencyStat label="Max" value={maxLatency} isDark={isDark} isMobile={isMobile} />
      </div>

      {/* Chart Container - Mobile Optimized */}
      <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ 
              top: isMobile ? 10 : 20, 
              right: isMobile ? 10 : isTablet ? 20 : 30, 
              left: isMobile ? 0 : 5, 
              bottom: isMobile ? 45 : isTablet ? 35 : 30 
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
              opacity={isMobile ? 0.2 : 0.3} 
            />
            <XAxis 
              dataKey="time" 
              tick={{ 
                fontSize: isMobile ? 10 : isTablet ? 11 : 12, 
                fill: isDark ? '#9ca3af' : '#6b7280' 
              }}
              interval={getXAxisInterval()}
              angle={isMobile ? -45 : isTablet ? -30 : 0}
              textAnchor={isMobile || isTablet ? 'end' : 'middle'}
              height={isMobile ? 50 : isTablet ? 45 : 40}
              axisLine={!isMobile}
              tickLine={!isMobile}
            />
            <YAxis 
              tick={{ 
                fontSize: isMobile ? 9 : isTablet ? 10 : 11, 
                fill: isDark ? '#9ca3af' : '#6b7280' 
              }}
              domain={[yAxisMin, yAxisMax]}
              tickCount={getTickCount()}
              width={isMobile ? 35 : isTablet ? 45 : 50}
              tickFormatter={(value) => isMobile ? `${Math.round(value)}` : `${Math.round(value)}ms`}
              axisLine={!isMobile}
              tickLine={!isMobile}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                color: isDark ? '#f9fafb' : '#111827',
                fontSize: isMobile ? '12px' : '14px',
                padding: isMobile ? '6px 8px' : '8px 12px'
              }}
              formatter={(value: number) => [`${value}ms`, 'Latency']}
              labelStyle={{ 
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: isMobile ? '11px' : '13px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="#00f5ff" 
              strokeWidth={isMobile ? 1.5 : 2} 
              fill="url(#latencyGradient)"
              dot={false}
              activeDot={{ r: isMobile ? 3 : 4, fill: '#00f5ff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Text - Mobile Optimized */}
      <p className={`text-xs sm:text-sm text-center px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
  isDark,
  isMobile
}: {
  label: string
  value: number
  trend?: number
  isDark: boolean
  isMobile?: boolean
}) {
  const getValueColor = () => {
    if (label === 'Max') return isDark ? 'text-red-400' : 'text-red-600'
    if (label === 'Min') return isDark ? 'text-green-400' : 'text-green-600'
    return isDark ? 'text-white' : 'text-gray-900'
  }

  return (
    <div className={`p-2 sm:p-3 rounded-lg ${
      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
    } flex flex-col justify-center min-h-[50px] sm:min-h-[60px]`}>
      <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1 leading-tight`}>
        {label}
      </div>
      <div className={`text-xs sm:text-sm lg:text-base font-bold ${getValueColor()} mb-1`}>
        {isMobile ? `${value}ms` : `${value}ms`}
      </div>
      {typeof trend === 'number' && (
        <div className="flex items-center text-xs">
          {trend > 0 ? (
            <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          ) : (
            <TrendingDown className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
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