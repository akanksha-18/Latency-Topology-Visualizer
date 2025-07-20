import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import type { ExchangeData, LatencyData, FilterState } from '../types'

interface Global3DProps {
  exchangeData: ExchangeData[]
  latencyData: LatencyData[]
  filters: FilterState
  selectedExchange: ExchangeData | null
  onExchangeSelect: (exchange: ExchangeData | null) => void
}

export default function Global3D({ 
  exchangeData, 
  latencyData, 
  filters, 
  selectedExchange, 
  onExchangeSelect 
}: Global3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const globeRef = useRef<THREE.Group>()
  const atmosphereRef = useRef<THREE.Mesh>()
  const starsRef = useRef<THREE.Points>()
  const initRef = useRef(false)
  const clockRef = useRef(new THREE.Clock())
  const controlsRef = useRef({
    isMouseDown: false,
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    currentRotationX: 0,
    currentRotationY: 0
  })
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [showLatency, setShowLatency] = useState(true)

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || initRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    )
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    })

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    container.appendChild(renderer.domElement)

    // Create scene elements
    createStarField(scene)
    
    // Create globe group
    const globeGroup = new THREE.Group()
    createEarthLayers(globeGroup)
    createAtmosphere(globeGroup)
    scene.add(globeGroup)

    // Setup lighting
    setupLighting(scene)

    // Position camera
    camera.position.set(15, 10, 15)
    camera.lookAt(0, 0, 0)

    // Store references
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera
    globeRef.current = globeGroup

    initRef.current = true
    setIsInitialized(true)

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer || !container) return
      
      const width = container.clientWidth
      const height = container.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      initRef.current = false
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  function createStarField(scene: THREE.Scene) {
    const starsGeometry = new THREE.BufferGeometry()
    const starCount = 2000
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const radius = 150 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const starColor = new THREE.Color()
      const colorChoice = Math.random()
      if (colorChoice < 0.7) {
        starColor.setHSL(0.6, 0.2, 0.8 + Math.random() * 0.2)
      } else {
        starColor.setHSL(0.1, 0.5, 0.9)
      }
      
      colors[i3] = starColor.r
      colors[i3 + 1] = starColor.g
      colors[i3 + 2] = starColor.b
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const starsMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const stars = new THREE.Points(starsGeometry, starsMaterial)
    starsRef.current = stars
    scene.add(stars)
  }

  function createEarthLayers(globeGroup: THREE.Group) {
    const radius = 5

    // Create gradient texture
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, '#1e3a8a')
    gradient.addColorStop(0.4, '#1e40af')
    gradient.addColorStop(0.7, '#1d4ed8')
    gradient.addColorStop(1, '#0f172a')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    // Add texture noise
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = Math.random() * 3
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`
      ctx.fillRect(x, y, size, size)
    }
    
    const earthTexture = new THREE.CanvasTexture(canvas)
    
    // Main Earth sphere
    const earthGeometry = new THREE.SphereGeometry(radius, 64, 64)
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 100,
      specular: 0x1e40af,
    })
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    earth.castShadow = true
    earth.receiveShadow = true
    globeGroup.add(earth)

    // Wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(radius + 0.02, 32, 32)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    globeGroup.add(wireframe)

    // Grid lines
    createGridLines(globeGroup, radius)
  }

  function createGridLines(globeGroup: THREE.Group, radius: number) {
    const gridGroup = new THREE.Group()
    
    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180)
      const circleRadius = radius * Math.sin(phi)
      const y = radius * Math.cos(phi)
      
      const geometry = new THREE.RingGeometry(
        circleRadius - 0.02, 
        circleRadius + 0.02, 
        64
      )
      const material = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      })
      const circle = new THREE.Mesh(geometry, material)
      circle.rotation.x = Math.PI / 2
      circle.position.y = y
      gridGroup.add(circle)
    }
    
    // Longitude lines
    for (let lng = 0; lng < 360; lng += 45) {
      const points = []
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = lng * (Math.PI / 180)
        
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.05
      })
      const line = new THREE.Line(geometry, material)
      gridGroup.add(line)
    }
    
    globeGroup.add(gridGroup)
  }

  function createAtmosphere(globeGroup: THREE.Group) {
    // Inner atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(5.3, 64, 64)
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    atmosphereRef.current = atmosphere
    globeGroup.add(atmosphere)

    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(6.0, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.02,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    globeGroup.add(glow)
  }

  function setupLighting(scene: THREE.Scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404080, 0.4)
    scene.add(ambientLight)

    // Main directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    sunLight.position.set(15, 10, 5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    scene.add(sunLight)

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x00aaff, 0.5)
    rimLight.position.set(-10, 0, -10)
    scene.add(rimLight)

    // Point lights
    const pointLight1 = new THREE.PointLight(0x00f5ff, 0.4, 50)
    pointLight1.position.set(10, 10, 10)
    scene.add(pointLight1)
  }

  // Add exchange markers - now using props instead of mock data
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current || !isInitialized) return

    // Remove existing markers
    const existingMarkers = globeRef.current.children.filter(child => 
      child.userData.type === 'exchange-marker'
    )
    existingMarkers.forEach(marker => globeRef.current!.remove(marker))

    // Filter exchanges based on filters
    const filteredExchanges = exchangeData.filter(exchange => {
      if (filters.exchanges.length > 0 && !filters.exchanges.includes(exchange.id)) return false
      if (!filters.cloudProviders.includes(exchange.cloudProvider)) return false
      return true
    })

    // Add new markers
    filteredExchanges.forEach(exchange => {
      const marker = createExchangeMarker(exchange)
      marker.userData = { type: 'exchange-marker', exchange }
      globeRef.current!.add(marker)
    })
  }, [isInitialized, exchangeData, filters])

  // Add latency connections - now using props instead of mock data
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current || !showLatency || !isInitialized) return

    // Remove existing connections
    const existingConnections = globeRef.current.children.filter(child =>
      child.userData.type === 'latency-connection'
    )
    existingConnections.forEach(connection => globeRef.current!.remove(connection))

    // Filter latency data based on filters
    const filteredLatencyData = latencyData.filter(data => {
      if (data.latency < filters.latencyRange[0] || data.latency > filters.latencyRange[1]) return false
      
      const sourceExchange = exchangeData.find(e => e.id === data.sourceId)
      const targetExchange = exchangeData.find(e => e.id === data.targetId)
      
      if (!sourceExchange || !targetExchange) return false
      
      if (filters.exchanges.length > 0) {
        if (!filters.exchanges.includes(sourceExchange.id) && !filters.exchanges.includes(targetExchange.id)) {
          return false
        }
      }
      
      if (!filters.cloudProviders.includes(sourceExchange.cloudProvider) || 
          !filters.cloudProviders.includes(targetExchange.cloudProvider)) {
        return false
      }
      
      return true
    })

    // Add new connections
    filteredLatencyData.forEach(data => {
      const sourceExchange = exchangeData.find(e => e.id === data.sourceId)
      const targetExchange = exchangeData.find(e => e.id === data.targetId)
      
      if (sourceExchange && targetExchange) {
        const connection = createLatencyConnection(sourceExchange, targetExchange, data)
        connection.userData = { type: 'latency-connection', data }
        globeRef.current!.add(connection)
      }
    })
  }, [showLatency, isInitialized, latencyData, exchangeData, filters])

  function createExchangeMarker(exchange: ExchangeData) {
    const group = new THREE.Group()
    
    const phi = (90 - exchange.location.lat) * (Math.PI / 180)
    const theta = (exchange.location.lng + 180) * (Math.PI / 180)
    const radius = 5.4

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    // Core marker
    const coreGeometry = new THREE.SphereGeometry(0.08, 16, 16)
    const color = getCloudProviderColor(exchange.cloudProvider)
    const coreMaterial = new THREE.MeshBasicMaterial({ 
      color,
      transparent: true,
      opacity: selectedExchange?.id === exchange.id ? 1.0 : 0.9
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)

    // Glow sphere
    const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: selectedExchange?.id === exchange.id ? 0.5 : 0.3,
      blending: THREE.AdditiveBlending
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)

    // Pulsing ring
    const ringGeometry = new THREE.RingGeometry(0.18, 0.25, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.lookAt(x * 2, y * 2, z * 2)
    ring.userData.isRing = true

    // Vertical beam
    const beamGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8)
    const beamMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
    const beam = new THREE.Mesh(beamGeometry, beamMaterial)
    beam.position.y = 0.75

    group.add(core)
    group.add(glow)
    group.add(ring)
    group.add(beam)

    group.position.set(x, y, z)
    
    // Point towards center
    const direction = new THREE.Vector3(-x, -y, -z).normalize()
    group.lookAt(group.position.clone().add(direction))

    return group
  }

  function createLatencyConnection(source: ExchangeData, target: ExchangeData, latencyData: LatencyData) {
    const sourcePos = getPositionFromLatLng(source.location.lat, source.location.lng)
    const targetPos = getPositionFromLatLng(target.location.lat, target.location.lng)

    // Create curved path
    const midPoint = new THREE.Vector3()
      .addVectors(sourcePos, targetPos)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(8)

    const curve = new THREE.QuadraticBezierCurve3(sourcePos, midPoint, targetPos)
    const points = curve.getPoints(50)
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const color = getLatencyColor(latencyData.latency)
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    })
    
    return new THREE.Line(geometry, material)
  }

  function getPositionFromLatLng(lat: number, lng: number) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    const radius = 5.4

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  function getCloudProviderColor(provider: string) {
    switch (provider) {
      case 'aws': return 0xff6b35
      case 'gcp': return 0x4fc3f7
      case 'azure': return 0x00d4ff
      default: return 0x00f5ff
    }
  }

  function getLatencyColor(latency: number) {
    if (latency < 50) return 0x00ff88
    if (latency < 150) return 0xffd700
    return 0xff4757
  }

  // Add click handler for exchange selection
  useEffect(() => {
    if (!containerRef.current || !isInitialized) return

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handleClick = (event: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current || !globeRef.current) return

      const rect = containerRef.current!.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, cameraRef.current)
      
      const markers = globeRef.current.children.filter(child => 
        child.userData.type === 'exchange-marker'
      )
      
      const intersects = raycaster.intersectObjects(markers, true)
      
      if (intersects.length > 0) {
        let parent = intersects[0].object
        while (parent && !parent.userData.exchange) {
          parent = parent.parent!
        }
        
        if (parent && parent.userData.exchange) {
          onExchangeSelect(parent.userData.exchange)
        }
      } else {
        onExchangeSelect(null)
      }
    }

    containerRef.current.addEventListener('click', handleClick)

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick)
      }
    }
  }, [isInitialized, onExchangeSelect])

  // Enhanced mouse/touch controls
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current || !isInitialized) return

    const controls = controlsRef.current

    const handleStart = (clientX: number, clientY: number) => {
      controls.isMouseDown = true
      controls.mouseX = clientX
      controls.mouseY = clientY
    }

    const handleMove = (clientX: number, clientY: number) => {
      if (!controls.isMouseDown || !cameraRef.current) return

      const deltaX = clientX - controls.mouseX
      const deltaY = clientY - controls.mouseY

      controls.targetRotationY -= deltaX * 0.005
      controls.targetRotationX -= deltaY * 0.005
      controls.targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.targetRotationX))

      controls.mouseX = clientX
      controls.mouseY = clientY
    }

    const handleEnd = () => {
      controls.isMouseDown = false
    }

    // Mouse events
    const handleMouseDown = (event: MouseEvent) => {
      handleStart(event.clientX, event.clientY)
    }

    const handleMouseMove = (event: MouseEvent) => {
      handleMove(event.clientX, event.clientY)
    }

    const handleMouseUp = () => {
      handleEnd()
    }

    // Touch events
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      if (event.touches.length === 1) {
        handleStart(event.touches[0].clientX, event.touches[0].clientY)
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (event.touches.length === 1) {
        handleMove(event.touches[0].clientX, event.touches[0].clientY)
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()
      handleEnd()
    }

    // Zoom with mouse wheel
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (!cameraRef.current) return

      const distance = cameraRef.current.position.length()
      const newDistance = Math.max(8, Math.min(50, distance + event.deltaY * 0.02))
      
      const direction = cameraRef.current.position.clone().normalize()
      cameraRef.current.position.copy(direction.multiplyScalar(newDistance))
    }

    const container = containerRef.current
    
    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseup', handleMouseUp)
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isInitialized])

  // Animation loop
  useEffect(() => {
    if (!isInitialized) return

    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      const elapsedTime = clockRef.current.getElapsedTime()
      const controls = controlsRef.current
      
      // Smooth camera rotation
      const smoothing = 0.05
      controls.currentRotationX += (controls.targetRotationX - controls.currentRotationX) * smoothing
      controls.currentRotationY += (controls.targetRotationY - controls.currentRotationY) * smoothing
      
      const distance = cameraRef.current!.position.length()
      const phi = Math.PI / 2 - controls.currentRotationX
      const theta = controls.currentRotationY
      
      cameraRef.current!.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta)
      )
      
      cameraRef.current!.lookAt(0, 0, 0)

      // Globe rotation
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001
      }

      // Animate atmosphere
      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y += 0.0005
        const material = atmosphereRef.current.material as THREE.MeshBasicMaterial
        material.opacity = 0.06 + 0.02 * Math.sin(elapsedTime * 0.5)
      }

      // Animate stars
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.0001
        starsRef.current.rotation.x += 0.00005
      }

      // Animate markers
      const markers = globeRef.current?.children.filter(child =>
        child.userData.type === 'exchange-marker'
      ) || []
      
      markers.forEach((marker, index) => {
        if (marker instanceof THREE.Group) {
          const ring = marker.children.find(child => child.userData.isRing)
          if (ring) {
            const pulseOffset = index * 0.5
            const ringMaterial = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial
            ringMaterial.opacity = 0.3 + 0.4 * Math.sin(elapsedTime * 2 + pulseOffset)
            const scale = 1 + 0.1 * Math.sin(elapsedTime * 3 + pulseOffset)
            ring.scale.setScalar(scale)
          }
        }
      })

      // Animate connections
      const connections = globeRef.current?.children.filter(child =>
        child.userData.type === 'latency-connection'
      ) || []
      
      connections.forEach((connection, index) => {
        if (connection instanceof THREE.Line) {
          const flowOffset = index * 0.3
          const flow = (elapsedTime * 2 + flowOffset) % (Math.PI * 2)
          const connectionMaterial = connection.material as THREE.LineBasicMaterial
          connectionMaterial.opacity = 0.4 + 0.4 * Math.sin(flow)
        }
      })

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isInitialized])

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Globe Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.15) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(0, 0, 0, 1) 100%)',
        }}
      />
      
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-bold mb-3 text-blue-400">🌍 Interactive 3D Globe</h3>
        <div className="space-y-2 text-sm">
          <div>🖱️ <strong>Drag</strong> to rotate</div>
          <div>🔄 <strong>Scroll</strong> to zoom</div>
          <div>📱 <strong>Touch & drag</strong> on mobile</div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showLatency}
              onChange={(e) => setShowLatency(e.target.checked)}
              className="rounded"
            />
            Show Connections
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
        <h4 className="font-bold mb-2 text-blue-400">Cloud Providers</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>AWS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Azure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span>GCP</span>
          </div>
        </div>
        
        {showLatency && (
          <div className="mt-4">
            <h4 className="font-bold mb-2 text-blue-400">Latency</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-green-500"></div>
                <span>{'<50ms'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-yellow-500"></div>
                <span>50-150ms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-red-500"></div>
                <span>{'>150ms'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-blue-400 text-lg animate-pulse">Loading 3D Globe...</div>
        </div>
      )}
    </div>
  )
}