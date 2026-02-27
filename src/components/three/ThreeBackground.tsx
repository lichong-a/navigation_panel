'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useThemeStore } from '@/stores/theme'

function ParticleField({ mouse, isMobile, particleColor }: { mouse: { x: number; y: number }; isMobile: boolean; particleColor: string }) {
  const ref = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  const { positions, originalPositions } = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const originalPositions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const x = (Math.random() - 0.5) * 30
      const y = (Math.random() - 0.5) * 30
      const z = (Math.random() - 0.5) * 30
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      originalPositions[i3] = x
      originalPositions[i3 + 1] = y
      originalPositions[i3 + 2] = z
    }

    return { positions, originalPositions }
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      // 基础旋转
      ref.current.rotation.x -= delta * 0.005
      ref.current.rotation.y -= delta * 0.008

      // 手机端：固定转速；电脑端：跟随鼠标
      if (isMobile) {
        ref.current.rotation.x += delta * 0.05
        ref.current.rotation.y += delta * 0.08
      } else {
        ref.current.rotation.x += mouse.y * delta * 0.1
        ref.current.rotation.y += mouse.x * delta * 0.1
      }

      const geometry = ref.current.geometry
      const positionAttribute = geometry.attributes.position as THREE.BufferAttribute
      const posArray = positionAttribute.array as Float32Array

      // 手机端不做粒子吸引效果
      if (!isMobile) {
        const mouseWorld = new THREE.Vector3(
          mouse.x * (viewport.width / 2),
          mouse.y * (viewport.height / 2),
          0
        )
        const attractRadius = 6
        const attractStrength = 0.015
        const returnSpeed = 0.02

        for (let i = 0; i < posArray.length; i += 3) {
          const ox = originalPositions[i]
          const oy = originalPositions[i + 1]
          const oz = originalPositions[i + 2]

          const px = posArray[i]
          const py = posArray[i + 1]
          const pz = posArray[i + 2]

          const dx = mouseWorld.x - px
          const dy = mouseWorld.y - py
          const dz = mouseWorld.z - pz
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < attractRadius && dist > 0.3) {
            const force = ((attractRadius - dist) / attractRadius) * attractStrength
            const nx = dx / dist
            const ny = dy / dist
            const nz = dz / dist

            posArray[i] += nx * force
            posArray[i + 1] += ny * force
            posArray[i + 2] += nz * force
          }

          posArray[i] += (ox - posArray[i]) * returnSpeed
          posArray[i + 1] += (oy - posArray[i + 1]) * returnSpeed
          posArray[i + 2] += (oz - posArray[i + 2]) * returnSpeed
        }

        positionAttribute.needsUpdate = true
      }
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={particleColor}
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}

function GlowCircle({ 
  mouse, 
  isMobile,
  size, 
  opacity, 
  color,
  pulseSpeed = 2,
  pulseAmount = 0.1,
  autoMove = false
}: { 
  mouse: { x: number; y: number }
  isMobile: boolean
  size: number
  opacity: number
  color: string
  pulseSpeed?: number
  pulseAmount?: number
  autoMove?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      let targetX = 0
      let targetY = 0

      if (isMobile && autoMove) {
        // 手机端：自动缓慢移动
        targetX = Math.sin(state.clock.elapsedTime * 0.3) * (viewport.width / 3)
        targetY = Math.cos(state.clock.elapsedTime * 0.2) * (viewport.height / 3)
      } else {
        targetX = mouse.x * (viewport.width / 2)
        targetY = mouse.y * (viewport.height / 2)
      }

      meshRef.current.position.x = targetX
      meshRef.current.position.y = targetY
      meshRef.current.position.z = 0

      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseAmount
      meshRef.current.scale.set(scale, scale, 1)
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(size, 64)
    return geo
  }, [size])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        color: { value: new THREE.Color(color) },
        opacity: { value: opacity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float dist = distance(vUv, vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, dist) * opacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    })
  }, [color, opacity])

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

export function ThreeBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const mode = useThemeStore((state) => state.mode)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const updateResolvedTheme = () => {
      const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setResolvedTheme(isDark ? 'dark' : 'light')
    }

    updateResolvedTheme()

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateResolvedTheme)
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
    }
  }, [mode])

  const isDark = resolvedTheme === 'dark'
  const particleColor = isDark ? '#818cf8' : '#6366f1'
  const glowColor1 = isDark ? '#a855f7' : '#8b5cf6'
  const glowColor2 = isDark ? '#818cf8' : '#6366f1'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMouse({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ zIndex: 0 }}
    >
      <Canvas
        key={resolvedTheme}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField mouse={mouse} isMobile={isMobile} particleColor={particleColor} />
        <GlowCircle mouse={mouse} isMobile={isMobile} size={1} opacity={0.2} color={glowColor1} pulseSpeed={1.5} pulseAmount={0.15} autoMove />
        <GlowCircle mouse={mouse} isMobile={isMobile} size={0.5} opacity={0.35} color={glowColor2} pulseSpeed={2} pulseAmount={0.1} autoMove />
      </Canvas>
    </div>
  )
}
