"use client"

import { useRef } from "react"
import { View, StyleSheet } from "react-native"
import { Canvas, useFrame } from "@react-three/fiber/native"
import { Sphere, Text } from "@react-three/drei/native"
import type * as THREE from "three"

interface Medication3DSphereProps {
  adherenceRate: number
  medicationName: string
  width?: number
  height?: number
}

function AdherenceSphere({ adherenceRate, medicationName }: { adherenceRate: number; medicationName: string }) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  const getColor = (rate: number) => {
    if (rate >= 90) return "#059669"
    if (rate >= 75) return "#d97706"
    return "#dc2626"
  }

  const sphereColor = getColor(adherenceRate)
  const scale = 0.8 + (adherenceRate / 100) * 0.4

  return (
    <group>
      {/* Main Sphere */}
      <Sphere ref={sphereRef} args={[scale]} position={[0, 0, 0]}>
        <meshStandardMaterial color={sphereColor} transparent opacity={0.8} roughness={0.2} metalness={0.1} />
      </Sphere>

      {/* Adherence Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 8, 32, (adherenceRate / 100) * Math.PI * 2]} />
        <meshStandardMaterial color={sphereColor} />
      </mesh>

      {/* Floating Particles */}
      {Array.from({ length: Math.floor(adherenceRate / 10) }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.02]}
          position={[
            Math.cos((i / 10) * Math.PI * 2) * 1.5,
            Math.sin((i / 5) * Math.PI) * 0.3,
            Math.sin((i / 10) * Math.PI * 2) * 1.5,
          ]}
        >
          <meshStandardMaterial color={sphereColor} />
        </Sphere>
      ))}

      {/* Medication Name */}
      <Text position={[0, -1.8, 0]} fontSize={0.2} color="#1e293b" anchorX="center" anchorY="middle" maxWidth={3}>
        {medicationName}
      </Text>

      {/* Adherence Percentage */}
      <Text position={[0, 0, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        {adherenceRate}%
      </Text>
    </group>
  )
}

export function Medication3DSphere({
  adherenceRate,
  medicationName,
  width = 200,
  height = 200,
}: Medication3DSphereProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#7c3aed" />
        <AdherenceSphere adherenceRate={adherenceRate} medicationName={medicationName} />
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    overflow: "hidden",
  },
})
