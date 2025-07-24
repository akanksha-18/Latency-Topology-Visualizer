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

  const statsRef = useRef<HTMLDivElement | null>(null)

  // Monitor theme changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setIsDark(theme === 'dark')
    }

    // Initial check
    checkTheme()

    // Create observer for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [])

  // Filter exchange list based on cloud provider + search
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

  return (
    <div className={`p-6 space-y-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <div className="flex items-center justify-between gap-3">
  <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight truncate bg-gradient-to-r bg-clip-text text-transparent ${
    isDark 
      ? 'from-purple-400 via-pink-300 to-blue-300' 
      : 'from-purple-600 via-pink-600 to-blue-600'
  }`}>
    Exchange Monitor
  </h2>
  <button
    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
    className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 ${
      isDark
        ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border border-gray-600'
        : 'bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-800 border border-gray-200'
    }`}
  >
    <Filter className="w-4 h-4" />
  </button>
</div>
      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-3 w-4 h-4 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`} />
        <input
          type="text"
          placeholder="Search exchanges or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark 
              ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
              : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className={`p-4 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 flex items-center ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Cloud className="w-4 h-4 mr-1" />
            Cloud Providers
          </h3>
          <div className="space-y-2">
            {(['aws', 'gcp', 'azure'] as const).map(provider => (
              <label key={provider} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.cloudProviders.includes(provider)}
                  onChange={() => handleCloudProviderToggle(provider)}
                  className={`mr-2 rounded text-blue-600 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <span className={`text-sm transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}>
                  {provider.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Exchange List */}
      <div>
        <h3 className={`text-sm font-semibold mb-3 flex items-center ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Server className="w-4 h-4 mr-1" />
          Exchanges ({filteredExchanges.length})
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredExchanges.map(exchange => (
            <div
              key={exchange.id}
              onClick={() => {
                const isSame = selectedExchange?.id === exchange.id
                onExchangeSelect(isSame ? null : exchange)
                if (!isSame && statsRef.current) {
                  statsRef.current.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedExchange?.id === exchange.id
                  ? isDark 
                    ? 'border-blue-400 bg-blue-900/20 shadow-lg cyber-glow'
                    : 'border-blue-500 bg-blue-50 shadow-lg cyber-glow'
                  : isDark 
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className={`font-medium truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {exchange.name}
                  </h4>
                  <p className={`text-sm truncate ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {exchange.location.city}, {exchange.location.country}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right ml-2">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    exchange.cloudProvider === 'aws' 
                      ? isDark 
                        ? 'bg-orange-900/50 text-orange-200' 
                        : 'bg-orange-100 text-orange-800'
                      : exchange.cloudProvider === 'gcp' 
                        ? isDark 
                          ? 'bg-blue-900/50 text-blue-200' 
                          : 'bg-blue-100 text-blue-800'
                        : isDark 
                          ? 'bg-purple-900/50 text-purple-200' 
                          : 'bg-purple-100 text-purple-800'
                  }`}>
                    {exchange.cloudProvider.toUpperCase()}
                  </div>
                  <div className={`flex items-center justify-end mt-1 text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Zap className="w-3 h-3 mr-1" />
                    <span className={`font-medium ${
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
        </div>
      </div>

      {/* Quick Stats */}
      <div ref={statsRef} className="grid grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-gray-700' 
            : 'bg-gradient-to-r from-blue-100 to-purple-100 border-gray-200'
        }`}>
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Active Exchanges</div>
          <div className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{filteredExchanges.length}</div>
        </div>
        <div className={`p-3 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-gray-700' 
            : 'bg-gradient-to-r from-green-100 to-blue-100 border-gray-200'
        }`}>
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Avg Latency</div>
          <div className={`text-2xl font-bold ${
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