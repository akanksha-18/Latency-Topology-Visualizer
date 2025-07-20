
// 'use client'

// import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
// import * as THREE from 'three'
// import type { ExchangeData, LatencyData, FilterState } from '../types/index'

// interface Globe3DProps {
//   exchangeData: ExchangeData[]
//   latencyData: LatencyData[]
//   filters: FilterState
//   selectedExchange: ExchangeData | null
//   onExchangeSelect: (exchange: ExchangeData | null) => void
// }

// export function Globe3D({
//   exchangeData,
//   latencyData,
//   filters,
//   selectedExchange,
//   onExchangeSelect,
// }: Globe3DProps) {
//   const containerRef = useRef<HTMLDivElement>(null)
//   const sceneRef = useRef<THREE.Scene>()
//   const rendererRef = useRef<THREE.WebGLRenderer>()
//   const cameraRef = useRef<THREE.PerspectiveCamera>()
//   const globeRef = useRef<THREE.Group>()
//   const atmosphereRef = useRef<THREE.Mesh>()
//   const starsRef = useRef<THREE.Points>()
//   const initRef = useRef(false)
//   const clockRef = useRef(new THREE.Clock())
//   const resizeTimeoutRef = useRef<NodeJS.Timeout>()
  
//   const [isMobile, setIsMobile] = useState(false)
//   const [devicePixelRatio, setDevicePixelRatio] = useState(1)

//   // Detect mobile and device capabilities
//   useEffect(() => {
//     const checkDevice = () => {
//       const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
//       setIsMobile(mobile)
//       setDevicePixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
//     }
    
//     checkDevice()
//     window.addEventListener('resize', checkDevice)
//     return () => window.removeEventListener('resize', checkDevice)
//   }, [])

//   // Debounced resize handler
//   const handleResize = useCallback(() => {
//     if (!cameraRef.current || !rendererRef.current || !containerRef.current) return
    
//     const container = containerRef.current
//     const camera = cameraRef.current
//     const renderer = rendererRef.current
    
//     // Clear existing timeout
//     if (resizeTimeoutRef.current) {
//       clearTimeout(resizeTimeoutRef.current)
//     }
    
//     // Debounce resize to prevent excessive calls
//     resizeTimeoutRef.current = setTimeout(() => {
//       const width = container.clientWidth
//       const height = container.clientHeight
      
//       // Update camera
//       camera.aspect = width / height
//       camera.updateProjectionMatrix()
      
//       // Update renderer
//       renderer.setSize(width, height)
//       renderer.setPixelRatio(devicePixelRatio)
      
//       // Adjust camera FOV for mobile
//       if (isMobile) {
//         camera.fov = width < 480 ? 85 : 80
//       } else {
//         camera.fov = 75
//       }
//       camera.updateProjectionMatrix()
//     }, 100)
//   }, [devicePixelRatio, isMobile])

//   // Initialize Three.js scene with responsive settings
//   useEffect(() => {
//     if (!containerRef.current || initRef.current) return

//     const container = containerRef.current
//     const scene = new THREE.Scene()
    
//     // Responsive camera settings
//     const fov = isMobile ? (window.innerWidth < 480 ? 85 : 80) : 75
//     const camera = new THREE.PerspectiveCamera(
//       fov, 
//       container.clientWidth / container.clientHeight, 
//       0.1, 
//       1000
//     )
    
//     // Responsive renderer settings
//     const renderer = new THREE.WebGLRenderer({ 
//       antialias: !isMobile || window.innerWidth > 480, // Disable AA on small mobile for performance
//       alpha: true,
//       powerPreference: isMobile ? "default" : "high-performance",
//       stencil: false,
//       depth: true,
//       logarithmicDepthBuffer: false,
//     })

//     renderer.setSize(container.clientWidth, container.clientHeight)
//     renderer.setPixelRatio(devicePixelRatio)
//     renderer.setClearColor(0x000000, 0)
    
//     // Responsive quality settings
//     if (!isMobile) {
//       renderer.shadowMap.enabled = true
//       renderer.shadowMap.type = THREE.PCFSoftShadowMap
//       renderer.toneMapping = THREE.ACESFilmicToneMapping
//       renderer.toneMappingExposure = 1.2
//     } else {
//       // Disable expensive features on mobile
//       renderer.shadowMap.enabled = false
//       renderer.toneMapping = THREE.LinearToneMapping
//     }
    
//     container.appendChild(renderer.domElement)

//     // Create scene elements with responsive quality
//     createStarField(scene, isMobile)
    
//     // Create globe group
//     const globeGroup = new THREE.Group()
    
