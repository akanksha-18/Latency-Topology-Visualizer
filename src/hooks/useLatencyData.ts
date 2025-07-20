'use client'

import { useState, useEffect } from 'react'
import type { LatencyData, ExchangeData } from '../types/index'

export function useLatencyData() {
  const [latencyData, setLatencyData] = useState<LatencyData[]>([])
  const [exchangeData, setExchangeData] = useState<ExchangeData[]>([])
  const [isUpdating, setIsUpdating] = useState(true)

  // Mock exchange data
  const mockExchanges: ExchangeData[] = [
    {
      id: 'binance-us-east',
      name: 'Binance',
      location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
      cloudProvider: 'aws',
      region: 'us-east-1',
      latency: 45,
    },
    {
      id: 'okx-tokyo',
      name: 'OKX',
      location: { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
      cloudProvider: 'gcp',
      region: 'asia-northeast1',
      latency: 23,
    },
    {
      id: 'deribit-eu-west',
      name: 'Deribit',
      location: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
      cloudProvider: 'azure',
      region: 'uk-south',
      latency: 67,
    },
    {
      id: 'bybit-singapore',
      name: 'Bybit',
      location: { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
      cloudProvider: 'aws',
      region: 'ap-southeast-1',
      latency: 34,
    },
    {
      id: 'huobi-hongkong',
      name: 'Huobi',
      location: { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'Hong Kong' },
      cloudProvider: 'gcp',
      region: 'asia-east2',
      latency: 56,
    },
    {
      id: 'kraken-europe',
      name: 'Kraken',
      location: { lat: 52.3676, lng: 4.9041, city: 'Amsterdam', country: 'Netherlands' },
      cloudProvider: 'azure',
      region: 'west-europe',
      latency: 78,
    },
    {
      id: 'coinbase-us-west',
      name: 'Coinbase',
      location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
      cloudProvider: 'gcp',
      region: 'us-west1',
      latency: 29,
    },
    {
      id: 'ftx-miami',
      name: 'FTX',
      location: { lat: 25.7617, lng: -80.1918, city: 'Miami', country: 'USA' },
      cloudProvider: 'aws',
      region: 'us-east-1',
      latency: 41,
    }
  ]

  // Generate mock latency data
  const generateLatencyData = (): LatencyData[] => {
    const connections: LatencyData[] = []
    
    for (let i = 0; i < mockExchanges.length; i++) {
      for (let j = i + 1; j < mockExchanges.length; j++) {
        const source = mockExchanges[i]
        const target = mockExchanges[j]
        
        // Calculate approximate latency based on distance and cloud provider
        const distance = calculateDistance(source.location, target.location)
        const baseLatency = Math.min(300, distance / 100 + 20)
        const providerPenalty = source.cloudProvider !== target.cloudProvider ? 15 : 0
        const variation = (Math.random() - 0.5) * 20
        
        connections.push({
          id: `${source.id}-${target.id}`,
          sourceId: source.id,
          targetId: target.id,
          latency: Math.max(10, Math.round(baseLatency + providerPenalty + variation)),
          timestamp: Date.now(),
          status: 'active'
        })
      }
    }
    
    return connections
  }

  const calculateDistance = (
    pos1: { lat: number; lng: number },
    pos2: { lat: number; lng: number }
  ): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Initialize data
  useEffect(() => {
    setExchangeData(mockExchanges)
    setLatencyData(generateLatencyData())
  }, [])

  // Update latency data periodically
  useEffect(() => {
    if (!isUpdating) return

    const interval = setInterval(() => {
      setLatencyData(generateLatencyData())
      
      // Update exchange latencies
      setExchangeData(prev => prev.map(exchange => ({
        ...exchange,
        latency: Math.max(10, exchange.latency + (Math.random() - 0.5) * 10)
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [isUpdating])

  return {
    latencyData,
    exchangeData,
    isUpdating,
    setIsUpdating
  }
}
