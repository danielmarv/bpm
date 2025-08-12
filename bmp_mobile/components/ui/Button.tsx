import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface ButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
}

export function PrimaryButton({ title, onPress, style, textStyle, disabled }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.buttonContainer, style]} activeOpacity={0.8}>
      <LinearGradient colors={disabled ? ["#94a3b8", "#94a3b8"] : ["#059669", "#10b981"]} style={styles.primaryButton}>
        <Text style={[styles.primaryButtonText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export function SecondaryButton({ title, onPress, style, textStyle, disabled }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.secondaryButton, style]} activeOpacity={0.8}>
      <Text style={[styles.secondaryButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#ffffff",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#059669",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#059669",
  },
})
