'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Sun, Moon, Activity, Gauge, ChevronDown, ChevronUp } from 'lucide-react'

interface StatusPanelProps {
  isUpdating: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  className?: string
  compact?: boolean
}

export function StatusPanel({ 
  isUpdating, 
  theme, 
  onToggleTheme, 
  className = '',
  compact = false 
}: StatusPanelProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [systemHealth, setSystemHealth] = useState(98)
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [windowWidth, setWindowWidth] = useState(0)
  const [isDark, setIsDark] = useState(false)

  // Monitor theme changes
  useEffect(() => {
    const checkTheme = () => {
      const themeAttr = document.documentElement.getAttribute('data-theme')
      setIsDark(themeAttr === 'dark')
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

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      setConnectionStatus(Math.random() > 0.95 ? 'disconnected' : 'connected')
      setSystemHealth(95 + Math.random() * 5)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Determine layout based on screen size
  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024
  const isSmallScreen = windowWidth < 768
  const shouldUseCompactLayout = isMobile || compact

  return (
    <div className={`
      backdrop-blur-md rounded-lg border transition-all duration-300 ease-in-out
      ${isDark 
        ? 'bg-gray-900/90 border-gray-700' 
        : 'bg-white/90 border-gray-200'
      }
      ${shouldUseCompactLayout ? 'p-3' : 'p-4'}
      ${isMobile ? 'mx-2 w-auto' : 'min-w-[200px]'}
      ${className}
    `}>
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          } ${shouldUseCompactLayout ? 'text-sm' : 'text-sm'}`}>
            {shouldUseCompactLayout && !isExpanded ? 'Status' : 'System Status'}
          </h3>
          
          {/* Quick status indicators for compact mode */}
          {shouldUseCompactLayout && !isExpanded && (
            <div className="flex items-center space-x-1">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
              <Activity className={`w-3 h-3 ${isUpdating ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleTheme}
            className={`rounded-md transition-colors ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700' 
                : 'bg-gray-100 hover:bg-gray-200'
            } ${shouldUseCompactLayout ? 'p-1' : 'p-1.5'}`}
          >
            {isDark ? (
              <Sun className={`text-yellow-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            ) : (
              <Moon className={`text-blue-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            )}
          </button>
          
          {/* Expand/Collapse button for compact mode */}
          {shouldUseCompactLayout && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-md transition-colors ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isExpanded ? (
                <ChevronUp className={`w-3 h-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
              ) : (
                <ChevronDown className={`w-3 h-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable content */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}
        ${shouldUseCompactLayout ? 'space-y-2 mt-2' : 'space-y-3 mt-3'}
      `}>
        
        {/* Connection Status */}
        <div className={`flex items-center justify-between ${
          isMobile ? 'flex-col space-y-1' : ''
        }`}>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <Wifi className={`text-green-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            ) : (
              <WifiOff className={`text-red-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            )}
            <span className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } ${shouldUseCompactLayout ? 'text-xs' : 'text-sm'}`}>
              Connection
            </span>
          </div>
          <span className={`font-medium ${
            connectionStatus === 'connected' 
              ? isDark ? 'text-green-400' : 'text-green-600'
              : isDark ? 'text-red-400' : 'text-red-600'
          } ${shouldUseCompactLayout ? 'text-xs' : 'text-sm'}`}>
            {connectionStatus === 'connected' ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Update Status */}
        <div className={`flex items-center justify-between ${
          isMobile ? 'flex-col space-y-1' : ''
        }`}>
          <div className="flex items-center space-x-2">
            <Activity className={`${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'} ${
              isUpdating ? 'text-blue-500 animate-pulse' : 'text-gray-400'
            }`} />
            <span className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } ${shouldUseCompactLayout ? 'text-xs' : 'text-sm'}`}>
              Updates
            </span>
          </div>
          <span className={`${
            isUpdating 
              ? isDark ? 'text-blue-400' : 'text-blue-600'
              : isDark ? 'text-gray-400' : 'text-gray-500'
          } ${shouldUseCompactLayout ? 'text-xs' : 'text-sm'}`}>
            {isUpdating ? 'Live' : 'Paused'}
          </span>
        </div>

        {/* System Health */}
        <div className={`flex items-center justify-between ${
          isMobile ? 'flex-col space-y-1' : ''
        }`}>
          <div className="flex items-center space-x-2">
            <Gauge className={`text-purple-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } ${shouldUseCompactLayout ? 'text-xs' : 'text-sm'}`}>
              Health
            </span>
          </div>
          <span className={`font-medium ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          } ${shouldUseCompactLayout ? 'text-xs' : 'text-sm'}`}>
            {Math.round(systemHealth)}%
          </span>
        </div>

        {/* Last Update */}
        <div className={`border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } ${shouldUseCompactLayout ? 'pt-2' : 'pt-2'}`}>
          <div className={`${
            isDark ? 'text-gray-400' : 'text-gray-500'
          } ${shouldUseCompactLayout ? 'text-xs' : 'text-xs'}`}>
            Last update: {lastUpdate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              ...(shouldUseCompactLayout ? {} : { second: '2-digit' })
            })}
          </div>
          <div className={shouldUseCompactLayout ? 'mt-1' : 'mt-1'}>
            <div className={`w-full rounded-full h-1 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-1 rounded-full transition-all duration-1000 ${
                  isDark ? 'bg-blue-400' : 'bg-blue-500'
                }`}
                style={{ width: `${systemHealth}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className={`${
          isMobile || isTablet 
            ? 'flex flex-wrap justify-center gap-3' 
            : 'grid grid-cols-3 gap-2'
        } ${shouldUseCompactLayout ? 'text-xs' : 'text-xs'}`}>
          <div className="text-center min-w-0">
            <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>CPU</div>
            <div className={`font-medium ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>23%</div>
          </div>
          <div className="text-center min-w-0">
            <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>RAM</div>
            <div className={`font-medium ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>67%</div>
          </div>
          <div className="text-center min-w-0">
            <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>FPS</div>
            <div className={`font-medium ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {shouldUseCompactLayout ? '60' : '60'}
            </div>
          </div>
        </div>

        {/* Mobile-specific additional info */}
        {isMobile && (
          <div className={`flex justify-between items-center pt-2 border-t text-xs ${
            isDark 
              ? 'border-gray-700 text-gray-400' 
              : 'border-gray-200 text-gray-500'
          }`}>
            <span>Tap to refresh</span>
            <span>{Math.round(systemHealth)}% operational</span>
          </div>
        )}
      </div>

      {/* Always visible minimal status bar for collapsed state */}
      {shouldUseCompactLayout && !isExpanded && (
        <div className={`mt-2 pt-2 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center text-xs">
            <span className={
              connectionStatus === 'connected' 
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }>
              {connectionStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
            <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>
              {Math.round(systemHealth)}%
            </span>
            <span className={isUpdating 
              ? isDark ? 'text-blue-400' : 'text-blue-600'
              : isDark ? 'text-gray-500' : 'text-gray-500'
            }>
              {isUpdating ? 'Live' : 'Paused'}
            </span>
          </div>
          <div className="mt-1">
            <div className={`w-full rounded-full h-0.5 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-0.5 rounded-full transition-all duration-1000 ${
                  isDark ? 'bg-blue-400' : 'bg-blue-500'
                }`}
                style={{ width: `${systemHealth}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}