import { View, ActivityIndicator, StyleSheet } from "react-native"

interface LoadingSpinnerProps {
  size?: "small" | "large"
  color?: string
}

export function LoadingSpinner({ size = "small", color = "#059669" }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
})
