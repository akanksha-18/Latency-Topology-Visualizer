import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-cyber-blue/30 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-cyber-purple/50 rounded-full animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 border-4 border-cyber-green/70 rounded-full animate-spin animation-delay-300"></div>
          <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-white animate-spin" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Latency Topology Visualizer
        </h1>
        <p className="text-gray-400 animate-pulse">
          Initializing real-time exchange monitoring...
        </p>
      </div>
    </div>
  )
}