//     // Enhanced Earth with multiple layers
//     createEarthLayers(globeGroup, isMobile)
    
//     // Create atmospheric glow
//     createAtmosphere(globeGroup, isMobile)
    
//     scene.add(globeGroup)

//     // Enhanced lighting setup
//     setupLighting(scene, isMobile)

//     // Responsive camera positioning
//     const cameraDistance = isMobile ? (window.innerWidth < 480 ? 25 : 20) : 20
//     camera.position.set(cameraDistance * 0.6, cameraDistance * 0.4, cameraDistance)
//     camera.lookAt(0, 0, 0)

//     // Store references
//     sceneRef.current = scene
//     rendererRef.current = renderer
//     cameraRef.current = camera
//     globeRef.current = globeGroup

//     initRef.current = true

//     // Add resize listener
//     window.addEventListener('resize', handleResize)

//     return () => {
//       window.removeEventListener('resize', handleResize)
//       if (resizeTimeoutRef.current) {
//         clearTimeout(resizeTimeoutRef.current)
//       }
//       initRef.current = false
//       if (container && renderer.domElement && container.contains(renderer.domElement)) {
//         container.removeChild(renderer.domElement)
//       }
//       renderer.dispose()
//     }
//   }, [isMobile, devicePixelRatio, handleResize])

//   function createStarField(scene: THREE.Scene, mobile: boolean) {
//     const starsGeometry = new THREE.BufferGeometry()
//     // Reduce star count on mobile for performance
//     const starCount = mobile ? 1500 : 3000
//     const positions = new Float32Array(starCount * 3)
//     const colors = new Float32Array(starCount * 3)
//     const sizes = new Float32Array(starCount)

//     for (let i = 0; i < starCount; i++) {
//       // Random positions in a sphere
//       const i3 = i * 3
//       const radius = 100 + Math.random() * 400
//       const theta = Math.random() * Math.PI * 2
//       const phi = Math.acos(2 * Math.random() - 1)
      
//       positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
//       positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
//       positions[i3 + 2] = radius * Math.cos(phi)

//       // Star colors - mix of white, blue, and warm tones
//       const starColor = new THREE.Color()
//       const colorChoice = Math.random()
//       if (colorChoice < 0.7) {
//         starColor.setHSL(0.6, 0.1, 0.8 + Math.random() * 0.2) // Blue-white
//       } else if (colorChoice < 0.9) {
//         starColor.setHSL(0.1, 0.3, 0.9) // Warm white
//       } else {
//         starColor.setHSL(0.15, 0.8, 0.8) // Orange
//       }
      
//       colors[i3] = starColor.r
//       colors[i3 + 1] = starColor.g
//       colors[i3 + 2] = starColor.b

//       sizes[i] = Math.random() * 2 + 0.5
//     }

//     starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
//     starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
//     starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

//     const starsMaterial = new THREE.PointsMaterial({
//       size: mobile ? 1.5 : 2,
//       sizeAttenuation: true,
//       vertexColors: true,
//       transparent: true,
//       opacity: mobile ? 0.6 : 0.8,
//       blending: THREE.AdditiveBlending
//     })

//     const stars = new THREE.Points(starsGeometry, starsMaterial)
//     starsRef.current = stars
//     scene.add(stars)
//   }

//   function createEarthLayers(globeGroup: THREE.Group, mobile: boolean) {
//     const radius = 5

//     // Main Earth sphere with responsive quality
//     const earthGeometry = new THREE.SphereGeometry(
//       radius, 
//       mobile ? 64 : 128, // Reduce geometry complexity on mobile
//       mobile ? 64 : 128
//     )
    
//     // Create a gradient texture programmatically with responsive resolution
//     const canvas = document.createElement('canvas')
//     const textureSize = mobile ? 256 : 512
//     canvas.width = textureSize
//     canvas.height = textureSize
//     const ctx = canvas.getContext('2d')!
    
//     // Create radial gradient
//     const gradient = ctx.createRadialGradient(
//       textureSize/2, textureSize/2, 0, 
//       textureSize/2, textureSize/2, textureSize/2
//     )
//     gradient.addColorStop(0, '#1e3a8a')
//     gradient.addColorStop(0.4, '#1e40af')
//     gradient.addColorStop(0.7, '#1d4ed8')
//     gradient.addColorStop(1, '#0f172a')
    
//     ctx.fillStyle = gradient
//     ctx.fillRect(0, 0, textureSize, textureSize)
    
