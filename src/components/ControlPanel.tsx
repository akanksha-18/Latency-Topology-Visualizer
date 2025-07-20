// 'use client'

// import { useState } from 'react'
// import { Search, Filter, Eye, EyeOff, Server, Cloud, Zap } from 'lucide-react'
// import type { FilterState, ExchangeData } from '../types/index'

// interface ControlPanelProps {
//   filters: FilterState
//   onFiltersChange: (filters: FilterState) => void
//   exchangeData: ExchangeData[]
//   selectedExchange: ExchangeData | null
//   onExchangeSelect: (exchange: ExchangeData | null) => void
// }

// export function ControlPanel({
//   filters,
//   onFiltersChange,
//   exchangeData,
//   selectedExchange,
//   onExchangeSelect,
// }: ControlPanelProps) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

//   const filteredExchanges = exchangeData.filter(exchange =>
//     exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     exchange.location.city.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const handleCloudProviderToggle = (provider: string) => {
//     const newProviders = filters.cloudProviders.includes(provider)
//       ? filters.cloudProviders.filter(p => p !== provider)
//       : [...filters.cloudProviders, provider]
    
//     onFiltersChange({ ...filters, cloudProviders: newProviders })
//   }

//   const handleExchangeToggle = (exchangeName: string) => {
//     const newExchanges = filters.exchanges.includes(exchangeName)
//       ? filters.exchanges.filter(e => e !== exchangeName)
//       : [...filters.exchanges, exchangeName]
    
//     onFiltersChange({ ...filters, exchanges: newExchanges })
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//           Exchange Monitor
//         </h2>
//         <button
//           onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//           className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//         >
//           <Filter className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Search */}
//       <div className="relative">
//         <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search exchanges or locations..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyber-blue focus:border-transparent"
//         />
//       </div>

//       {/* Advanced Filters */}
//       <div>
//   <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
//     <Cloud className="w-4 h-4 mr-1" />
//     Cloud Providers
//   </h3>
//   <div className="space-y-2">
//     {['aws', 'gcp', 'azure'].map(provider => (
//       <label key={provider} className="flex items-center">
//         <input
//           type="checkbox"
//           checked={filters.cloudProviders.includes(provider)}
//           onChange={() => handleCloudProviderToggle(provider)}
//           className="mr-2 rounded text-cyber-blue focus:ring-cyber-blue"
//         />
//         <span className="text-sm text-gray-600 dark:text-gray-400">{provider.toUpperCase()}</span>
//       </label>
//     ))}
//   </div>
// </div>


//       {/* Exchange List */}
//       <div>
//         <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
//           <Server className="w-4 h-4 mr-1" />
//           Exchanges ({filteredExchanges.length})
//         </h3>
//         <div className="space-y-2 max-h-64 overflow-y-auto">
//           {filteredExchanges.map(exchange => (
//             <div
//               key={exchange.id}
//               onClick={() => onExchangeSelect(selectedExchange?.id === exchange.id ? null : exchange)}
//               className={`p-3 rounded-lg border cursor-pointer transition-all ${
//                 selectedExchange?.id === exchange.id
//                   ? 'border-cyber-blue bg-cyber-blue/10 cyber-glow'
//                   : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
//               }`}
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h4 className="font-medium text-gray-900 dark:text-white">
//                     {exchange.name}
//                   </h4>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {exchange.location.city}, {exchange.location.country}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
//                     exchange.cloudProvider === 'aws' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
//                     exchange.cloudProvider === 'gcp' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
//                     'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
//                   }`}>
//                     {exchange.cloudProvider.toUpperCase()}
//                   </div>
//                   <div className="flex items-center mt-1 text-xs text-gray-500">
//                     <Zap className="w-3 h-3 mr-1" />
//                     <span className={`font-medium ${
//                       exchange.latency < 50 ? 'text-green-600' :
//                       exchange.latency < 150 ? 'text-yellow-600' :
//                       'text-red-600'
//                     }`}>
//                       {exchange.latency}ms
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="p-3 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-lg">
//           <div className="text-sm text-gray-600 dark:text-gray-400">Active Exchanges</div>
//           <div className="text-2xl font-bold text-gray-900 dark:text-white">{exchangeData.length}</div>
//         </div>
//         <div className="p-3 bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 rounded-lg">
//           <div className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</div>
//          <div className="text-2xl font-bold text-gray-900 dark:text-white">
//   {exchangeData.length > 0
//     ? `${Math.round(exchangeData.reduce((sum, ex) => sum + ex.latency, 0) / exchangeData.length)}ms`
//     : 'Loading...'}
// </div>

//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Eye, EyeOff, Server, Cloud, Zap } from 'lucide-react'
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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const filteredExchanges = exchangeData.filter(exchange =>
    exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exchange.location.city.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="p-6 space-y-6">
      {!isClient ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Exchange Monitor
        </h2>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search exchanges or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyber-blue focus:border-transparent"
        />
      </div>

      {/* Advanced Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <Cloud className="w-4 h-4 mr-1" />
          Cloud Providers
        </h3>
        <div className="space-y-2">
          {(['aws', 'gcp', 'azure'] as const).map(provider => (
            <label key={provider} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.cloudProviders.includes(provider)}
                onChange={() => handleCloudProviderToggle(provider)}
                className="mr-2 rounded text-cyber-blue focus:ring-cyber-blue"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{provider.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Exchange List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <Server className="w-4 h-4 mr-1" />
          Exchanges ({filteredExchanges.length})
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredExchanges.map(exchange => (
            <div
              key={exchange.id}
              onClick={() => onExchangeSelect(selectedExchange?.id === exchange.id ? null : exchange)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedExchange?.id === exchange.id
                  ? 'border-cyber-blue bg-cyber-blue/10 cyber-glow'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {exchange.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {exchange.location.city}, {exchange.location.country}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    exchange.cloudProvider === 'aws' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    exchange.cloudProvider === 'gcp' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {exchange.cloudProvider.toUpperCase()}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Zap className="w-3 h-3 mr-1" />
                    <span className={`font-medium ${
                      exchange.latency < 50 ? 'text-green-600' :
                      exchange.latency < 150 ? 'text-yellow-600' :
                      'text-red-600'
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
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Exchanges</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{exchangeData.length}</div>
        </div>
        <div className="p-3 bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</div>
         <div className="text-2xl font-bold text-gray-900 dark:text-white">
  {exchangeData.length > 0
    ? `${Math.round(exchangeData.reduce((sum, ex) => sum + ex.latency, 0) / exchangeData.length)}ms`
    : 'Loading...'}
</div>

        </div>
      </div>
        </>
      )}
    </div>
  )
}