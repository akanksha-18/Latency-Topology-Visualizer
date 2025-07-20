// 'use client'

// import { useState, useEffect } from 'react'
// import { Wifi, WifiOff, Sun, Moon, Activity, Gauge } from 'lucide-react'

// interface StatusPanelProps {
//   isUpdating: boolean
//   theme: 'light' | 'dark'
//   onToggleTheme: () => void
// }

// export function StatusPanel({ isUpdating, theme, onToggleTheme }: StatusPanelProps) {
//   const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected')
//   const [lastUpdate, setLastUpdate] = useState(new Date())
//   const [systemHealth, setSystemHealth] = useState(98)

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setLastUpdate(new Date())
//       // Simulate occasional connection issues
//       setConnectionStatus(Math.random() > 0.95 ? 'disconnected' : 'connected')
//       // Simulate system health fluctuation
//       setSystemHealth(95 + Math.random() * 5)
//     }, 5000)

//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg p-4 space-y-3 min-w-[200px] border border-gray-200 dark:border-gray-700">
//       <div className="flex items-center justify-between">
//         <h3 className="text-sm font-semibold text-gray-900 dark:text-white">System Status</h3>
//         <button
//           onClick={onToggleTheme}
//           className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//         >
//           {theme === 'dark' ? (
//             <Sun className="w-4 h-4 text-yellow-500" />
//           ) : (
//             <Moon className="w-4 h-4 text-blue-500" />
//           )}
//         </button>
//       </div>

//       {/* Connection Status */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           {connectionStatus === 'connected' ? (
//             <Wifi className="w-4 h-4 text-green-500" />
//           ) : (
//             <WifiOff className="w-4 h-4 text-red-500" />
//           )}
//           <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
//         </div>
//         <span className={`text-sm font-medium ${
//           connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
//         }`}>
//           {connectionStatus === 'connected' ? 'Online' : 'Offline'}
//         </span>
//       </div>

//       {/* Update Status */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <Activity className={`w-4 h-4 ${isUpdating ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
//           <span className="text-sm text-gray-600 dark:text-gray-400">Updates</span>
//         </div>
//         <span className={`text-sm ${isUpdating ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
//           {isUpdating ? 'Live' : 'Paused'}
//         </span>
//       </div>

//       {/* System Health */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <Gauge className="w-4 h-4 text-purple-500" />
//           <span className="text-sm text-gray-600 dark:text-gray-400">Health</span>
//         </div>
//         <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
//           {Math.round(systemHealth)}%
//         </span>
//       </div>

//       {/* Last Update */}
//       <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
//         <div className="text-xs text-gray-500 dark:text-gray-400">
//           Last update: {lastUpdate.toLocaleTimeString()}
//         </div>
//         <div className="mt-1">
//           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
//             <div 
//               className="bg-blue-500 dark:bg-blue-400 h-1 rounded-full transition-all duration-1000"
//               style={{ width: `${systemHealth}%` }}
//             ></div>
//           </div>
//         </div>
//       </div>