//     // Add some noise for texture (less on mobile)
//     const noisePoints = mobile ? 500 : 1000
//     for (let i = 0; i < noisePoints; i++) {
//       const x = Math.random() * textureSize
//       const y = Math.random() * textureSize
//       const size = Math.random() * 2
//       ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`
//       ctx.fillRect(x, y, size, size)
//     }
    
//     const earthTexture = new THREE.CanvasTexture(canvas)
    
//     const earthMaterial = new THREE.MeshPhongMaterial({
//       map: earthTexture,
//       shininess: mobile ? 50 : 150,
//       transparent: true,
//       opacity: 0.9,
//       specular: 0x1e40af,
//     })
    
//     const earth = new THREE.Mesh(earthGeometry, earthMaterial)
//     if (!mobile) {
//       earth.castShadow = true
//       earth.receiveShadow = true
//     }
//     globeGroup.add(earth)

//     // Animated wireframe overlay with responsive complexity
//     const wireframeGeometry = new THREE.SphereGeometry(
//       radius + 0.02, 
//       mobile ? 32 : 64, 
//       mobile ? 32 : 64
//     )
//     const wireframeMaterial = new THREE.MeshBasicMaterial({
//       color: 0x00f5ff,
//       wireframe: true,
//       transparent: true,
//       opacity: mobile ? 0.1 : 0.15,
//     })
//     const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
//     globeGroup.add(wireframe)

//     // Grid lines for latitude and longitude (simplified on mobile)
//     if (!mobile || window.innerWidth > 480) {
//       createGridLines(globeGroup, radius, mobile)
//     }
//   }

//   function createGridLines(globeGroup: THREE.Group, radius: number, mobile: boolean) {
//     const gridGroup = new THREE.Group()
    
//     // Fewer grid lines on mobile
//     const step = mobile ? 40 : 20
    
//     // Latitude lines
//     for (let lat = -80; lat <= 80; lat += step) {
//       const phi = (90 - lat) * (Math.PI / 180)
//       const circleRadius = radius * Math.sin(phi)
//       const y = radius * Math.cos(phi)
      
//       const geometry = new THREE.RingGeometry(
//         circleRadius - 0.01, 
//         circleRadius + 0.01, 
//         mobile ? 32 : 64
//       )
//       const material = new THREE.MeshBasicMaterial({
//         color: 0x00f5ff,
//         transparent: true,
//         opacity: mobile ? 0.05 : 0.1,
//         side: THREE.DoubleSide
//       })
//       const circle = new THREE.Mesh(geometry, material)
//       circle.rotation.x = Math.PI / 2
//       circle.position.y = y
//       gridGroup.add(circle)
//     }
    
//     gridGroup.rotation.x = Math.PI / 2
//     globeGroup.add(gridGroup)
//   }

//   function createAtmosphere(globeGroup: THREE.Group, mobile: boolean) {
//     const atmosphereGeometry = new THREE.SphereGeometry(
//       5.5, 
//       mobile ? 32 : 64, 
//       mobile ? 32 : 64
//     )
//     const atmosphereMaterial = new THREE.MeshBasicMaterial({
//       color: 0x00aaff,
//       transparent: true,
//       opacity: mobile ? 0.05 : 0.08,
//       side: THREE.BackSide,
//       blending: THREE.AdditiveBlending,
//     })
    
//     const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
//     atmosphereRef.current = atmosphere
//     globeGroup.add(atmosphere)

//     // Outer glow (skip on very small screens)
//     if (!mobile || window.innerWidth > 480) {
//       const glowGeometry = new THREE.SphereGeometry(6.2, 32, 32)
//       const glowMaterial = new THREE.MeshBasicMaterial({
//         color: 0x0088ff,
//         transparent: true,
//         opacity: mobile ? 0.02 : 0.03,
//         side: THREE.BackSide,
//         blending: THREE.AdditiveBlending,
//       })
//       const glow = new THREE.Mesh(glowGeometry, glowMaterial)
//       globeGroup.add(glow)
//     }
//   }

//   function setupLighting(scene: THREE.Scene, mobile: boolean) {
//     // Ambient light
//     const ambientLight = new THREE.AmbientLight(0x404080, mobile ? 0.4 : 0.3)
//     scene.add(ambientLight)

//     // Main directional light (sun)
//     const sunLight = new THREE.DirectionalLight(0xffffff, mobile ? 0.8 : 1.2)
//     sunLight.position.set(15, 10, 5)
//     if (!mobile) {
//       sunLight.castShadow = true
//       sunLight.shadow.mapSize.width = 2048
//       sunLight.shadow.mapSize.height = 2048
//     }
//     scene.add(sunLight)

