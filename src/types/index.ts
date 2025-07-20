export interface ExchangeData {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    city: string
    country: string
  }
  cloudProvider: 'aws' | 'gcp' | 'azure'
  region: string
  latency: number
}

export interface LatencyData {
  id: string
  sourceId: string
  targetId: string
  latency: number
  timestamp: number
  status: 'active' | 'inactive' | 'error'
}

export interface FilterState {
  exchanges: string[]
  cloudProviders: ('aws' | 'gcp' | 'azure')[]
  latencyRange: [number, number]
  showRealTime: boolean
  showHistorical: boolean
  showRegions: boolean
}

export interface CloudRegion {
  id: string
  provider: 'aws' | 'gcp' | 'azure'
  name: string
  location: {
    lat: number
    lng: number
    city: string
    country: string
  }
  exchanges: string[]
}