//       {/* Performance Indicators */}
//       <div className="grid grid-cols-3 gap-2 text-xs">
//         <div className="text-center">
//           <div className="text-gray-500 dark:text-gray-400">CPU</div>
//           <div className="text-green-600 dark:text-green-400 font-medium">23%</div>
//         </div>
//         <div className="text-center">
//           <div className="text-gray-500 dark:text-gray-400">RAM</div>
//           <div className="text-yellow-600 dark:text-yellow-400 font-medium">67%</div>
//         </div>
//         <div className="text-center">
//           <div className="text-gray-500 dark:text-gray-400">FPS</div>
//           <div className="text-blue-600 dark:text-blue-400 font-medium">60</div>
//         </div>
//       </div>
//     </div>
//   )
// }

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

  // Track window size for responsive behavior
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
      // Simulate occasional connection issues
      setConnectionStatus(Math.random() > 0.95 ? 'disconnected' : 'connected')
      // Simulate system health fluctuation
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
      bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 
      transition-all duration-300 ease-in-out
      ${shouldUseCompactLayout ? 'p-3' : 'p-4'}
      ${isMobile ? 'mx-2 w-auto' : 'min-w-[200px]'}
      ${className}
    `}>
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold text-gray-900 dark:text-white ${
            shouldUseCompactLayout ? 'text-sm' : 'text-sm'
          }`}>
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
            className={`rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              shouldUseCompactLayout ? 'p-1' : 'p-1.5'
            }`}
          >
            {theme === 'dark' ? (
              <Sun className={`text-yellow-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            ) : (
              <Moon className={`text-blue-500 ${shouldUseCompactLayout ? 'w-3 h-3' : 'w-4 h-4'}`} />
            )}
          </button>
          
          {/* Expand/Collapse button for compact mode */}
          {shouldUseCompactLayout && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
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
            <span className={`text-gray-600 dark:text-gray-400 ${
              shouldUseCompactLayout ? 'text-xs' : 'text-sm'
            }`}>
              Connection
            </span>
          </div>
          <span className={`font-medium ${
            connectionStatus === 'connected' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
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
            <span className={`text-gray-600 dark:text-gray-400 ${
              shouldUseCompactLayout ? 'text-xs' : 'text-sm'
            }`}>
              Updates
            </span>
          </div>
          <span className={`${
            isUpdating ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
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
            <span className={`text-gray-600 dark:text-gray-400 ${
              shouldUseCompactLayout ? 'text-xs' : 'text-sm'
            }`}>
              Health
            </span>
          </div>
          <span className={`font-medium text-purple-600 dark:text-purple-400 ${
            shouldUseCompactLayout ? 'text-xs' : 'text-sm'
          }`}>
            {Math.round(systemHealth)}%
          </span>
        </div>

        {/* Last Update */}
        <div className={`border-t border-gray-200 dark:border-gray-700 ${
          shouldUseCompactLayout ? 'pt-2' : 'pt-2'
        }`}>
          <div className={`text-gray-500 dark:text-gray-400 ${
            shouldUseCompactLayout ? 'text-xs' : 'text-xs'
          }`}>
            Last update: {lastUpdate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              ...(shouldUseCompactLayout ? {} : { second: '2-digit' })
            })}
          </div>
          <div className={shouldUseCompactLayout ? 'mt-1' : 'mt-1'}>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-500 dark:bg-blue-400 h-1 rounded-full transition-all duration-1000"
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
            <div className="text-gray-500 dark:text-gray-400 truncate">CPU</div>
            <div className="text-green-600 dark:text-green-400 font-medium">23%</div>
          </div>
          <div className="text-center min-w-0">
            <div className="text-gray-500 dark:text-gray-400 truncate">RAM</div>
            <div className="text-yellow-600 dark:text-yellow-400 font-medium">67%</div>
          </div>
          <div className="text-center min-w-0">
            <div className="text-gray-500 dark:text-gray-400 truncate">FPS</div>
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              {shouldUseCompactLayout ? '60' : '60'}
            </div>
          </div>
        </div>

        {/* Mobile-specific additional info */}
        {isMobile && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <span>Tap to refresh</span>
            <span>{Math.round(systemHealth)}% operational</span>
          </div>
        )}
      </div>

      {/* Always visible minimal status bar for collapsed state */}
      {shouldUseCompactLayout && !isExpanded && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <span className={`${
              connectionStatus === 'connected' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {connectionStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
            <span className="text-purple-600 dark:text-purple-400">
              {Math.round(systemHealth)}%
            </span>
            <span className={isUpdating ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}>
              {isUpdating ? 'Live' : 'Paused'}
            </span>
          </div>
          <div className="mt-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5">
              <div 
                className="bg-blue-500 dark:bg-blue-400 h-0.5 rounded-full transition-all duration-1000"
                style={{ width: `${systemHealth}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}