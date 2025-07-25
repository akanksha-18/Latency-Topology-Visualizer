'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, Server, Cloud, Zap } from 'lucide-react'
import type { FilterState, ExchangeData } from '../types/index'

interface ControlPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  exchangeData: ExchangeData[]
  selectedExchange: ExchangeData | null
  onExchangeSelect: (exchange: ExchangeData | null) => void
}

export function ControlPanel({
  filters,
  onFiltersChange,
  exchangeData,
  selectedExchange,
  onExchangeSelect,
}: ControlPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastClickedId, setLastClickedId] = useState<string | null>(null)

  const statsRef = useRef<HTMLDivElement | null>(null)

  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Monitor theme changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDark(theme === 'dark')
    }

    // Initial check
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [])

  
  const filteredExchanges = exchangeData.filter(exchange =>
    (filters.cloudProviders.length === 0 || filters.cloudProviders.includes(exchange.cloudProvider)) &&
    (
      exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleCloudProviderToggle = (provider: 'aws' | 'gcp' | 'azure') => {
    const newProviders = filters.cloudProviders.includes(provider)
      ? filters.cloudProviders.filter(p => p !== provider)
      : [...filters.cloudProviders, provider]

    onFiltersChange({ ...filters, cloudProviders: newProviders })
  }

  const handleExchangeToggle = (exchangeName: string) => {
    const newExchanges = filters.exchanges.includes(exchangeName)
      ? filters.exchanges.filter(e => e !== exchangeName)
      : [...filters.exchanges, exchangeName]

    onFiltersChange({ ...filters, exchanges: newExchanges })
  }

  const handleExchangeClick = (exchange: ExchangeData) => {
    const now = Date.now()
    const timeDiff = now - lastClickTime
    const DEBOUNCE_TIME = 300
    
    if (lastClickedId === exchange.id && timeDiff < DEBOUNCE_TIME) {
      return
    }
    
    setLastClickTime(now)
    setLastClickedId(exchange.id)
    
    onExchangeSelect(exchange)
    
    if (statsRef.current && !isMobile) {
      statsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isMobile = windowWidth < 640

  return (
    <div className={`p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Header Section - Fixed for Mobile Visibility */}
      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-base sm:text-lg lg:text-xl font-extrabold tracking-tight truncate ${
          isDark 
            ? 'text-white' 
            : 'text-gray-900' 
        }`}>
          Exchange Monitor
        </h2>
        <div className="flex items-center gap-2">
          {selectedExchange && (
            <button
              onClick={() => onExchangeSelect(null)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${
                isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
                  : 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
              }`}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 ${
              showAdvancedFilters
                ? isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-400'
                : isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
            aria-label="Toggle advanced filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          type="text"
          placeholder={isMobile ? "Search exchanges..." : "Search exchanges or locations..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 sm:py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
            isDark 
              ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>

      
      {showAdvancedFilters && (
        <div className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 flex items-center ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            <Cloud className="w-4 h-4 mr-2" />
            Cloud Providers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['aws', 'gcp', 'azure'] as const).map(provider => (
              <label key={provider} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.cloudProviders.includes(provider)}
                  onChange={() => handleCloudProviderToggle(provider)}
                  className={`mr-3 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-500' 
                      : 'bg-white border-gray-400'
                  }`}
                />
                <span className={`text-sm font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}>
                  {provider.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      
      <div>
        <h3 className={`text-sm font-semibold mb-3 flex items-center ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          <Server className="w-4 h-4 mr-2" />
          Exchanges ({filteredExchanges.length})
        </h3>
        <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto scrollbar-thin">
          {filteredExchanges.map(exchange => (
            <div
              key={exchange.id}
              onClick={() => handleExchangeClick(exchange)}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedExchange?.id === exchange.id
                  ? isDark 
                    ? 'border-blue-400 bg-blue-900/30 shadow-lg ring-1 ring-blue-400/30'
                    : 'border-blue-500 bg-blue-50 shadow-lg ring-1 ring-blue-500/30'
                  : isDark 
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className={`font-medium truncate text-sm sm:text-base ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {exchange.name}
                  </h4>
                  <p className={`text-xs sm:text-sm truncate mt-0.5 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {isMobile 
                      ? `${exchange.location.city}` 
                      : `${exchange.location.city}, ${exchange.location.country}`
                    }
                  </p>
                </div>
                <div className="flex-shrink-0 text-right ml-3">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${
                    exchange.cloudProvider === 'aws' 
                      ? isDark 
                        ? 'bg-orange-900/50 text-orange-300 border border-orange-800' 
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                      : exchange.cloudProvider === 'gcp' 
                        ? isDark 
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-800' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                        : isDark 
                          ? 'bg-purple-900/50 text-purple-300 border border-purple-800' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {exchange.cloudProvider.toUpperCase()}
                  </div>
                  <div className={`flex items-center justify-end text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <Zap className="w-3 h-3 mr-1" />
                    <span className={`font-semibold ${
                      exchange.latency < 50 
                        ? isDark ? 'text-green-400' : 'text-green-600'
                        : exchange.latency < 150 
                          ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                          : isDark ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {exchange.latency}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredExchanges.length === 0 && (
            <div className={`text-center py-8 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No exchanges found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div ref={statsRef} className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-gray-700' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
        }`}>
          <div className={`text-xs sm:text-sm font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Active Exchanges</div>
          <div className={`text-lg sm:text-2xl font-bold mt-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{filteredExchanges.length}</div>
        </div>
        <div className={`p-3 sm:p-4 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-gray-700' 
            : 'bg-gradient-to-r from-green-50 to-blue-50 border-gray-200'
        }`}>
          <div className={`text-xs sm:text-sm font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>Avg Latency</div>
          <div className={`text-lg sm:text-2xl font-bold mt-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {filteredExchanges.length > 0
              ? `${Math.round(filteredExchanges.reduce((sum, ex) => sum + ex.latency, 0) / filteredExchanges.length)}ms`
              : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}