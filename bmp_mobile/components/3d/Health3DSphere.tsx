"use client"

import { useRef } from "react"
import { View, StyleSheet } from "react-native"
import { Canvas, useFrame } from "@react-three/fiber/native"
import { Sphere, Text } from "@react-three/drei/native"
import * as THREE from "three"

interface HealthData {
  exercise: number
  diet: number
  weight: number
  bloodPressure: number
}

interface Health3DSphereProps {
  healthData: HealthData
  overallScore: number
  width?: number
  height?: number
}

function HealthVisualization({ healthData, overallScore }: { healthData: HealthData; overallScore: number }) {
  const mainSphereRef = useRef<THREE.Mesh>(null)
  const orbitGroupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (mainSphereRef.current) {
      mainSphereRef.current.rotation.y = state.clock.elapsedTime * 0.2
      mainSphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  const getHealthColor = (score: number) => {
    if (score >= 80) return "#059669"
    if (score >= 60) return "#d97706"
    return "#dc2626"
  }

  const mainColor = getHealthColor(overallScore)
  const sphereScale = 0.6 + (overallScore / 100) * 0.6

  const healthMetrics = [
    { name: "Exercise", value: healthData.exercise, color: "#2563eb", position: [2, 0, 0] },
    { name: "Diet", value: healthData.diet, color: "#d97706", position: [0, 2, 0] },
    { name: "Weight", value: healthData.weight, color: "#7c3aed", position: [-2, 0, 0] },
    { name: "BP", value: healthData.bloodPressure, color: "#dc2626", position: [0, -2, 0] },
  ]

  return (
    <group>
      {/* Main Health Sphere */}
      <Sphere ref={mainSphereRef} args={[sphereScale]} position={[0, 0, 0]}>
        <meshStandardMaterial color={mainColor} transparent opacity={0.7} roughness={0.3} metalness={0.2} />
      </Sphere>

      {/* Orbiting Health Metrics */}
      <group ref={orbitGroupRef}>
        {healthMetrics.map((metric, index) => (
          <group key={metric.name}>
            <Sphere args={[0.15 + (metric.value / 100) * 0.1]} position={metric.position as [number, number, number]}>
              <meshStandardMaterial color={metric.color} />
            </Sphere>
            <Text
              position={[metric.position[0], metric.position[1] - 0.4, metric.position[2]]}
              fontSize={0.12}
              color={metric.color}
              anchorX="center"
              anchorY="middle"
            >
              {metric.name}
            </Text>
            <Text
              position={[metric.position[0], metric.position[1] - 0.6, metric.position[2]]}
              fontSize={0.1}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {metric.value}%
            </Text>
          </group>
        ))}
      </group>

      {/* Connecting Lines */}
      {healthMetrics.map((metric, index) => (
        <mesh key={`line-${index}`}>
          <cylinderGeometry args={[0.01, 0.01, 2]} />
          <meshStandardMaterial color={metric.color} transparent opacity={0.3} />
          <primitive
            object={new THREE.Object3D()}
            position={[metric.position[0] / 2, metric.position[1] / 2, metric.position[2] / 2]}
            rotation={[metric.position[1] !== 0 ? Math.PI / 2 : 0, metric.position[0] !== 0 ? Math.PI / 2 : 0, 0]}
          />
        </mesh>
      ))}

      {/* Overall Score */}
      <Text position={[0, 0, 0]} fontSize={0.25} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        {overallScore}
      </Text>

      {/* Floating Health Particles */}
      {Array.from({ length: Math.floor(overallScore / 5) }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.02]}
          position={[
            Math.cos((i / 20) * Math.PI * 4) * 3,
            Math.sin((i / 15) * Math.PI * 2) * 1.5,
            Math.sin((i / 20) * Math.PI * 4) * 3,
          ]}
        >
          <meshStandardMaterial color={mainColor} transparent opacity={0.6} />
        </Sphere>
      ))}
    </group>
  )
}

export function Health3DSphere({ healthData, overallScore, width = 300, height = 250 }: Health3DSphereProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, 10]} intensity={0.3} color="#059669" />
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={0.1} />
        <HealthVisualization healthData={healthData} overallScore={overallScore} />
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