//     // Reduce additional lights on mobile
//     if (!mobile) {
//       // Rim light
//       const rimLight = new THREE.DirectionalLight(0x00aaff, 0.5)
//       rimLight.position.set(-10, 0, -10)
//       scene.add(rimLight)

//       // Point lights for atmosphere
//       const pointLight1 = new THREE.PointLight(0x00f5ff, 0.3, 50)
//       pointLight1.position.set(10, 10, 10)
//       scene.add(pointLight1)

//       const pointLight2 = new THREE.PointLight(0xff5500, 0.2, 30)
//       pointLight2.position.set(-8, -5, 8)
//       scene.add(pointLight2)
//     }
//   }

//   // Filtered exchange data
//   const filteredExchanges = useMemo(() => {
//     return exchangeData.filter(exchange => {
//       if (filters.exchanges.length > 0 && !filters.exchanges.includes(exchange.name)) {
//         return false
//       }
//       if (!filters.cloudProviders.includes(exchange.cloudProvider)) {
//         return false
//       }
//       return true
//     })
//   }, [exchangeData, filters])

//   // Add enhanced exchange markers
//   useEffect(() => {
//     if (!sceneRef.current || !globeRef.current || !initRef.current) return

//     // Remove existing markers
//     const existingMarkers = globeRef.current.children.filter(child => 
//       child.userData.type === 'exchange-marker'
//     )
//     existingMarkers.forEach(marker => globeRef.current!.remove(marker))

//     // Add new enhanced markers
//     filteredExchanges.forEach(exchange => {
//       const marker = createEnhancedExchangeMarker(exchange, isMobile)
//       marker.userData = { type: 'exchange-marker', exchange }
//       globeRef.current!.add(marker)
//     })
//   }, [filteredExchanges, isMobile])

//   // Add enhanced latency connections
//   useEffect(() => {
//     if (!sceneRef.current || !globeRef.current || !filters.showRealTime || !initRef.current) return

//     // Remove existing connections
//     const existingConnections = globeRef.current.children.filter(child =>
//       child.userData.type === 'latency-connection'
//     )
//     existingConnections.forEach(connection => globeRef.current!.remove(connection))

//     // Add new enhanced connections
//     latencyData.forEach(data => {
//       const sourceExchange = filteredExchanges.find(e => e.id === data.sourceId)
//       const targetExchange = filteredExchanges.find(e => e.id === data.targetId)
      
//       if (sourceExchange && targetExchange) {
//         const connection = createEnhancedLatencyConnection(sourceExchange, targetExchange, data, isMobile)
//         connection.userData = { type: 'latency-connection', data }
//         globeRef.current!.add(connection)
//       }
//     })
//   }, [filteredExchanges, latencyData, filters.showRealTime, isMobile])

//   // Enhanced animation loop with performance throttling
//   useEffect(() => {
//     if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !initRef.current) return

//     let animationId: number
//     let lastTime = 0
//     const targetFPS = isMobile ? 30 : 60
//     const frameInterval = 1000 / targetFPS

//     const animate = (currentTime: number) => {
//       animationId = requestAnimationFrame(animate)
      
//       // Throttle framerate on mobile
//       if (currentTime - lastTime < frameInterval) {
//         return
//       }
//       lastTime = currentTime
      
//       const elapsedTime = clockRef.current.getElapsedTime()
      
//       // Smooth globe rotation (slower on mobile to save battery)
//       if (globeRef.current) {
//         globeRef.current.rotation.y += isMobile ? 0.0005 : 0.001
//       }

//       // Animate atmosphere
//       if (atmosphereRef.current) {
//         atmosphereRef.current.rotation.y += isMobile ? 0.0003 : 0.0005
//         const material = atmosphereRef.current.material as THREE.MeshBasicMaterial
//         material.opacity = (isMobile ? 0.03 : 0.05) + (isMobile ? 0.02 : 0.03) * Math.sin(elapsedTime * 0.5)
//       }

//       // Animate stars (skip on very small screens)
//       if (starsRef.current && (!isMobile || window.innerWidth > 480)) {
//         starsRef.current.rotation.y += 0.0001
//         starsRef.current.rotation.x += 0.00005
//       }

//       // Update exchange markers with pulsing animation (reduced on mobile)
//       const markers = globeRef.current?.children.filter(child =>
//         child.userData.type === 'exchange-marker'
//       ) || []
      
//       if (!isMobile || markers.length < 10) { // Limit animations on mobile with many markers
//         markers.forEach((marker, index) => {
//           if (marker instanceof THREE.Group) {
//             const ring = marker.children.find(child => child.userData.isRing)
//             if (ring && ring instanceof THREE.Mesh) {
//               const ringMaterial = ring.material as THREE.MeshBasicMaterial
//               const pulseOffset = index * 0.5
//               ringMaterial.opacity = 0.3 + 0.4 * Math.sin(elapsedTime * 2 + pulseOffset)
              
