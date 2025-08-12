"use client"

import { useRef, useMemo } from "react"
import { View, StyleSheet } from "react-native"
import { Canvas, useFrame } from "@react-three/fiber/native"
import { Text, Sphere, Line } from "@react-three/drei/native"
import type * as THREE from "three"

interface BPReading {
  systolic: number
  diastolic: number
  timestamp: string
}

interface BP3DChartProps {
  readings: BPReading[]
  width?: number
  height?: number
}

function BPDataPoints({ readings }: { readings: BPReading[] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const points = useMemo(() => {
    return readings.map((reading, index) => {
      const x = (index - readings.length / 2) * 0.8
      const systolicY = (reading.systolic - 120) * 0.02
      const diastolicY = (reading.diastolic - 80) * 0.02

      return {
        x,
        systolicY,
        diastolicY,
        systolic: reading.systolic,
        diastolic: reading.diastolic,
      }
    })
  }, [readings])

  const systolicLine = useMemo<readonly [number, number, number][]>(() => {
    return points.map((point) => [point.x, point.systolicY, 0] as const)
  }, [points])

  const diastolicLine = useMemo<readonly [number, number, number][]>(() => {
    return points.map((point) => [point.x, point.diastolicY, -0.5] as const)
  }, [points])

  return (
    <group ref={groupRef}>
      {/* Systolic Points */}
      {points.map((point, index) => (
        <Sphere key={`systolic-${index}`} position={[point.x, point.systolicY, 0]} args={[0.08]}>
          <meshStandardMaterial color="#dc2626" />
        </Sphere>
      ))}

      {/* Diastolic Points */}
      {points.map((point, index) => (
        <Sphere key={`diastolic-${index}`} position={[point.x, point.diastolicY, -0.5]} args={[0.08]}>
          <meshStandardMaterial color="#2563eb" />
        </Sphere>
      ))}

      {/* Trend Lines */}
      <Line points={systolicLine} color="#dc2626" lineWidth={3} />
      <Line points={diastolicLine} color="#2563eb" lineWidth={3} />

      {/* Grid */}
      <gridHelper args={[4, 10]} position={[0, -1, -0.25]} />

      {/* Labels */}
      <Text position={[-2.5, 0.5, 0]} fontSize={0.15} color="#dc2626" anchorX="center" anchorY="middle">
        Systolic
      </Text>
      <Text position={[-2.5, 0.5, -0.5]} fontSize={0.15} color="#2563eb" anchorX="center" anchorY="middle">
        Diastolic
      </Text>
    </group>
  )
}

export function BP3DChart({ readings, width = 300, height = 200 }: BP3DChartProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <BPDataPoints readings={readings} />
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
