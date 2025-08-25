import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { usersApi, User } from "../services/usersApi"

interface ProviderSelectorProps {
  selectedProviderId: string
  onProviderChange: (providerId: string) => void
}

export function ProviderSelector({ selectedProviderId, onProviderChange }: ProviderSelectorProps) {
  const [providers, setProviders] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [dropdownVisible, setDropdownVisible] = useState(false)

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true)
      try {
        const data = await usersApi.getAllUsers({
          role: "provider",
          search,
          limit: 20,
        })
        setProviders(data)
      } catch (error) {
        console.error("Error fetching providers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [search])

  const selectedProvider = providers.find((p) => p._id === selectedProviderId)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Provider *</Text>

      <TextInput
        style={styles.input}
        placeholder="Search providers..."
        placeholderTextColor="#94a3b8"
        value={selectedProvider ? `${selectedProvider.profile?.firstName} ${selectedProvider.profile?.lastName}` : search}
        onFocus={() => setDropdownVisible(true)}
        onChangeText={(value) => {
          setSearch(value)
          onProviderChange("") // clear selection when searching
        }}
      />

      {dropdownVisible && (
        <View style={styles.dropdown}>
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : providers.length === 0 ? (
            <Text style={styles.noResults}>No providers found</Text>
          ) : (
            <FlatList
              data={providers}
              keyExtractor={(item) => item._id || Math.random().toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onProviderChange(item._id || "")
                    setDropdownVisible(false)
                    setSearch(`${item.profile?.firstName || ""} ${item.profile?.lastName || ""}`)
                  }}
                >
                  <Text style={styles.itemText}>
                    {item.profile?.firstName} {item.profile?.lastName} ({item.email})
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxHeight: 200,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemText: {
    fontSize: 15,
    fontFamily: "OpenSans-Regular",
    color: "#1e293b",
  },
  noResults: {
    padding: 12,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
})