//               // Scale pulse
//               const scale = 1 + 0.1 * Math.sin(elapsedTime * 3 + pulseOffset)
//               ring.scale.setScalar(scale)
//             }
//           }
//         })
//       }

//       // Animate latency connections with flowing effect
//       const connections = globeRef.current?.children.filter(child =>
//         child.userData.type === 'latency-connection'
//       ) || []
      
//       if (!isMobile || connections.length < 5) { // Limit animations on mobile
//         connections.forEach((connection, index) => {
//           if (connection instanceof THREE.Line) {
//             const material = connection.material as THREE.LineBasicMaterial
//             const flowOffset = index * 0.3
//             const flow = (elapsedTime * 2 + flowOffset) % (Math.PI * 2)
//             material.opacity = 0.4 + 0.4 * Math.sin(flow)
//           }
//         })
//       }

//       rendererRef.current!.render(sceneRef.current!, cameraRef.current!)
//     }

//     animate(0)

//     return () => {
//       if (animationId) {
//         cancelAnimationFrame(animationId)
//       }
//     }
//   }, [isMobile])

//   // Enhanced mouse/touch controls with responsive behavior
//   useEffect(() => {
//     if (!containerRef.current || !cameraRef.current || !initRef.current) return

//     let isMouseDown = false
//     let mouseX = 0
//     let mouseY = 0
//     let targetRotationX = 0
//     let targetRotationY = 0
//     let currentRotationX = 0
//     let currentRotationY = 0

//     const handleStart = (clientX: number, clientY: number) => {
//       isMouseDown = true
//       mouseX = clientX
//       mouseY = clientY
//     }

//     const handleMove = (clientX: number, clientY: number) => {
//       if (!isMouseDown || !cameraRef.current) return

//       const deltaX = clientX - mouseX
//       const deltaY = clientY - mouseY

//       // Adjust sensitivity for mobile
//       const sensitivity = isMobile ? 0.008 : 0.005
      
//       targetRotationY -= deltaX * sensitivity
//       targetRotationX -= deltaY * sensitivity
//       targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX))

//       mouseX = clientX
//       mouseY = clientY
//     }

//     const handleEnd = () => {
//       isMouseDown = false
//     }

//     // Mouse events
//     const handleMouseDown = (event: MouseEvent) => {
//       handleStart(event.clientX, event.clientY)
//     }

//     const handleMouseMove = (event: MouseEvent) => {
//       handleMove(event.clientX, event.clientY)
//     }

//     const handleMouseUp = () => {
//       handleEnd()
//     }

//     // Touch events
//     const handleTouchStart = (event: TouchEvent) => {
//       event.preventDefault()
//       if (event.touches.length === 1) {
//         handleStart(event.touches[0].clientX, event.touches[0].clientY)
//       }
//     }

//     const handleTouchMove = (event: TouchEvent) => {
//       event.preventDefault()
//       if (event.touches.length === 1) {
//         handleMove(event.touches[0].clientX, event.touches[0].clientY)
//       }
//     }

//     const handleTouchEnd = (event: TouchEvent) => {
//       event.preventDefault()
//       handleEnd()
//     }

//     const handleWheel = (event: WheelEvent) => {
//       event.preventDefault()
//       if (!cameraRef.current) return

//       const distance = cameraRef.current.position.length()
//       const minDistance = isMobile ? 15 : 12
//       const maxDistance = isMobile ? 40 : 50
//       const zoomSpeed = isMobile ? 0.03 : 0.02
      
//       const newDistance = Math.max(minDistance, Math.min(maxDistance, distance + event.deltaY * zoomSpeed))
      
//       const direction = cameraRef.current.position.clone().normalize()
//       cameraRef.current.position.copy(direction.multiplyScalar(newDistance))
//     }

//     // Smooth camera rotation animation
//     const updateCamera = () => {
//       if (!cameraRef.current) return
      
//       const smoothing = isMobile ? 0.08 : 0.05
//       currentRotationX += (targetRotationX - currentRotationX) * smoothing
//       currentRotationY += (targetRotationY - currentRotationY) * smoothing
      
//       const distance = cameraRef.current.position.length()
//       const phi = Math.PI / 2 - currentRotationX
//       const theta = currentRotationY
      
//       cameraRef.current.position.set(
//         distance * Math.sin(phi) * Math.cos(theta),
//         distance * Math.cos(phi),
//         distance * Math.sin(phi) * Math.sin(theta)
//       )
      
