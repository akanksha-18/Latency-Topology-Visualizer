'use client'

import { useState, useEffect } from 'react'
import Globe3D from '../components/Global3D'
import { ControlPanel } from '../components/ControlPanel'
import  {LatencyChart}  from '../components/LatencyChart'
import { StatusPanel } from '../components/StatusPanel'
import { LoadingScreen } from '../components/LoadingScreen'
import { useLatencyData } from '../hooks/useLatencyData'
import { useTheme } from '../hooks/useTheme'
import type { FilterState, ExchangeData } from '../types/index'

export default function HomePage()  {
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState<ExchangeData | null>(null)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    exchanges: [],
    cloudProviders: ['aws', 'gcp', 'azure'],
    latencyRange: [0, 1000],
    showRealTime: true,
    showHistorical: false,
    showRegions: true,
  })

  const { theme, toggleTheme } = useTheme()
  const { latencyData, exchangeData, isUpdating } = useLatencyData()

  
  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleOverlayClick = () => {
    if (isSidePanelOpen) {
      setIsSidePanelOpen(false)
    }
  }

  if (!hasMounted) return null 
  if (isLoading) return <LoadingScreen />

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-dark-bg' : 'bg-gray-50'} transition-colors duration-300`}>
   
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        
        {/* Top Navigation Bar - Fixed */}
        <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-30 relative shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
              aria-label="Open control panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              Exchange Monitor
            </div>
          </div>
          
          {/* Compact Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Horizontal Status Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {isUpdating ? 'Live' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">{exchangeData.length} Exchanges</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-300">98% Health</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date().toLocaleTimeString(undefined, { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
          
          {/* Performance Indicators */}
          <div className="flex items-center justify-center space-x-6 mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">CPU: 23%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">RAM: 67%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">Latency: {
                exchangeData.length > 0 
                  ? `${Math.round(exchangeData.reduce((sum, ex) => sum + ex.latency, 0) / exchangeData.length)}ms`
                  : 'N/A'
              }</span>
            </div>
          </div>
        </div>

        {/* Globe Container - Takes remaining space */}
        <div className="flex-1 relative overflow-hidden">
          <Globe3D
            exchangeData={exchangeData}
            latencyData={latencyData}
            filters={filters}
            selectedExchange={selectedExchange}
            onExchangeSelect={setSelectedExchange}
          />
          
          {/* Selected Exchange Floating Card */}
          {selectedExchange && !isSidePanelOpen && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {selectedExchange.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedExchange.location.city}, {selectedExchange.location.country}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      selectedExchange.cloudProvider === 'aws' 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200'
                        : selectedExchange.cloudProvider === 'gcp' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                    }`}>
                      {selectedExchange.cloudProvider.toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium ${
                      selectedExchange.latency < 50 
                        ? 'text-green-600 dark:text-green-400'
                        : selectedExchange.latency < 150 
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}>
                      {selectedExchange.latency}ms
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExchange(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {isSidePanelOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleOverlayClick} />
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-dark-surface shadow-xl z-50 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h2 className="text-lg font-semibold">Control Panel</h2>
                <button
                  onClick={() => setIsSidePanelOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close control panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ControlPanel
                filters={filters}
                onFiltersChange={setFilters}
                exchangeData={exchangeData}
                selectedExchange={selectedExchange}
                onExchangeSelect={setSelectedExchange}
              />
              {selectedExchange && (
                <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                  <LatencyChart
                    exchangeData={selectedExchange}
                    timeRange="24h"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      
      {/* Desktop Layout - Unchanged */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        <div className="flex-1 relative">
          <Globe3D
            exchangeData={exchangeData}
            latencyData={latencyData}
            filters={filters}
            selectedExchange={selectedExchange}
            onExchangeSelect={setSelectedExchange}
          />
          <div className="absolute top-4 right-4 z-10">
            <StatusPanel isUpdating={isUpdating} theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </div>
        <div className="w-80 xl:w-96 bg-white dark:bg-dark-surface shadow-xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ControlPanel
            filters={filters}
            onFiltersChange={setFilters}
            exchangeData={exchangeData}
            selectedExchange={selectedExchange}
            onExchangeSelect={setSelectedExchange}
          />
          {selectedExchange && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <LatencyChart
                exchangeData={selectedExchange}
                timeRange="24h"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}