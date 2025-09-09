"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { PatientCard } from "./PatientCard"
import { Search, Filter, Plus } from "../ui/Icons"
import { providerApi, type PatientData } from "../../services/providerApi"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0ea5e9",
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
  },
  filterButton: {
    marginLeft: 16,
  },
  filterButtonActive: {
    backgroundColor: "#0ea5e9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#64748b",
  },
  patientList: {
    flex: 1,
  },
})

export function PatientList() {
  const [patients, setPatients] = useState<PatientData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await providerApi.getMyPatients({
          search: searchQuery || undefined,
          page: 1,
          limit: 50,
        })
        setPatients(response.patients)
      } catch (error) {
        console.error("Failed to fetch patients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [searchQuery])

  const filteredPatients = patients.filter((patient) =>
    `${patient.profile.firstName} ${patient.profile.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Patients ({patients.length})</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Patient</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? "#0ea5e9" : "#64748b"} />
        </TouchableOpacity>
      </View>

      {/* Patient List */}
      <ScrollView style={styles.patientList} showsVerticalScrollIndicator={false}>
        {filteredPatients.map((patient) => (
          <PatientCard key={patient._id} patient={patient} />
        ))}
      </ScrollView>
    </View>
  )
}