//       cameraRef.current.lookAt(0, 0, 0)
      
//       requestAnimationFrame(updateCamera)
//     }
//     updateCamera()

//     const container = containerRef.current
    
//     // Mouse events
//     container.addEventListener('mousedown', handleMouseDown)
//     container.addEventListener('mousemove', handleMouseMove)
//     container.addEventListener('mouseup', handleMouseUp)
//     container.addEventListener('wheel', handleWheel, { passive: false })
    
//     // Touch events
//     container.addEventListener('touchstart', handleTouchStart, { passive: false })
//     container.addEventListener('touchmove', handleTouchMove, { passive: false })
//     container.addEventListener('touchend', handleTouchEnd, { passive: false })

//     return () => {
//       if (container) {
//         container.removeEventListener('mousedown', handleMouseDown)
//         container.removeEventListener('mousemove', handleMouseMove)
//         container.removeEventListener('mouseup', handleMouseUp)
//         container.removeEventListener('wheel', handleWheel)
//         container.removeEventListener('touchstart', handleTouchStart)
//         container.removeEventListener('touchmove', handleTouchMove)
//         container.removeEventListener('touchend', handleTouchEnd)
//       }
//     }
//   }, [isMobile])

//   function createEnhancedExchangeMarker(exchange: ExchangeData, mobile: boolean): THREE.Group {
//     const group = new THREE.Group()
    
//     // Convert lat/lng to 3D position
//     const phi = (90 - exchange.location.lat) * (Math.PI / 180)
//     const theta = (exchange.location.lng + 180) * (Math.PI / 180)
//     const radius = 5.3

//     const x = radius * Math.sin(phi) * Math.cos(theta)
//     const y = radius * Math.cos(phi)
//     const z = radius * Math.sin(phi) * Math.sin(theta)

//     // Responsive marker sizes
//     const coreSize = mobile ? 0.06 : 0.08
//     const glowSize = mobile ? 0.12 : 0.15
//     const ringInner = mobile ? 0.15 : 0.18
//     const ringOuter = mobile ? 0.20 : 0.25

//     // Core marker with glow
//     const coreGeometry = new THREE.SphereGeometry(coreSize, mobile ? 8 : 16, mobile ? 8 : 16)
//     const color = getCloudProviderColor(exchange.cloudProvider)
//     const coreMaterial = new THREE.MeshBasicMaterial({ 
//       color,
//       transparent: true,
//       opacity: 0.9
//     })
//     const core = new THREE.Mesh(coreGeometry, coreMaterial)

//     // Outer glow sphere
//     const glowGeometry = new THREE.SphereGeometry(glowSize, mobile ? 8 : 16, mobile ? 8 : 16)
//     const glowMaterial = new THREE.MeshBasicMaterial({
//       color,
//       transparent: true,
//       opacity: mobile ? 0.2 : 0.3,
//       blending: THREE.AdditiveBlending
//     })
//     const glow = new THREE.Mesh(glowGeometry, glowMaterial)

//     // Animated ring
//     const ringGeometry = new THREE.RingGeometry(ringInner, ringOuter, mobile ? 16 : 32)
//     const ringMaterial = new THREE.MeshBasicMaterial({
//       color,
//       transparent: true,
//       opacity: 0.6,
//       side: THREE.DoubleSide,
//       blending: THREE.AdditiveBlending
//     })
//     const ring = new THREE.Mesh(ringGeometry, ringMaterial)
//     ring.lookAt(x * 2, y * 2, z * 2)
//     ring.userData.isRing = true

//     group.add(core)
//     group.add(glow)
//     group.add(ring)

//     // Add beam only on non-mobile or larger screens
//     if (!mobile || window.innerWidth > 600) {
//       const beamGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8)
//       const beamMaterial = new THREE.MeshBasicMaterial({
//         color,
//         transparent: true,
//         opacity: mobile ? 0.2 : 0.4,
//         blending: THREE.AdditiveBlending
//       })
//       const beam = new THREE.Mesh(beamGeometry, beamMaterial)
//       beam.position.y = 1
//       group.add(beam)
//     }

//     group.position.set(x, y, z)
    
//     // Point the beam towards center
//     const direction = new THREE.Vector3(x, y, z).normalize()
//     group.lookAt(direction.multiplyScalar(10))

//     return group
//   }

//   function createEnhancedLatencyConnection(
//     source: ExchangeData,
//     target: ExchangeData,
//     latencyData: LatencyData,
//     mobile: boolean
//   ): THREE.Group {
//     const group = new THREE.Group()
    
