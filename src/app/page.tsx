'use client'

import { useState, useEffect } from 'react'
import Globe3D from '../components/Global3D'
import { ControlPanel } from '../components/ControlPanel'
import { LatencyChart } from '../components/LatencyChart'
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
   
      <div className="lg:hidden flex flex-col h-screen">
        <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between z-20 relative">
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open control panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <StatusPanel isUpdating={isUpdating} theme={theme} onToggleTheme={toggleTheme} />
        </div>

        <div className="flex-1 relative">
          <Globe3D
            exchangeData={exchangeData}
            latencyData={latencyData}
            filters={filters}
            selectedExchange={selectedExchange}
            onExchangeSelect={setSelectedExchange}
          />
        </div>

        {isSidePanelOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={handleOverlayClick} />
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-dark-surface shadow-xl z-40 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Controls</h2>
                <button
                  onClick={() => setIsSidePanelOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <LatencyChart
                    exchangeData={selectedExchange}
                   
                    timeRange="24h"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {selectedExchange && !isSidePanelOpen && (
          <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 p-3 max-h-64 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium truncate">{selectedExchange.name}</h3>
              <button
                onClick={() => setSelectedExchange(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
                aria-label="Close chart"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-32">
              <LatencyChart
                exchangeData={selectedExchange}
                
                timeRange="24h"
              />
            </div>
          </div>
        )}
      </div>

      
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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

