'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'

function JewelryModel() {
  const jewelry = useRef<Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  useFrame((_, delta) => {
    if (!jewelry.current) return

    const responsiveScale = Math.min(1, viewport.width / 7)
    jewelry.current.rotation.y += delta * 0.22
    jewelry.current.rotation.x += (pointer.current.y * 0.16 - jewelry.current.rotation.x) * delta * 2
    jewelry.current.rotation.z += (-pointer.current.x * 0.12 - jewelry.current.rotation.z) * delta * 2
    jewelry.current.scale.setScalar(0.95 + responsiveScale * 0.08)
  })

  return (
    <group ref={jewelry} rotation={[0.12, -0.35, -0.08]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.22, 0.13, 48, 128]} />
        <meshStandardMaterial color="#c89b4d" metalness={1} roughness={0.16} envMapIntensity={2.8} />
      </mesh>

      <mesh position={[0, 1.17, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <octahedronGeometry args={[0.64, 1]} />
        <MeshTransmissionMaterial
          backside
          chromaticAberration={0.04}
          color="#fffaf0"
          distortion={0.12}
          distortionScale={0.18}
          ior={2.42}
          metalness={0.05}
          roughness={0.02}
          transmission={1}
          thickness={0.35}
        />
      </mesh>

      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.46, 0.08, 24, 64]} />
        <meshStandardMaterial color="#d6ae61" metalness={1} roughness={0.12} envMapIntensity={3} />
      </mesh>

      <pointLight color="#fff3cf" intensity={16} distance={5} position={[2.5, 2.5, 3]} />
      <pointLight color="#d9a84f" intensity={12} distance={4} position={[-2, 0, 2]} />
    </group>
  )
}

export function FloatingJewelryScene() {
  return (
    <div className="absolute inset-0 z-[1]" aria-hidden="true">
      <Canvas
        camera={{ fov: 34, position: [0, 0, 5.5] }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        shadows
      >
        <color attach="background" args={['#0d0d0c']} />
        <ambientLight intensity={0.35} color="#fff7e8" />
        <spotLight angle={0.45} castShadow intensity={90} penumbra={1} position={[3, 5, 4]} color="#ffe7b0" />
        <spotLight angle={0.6} intensity={70} penumbra={1} position={[-4, 1, 2]} color="#bd8b3b" />
        <Environment resolution={128}>
          <Lightformer color="#fff1c9" intensity={3} position={[4, 3, 2]} scale={[5, 2, 1]} />
          <Lightformer color="#9b6b2f" intensity={2} position={[-4, 0, 1]} scale={[3, 4, 1]} />
        </Environment>
        <JewelryModel />
        <Sparkles count={70} color="#e9c779" scale={[8, 5, 5]} size={1.5} speed={0.18} opacity={0.55} />
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.72} mipmapBlur />
          <DepthOfField bokehScale={2.2} focalLength={0.045} focusDistance={0.015} />
          <Vignette darkness={0.75} eskil={false} offset={0.25} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}