//     const sourcePos = getPositionFromLatLng(source.location.lat, source.location.lng)
//     const targetPos = getPositionFromLatLng(target.location.lat, target.location.lng)

//     // Create curved path with responsive arc height
//     const arcHeight = mobile ? 7 : 8
//     const midPoint = new THREE.Vector3()
//       .addVectors(sourcePos, targetPos)
//       .multiplyScalar(0.5)
//       .normalize()
//       .multiplyScalar(arcHeight)

//     const curve = new THREE.QuadraticBezierCurve3(sourcePos, midPoint, targetPos)
//     const points = curve.getPoints(mobile ? 50 : 100) // Fewer points on mobile
    
//     // Main connection line
//     const geometry = new THREE.BufferGeometry().setFromPoints(points)
//     const color = getLatencyColor(latencyData.latency)
//     const material = new THREE.LineBasicMaterial({
//       color,
//       transparent: true,
//       opacity: mobile ? 0.5 : 0.7,
//       linewidth: mobile ? 1 : 2
//     })
//     const line = new THREE.Line(geometry, material)

//     // Glowing effect line (skip on mobile for performance)
//     if (!mobile) {
//       const glowMaterial = new THREE.LineBasicMaterial({
//         color,
//         transparent: true,
//         opacity: 0.2,
//         linewidth: 4,
//         blending: THREE.AdditiveBlending
//       })
//       const glowLine = new THREE.Line(geometry, glowMaterial)
//       group.add(glowLine)
//     }

//     group.add(line)
//     return group
//   }

//   function getPositionFromLatLng(lat: number, lng: number): THREE.Vector3 {
//     const phi = (90 - lat) * (Math.PI / 180)
//     const theta = (lng + 180) * (Math.PI / 180)
//     const radius = 5.3

//     return new THREE.Vector3(
//       radius * Math.sin(phi) * Math.cos(theta),
//       radius * Math.cos(phi),
//       radius * Math.sin(phi) * Math.sin(theta)
//     )
//   }

//   function getCloudProviderColor(provider: string): number {
//     switch (provider) {
//       case 'aws': return 0xff6b35
//       case 'gcp': return 0x4fc3f7
//       case 'azure': return 0x00d4ff
//       default: return 0x00f5ff
//     }
//   }

//   function getLatencyColor(latency: number): number {
//     if (latency < 50) return 0x00ff88
//     if (latency < 150) return 0xffd700
//     return 0xff4757
//   }

//   return (
//     <div 
//       ref={containerRef} 
//       className="w-full h-full relative overflow-hidden touch-none"
//       style={{
//         background: isMobile 
//           ? 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.1) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(0, 0, 0, 1) 100%)'
//           : 'radial-gradient(ellipse at center, rgba(29, 78, 216, 0.15) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(0, 0, 0, 1) 100%)',
//         minHeight: isMobile ? '300px' : '400px',
//       }}
//     >
//       {/* Loading indicator for mobile */}
//       {isMobile && !initRef.current && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="text-blue-400 text-sm">Loading 3D Globe...</div>
//         </div>
//       )}
      
//       {/* Performance hint for very small screens */}
//       {isMobile && window.innerWidth < 400 && (
//         <div className="absolute top-2 left-2 right-2 text-xs text-blue-300 bg-black/20 rounded p-2 pointer-events-none">
//           Tip: Rotate to explore • Pinch to zoom
//         </div>
//       )}
//     </div>
//   )
// }

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

// Mock data for demonstration
const mockExchangeData = [
  { id: 1, name: 'NYSE', cloudProvider: 'aws', location: { lat: 40.7128, lng: -74.0060 } },
  { id: 2, name: 'LSE', cloudProvider: 'azure', location: { lat: 51.5074, lng: -0.1278 } },
  { id: 3, name: 'TSE', cloudProvider: 'gcp', location: { lat: 35.6762, lng: 139.6503 } },
  { id: 4, name: 'SSE', cloudProvider: 'aws', location: { lat: 31.2304, lng: 121.4737 } },
  { id: 5, name: 'BSE', cloudProvider: 'azure', location: { lat: 19.0760, lng: 72.8777 } },
]

const mockLatencyData = [
  { sourceId: 1, targetId: 2, latency: 45 },
  { sourceId: 2, targetId: 3, latency: 125 },
  { sourceId: 3, targetId: 4, latency: 25 },
  { sourceId: 1, targetId: 5, latency: 180 },
]

