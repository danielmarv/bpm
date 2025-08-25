import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { useState } from "react"
import { User } from "../services/usersApi"

interface ProviderSelectorProps {
  providers: User[]
  selectedProviderId: string
  onProviderChange: (id: string) => void
}

export function ProviderSelector({
  providers,
  selectedProviderId,
  onProviderChange,
}: ProviderSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedProvider = providers.find((p) => p._id === selectedProviderId)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>To *</Text>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.selectorText}>
          {selectedProvider
            ? `${selectedProvider.profile?.firstName} ${selectedProvider.profile?.lastName}`
            : "Select Provider"}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <FlatList
            data={providers}
            keyExtractor={(item) => item._id!}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onProviderChange(item._id!)
                  setOpen(false)
                }}
              >
                <Text>{`${item.profile?.firstName} ${item.profile?.lastName}`}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 8, fontWeight: "600", color: "#1e293b" },
  selectorButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  selectorText: { color: "#1e293b" },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 999,
    elevation: 4,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
})