export default function Interactive3DGlobe() {
  const containerRef = useRef(null)
  const sceneRef = useRef()
  const rendererRef = useRef()
  const cameraRef = useRef()
  const globeRef = useRef()
  const atmosphereRef = useRef()
  const starsRef = useRef()
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
  const [selectedExchange, setSelectedExchange] = useState(null)

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

  function createStarField(scene) {
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

  function createEarthLayers(globeGroup) {
    const radius = 5

    // Create gradient texture
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
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

  function createGridLines(globeGroup, radius) {
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

  function createAtmosphere(globeGroup) {
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

  function setupLighting(scene) {
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

  // Add exchange markers
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current || !isInitialized) return

    // Remove existing markers
    const existingMarkers = globeRef.current.children.filter(child => 
      child.userData.type === 'exchange-marker'
    )
    existingMarkers.forEach(marker => globeRef.current.remove(marker))

    // Add new markers
    mockExchangeData.forEach(exchange => {
      const marker = createExchangeMarker(exchange)
      marker.userData = { type: 'exchange-marker', exchange }
      globeRef.current.add(marker)
    })
  }, [isInitialized])

  // Add latency connections
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current || !showLatency || !isInitialized) return

    // Remove existing connections
    const existingConnections = globeRef.current.children.filter(child =>
      child.userData.type === 'latency-connection'
    )
    existingConnections.forEach(connection => globeRef.current.remove(connection))

    // Add new connections
    mockLatencyData.forEach(data => {
      const sourceExchange = mockExchangeData.find(e => e.id === data.sourceId)
      const targetExchange = mockExchangeData.find(e => e.id === data.targetId)
      
      if (sourceExchange && targetExchange) {
        const connection = createLatencyConnection(sourceExchange, targetExchange, data)
        connection.userData = { type: 'latency-connection', data }
        globeRef.current.add(connection)
      }
    })
  }, [showLatency, isInitialized])

  function createExchangeMarker(exchange) {
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
      opacity: 0.9
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)

    // Glow sphere
    const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
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

  function createLatencyConnection(source, target, latencyData) {
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

  function getPositionFromLatLng(lat, lng) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    const radius = 5.4

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  function getCloudProviderColor(provider) {
    switch (provider) {
      case 'aws': return 0xff6b35
      case 'gcp': return 0x4fc3f7
      case 'azure': return 0x00d4ff
      default: return 0x00f5ff
    }
  }

  function getLatencyColor(latency) {
    if (latency < 50) return 0x00ff88
    if (latency < 150) return 0xffd700
    return 0xff4757
  }

  // Enhanced mouse/touch controls
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current || !isInitialized) return

    const controls = controlsRef.current

    const handleStart = (clientX, clientY) => {
      controls.isMouseDown = true
      controls.mouseX = clientX
      controls.mouseY = clientY
    }

    const handleMove = (clientX, clientY) => {
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
    const handleMouseDown = (event) => {
      handleStart(event.clientX, event.clientY)
    }

    const handleMouseMove = (event) => {
      handleMove(event.clientX, event.clientY)
    }

    const handleMouseUp = () => {
      handleEnd()
    }

    // Touch events
    const handleTouchStart = (event) => {
      event.preventDefault()
      if (event.touches.length === 1) {
        handleStart(event.touches[0].clientX, event.touches[0].clientY)
      }
    }

    const handleTouchMove = (event) => {
      event.preventDefault()
      if (event.touches.length === 1) {
        handleMove(event.touches[0].clientX, event.touches[0].clientY)
      }
    }

    const handleTouchEnd = (event) => {
      event.preventDefault()
      handleEnd()
    }

    // Zoom with mouse wheel
    const handleWheel = (event) => {
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

    let animationId

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      const elapsedTime = clockRef.current.getElapsedTime()
      const controls = controlsRef.current
      
      // Smooth camera rotation
      const smoothing = 0.05
      controls.currentRotationX += (controls.targetRotationX - controls.currentRotationX) * smoothing
      controls.currentRotationY += (controls.targetRotationY - controls.currentRotationY) * smoothing
      
      const distance = cameraRef.current.position.length()
      const phi = Math.PI / 2 - controls.currentRotationX
      const theta = controls.currentRotationY
      
      cameraRef.current.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta)
      )
      
      cameraRef.current.lookAt(0, 0, 0)

      // Globe rotation
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001
      }

      // Animate atmosphere
      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y += 0.0005
        const material = atmosphereRef.current.material
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
            ring.material.opacity = 0.3 + 0.4 * Math.sin(elapsedTime * 2 + pulseOffset)
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
          connection.material.opacity = 0.4 + 0.4 * Math.sin(flow)
        }
      })

      rendererRef.current.render(sceneRef.current, cameraRef.current)
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