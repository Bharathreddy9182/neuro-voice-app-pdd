import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import API from "../../src/services/api";
// import { syncCareNotifications } from "../../src/services/notifications";

type Medication = {
  id: number;
  medicine_name: string;
  dosage: string;
  reminder_time: string;
  status: "pending" | "completed" | string;
};

const emptyForm = {
  medicine_name: "",
  dosage: "",
  reminder_time: "",
  status: "pending",
};

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const pendingCount = useMemo(
    () => medications.filter((item) => item.status !== "completed").length,
    [medications]
  );

  const takenCount = medications.length - pendingCount;

  const loadMedications = async () => {
    try {
      setRefreshing(true);

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (!user.id) return;

      const response = await API.get(`/medications/${user.id}`);
      setMedications(response.data);
      // syncCareNotifications({ medications: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEditModal = (item: Medication) => {
    setEditingId(item.id);
    setForm({
      medicine_name: item.medicine_name,
      dosage: item.dosage,
      reminder_time: item.reminder_time,
      status: item.status || "pending",
    });
    setModalVisible(true);
  };

  const saveMedication = async () => {
    if (!form.medicine_name.trim() || !form.dosage.trim() || !form.reminder_time.trim()) {
      Alert.alert("Validation", "Medicine name, dosage, and time are required.");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (editingId) {
        await API.put(`/medications/${editingId}`, form);
      } else {
        await API.post("/medications", {
          user_id: user.id,
          medicine_name: form.medicine_name,
          dosage: form.dosage,
          reminder_time: form.reminder_time,
        });
      }

      setModalVisible(false);
      setForm(emptyForm);
      setEditingId(null);
      loadMedications();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to save medication.");
    }
  };

  const markTaken = async (item: Medication) => {
    try {
      await API.patch(`/medications/${item.id}/complete`);
      loadMedications();
    } catch (error) {
      console.log(error);
    }
  };

  const markPending = async (item: Medication) => {
    try {
      await API.patch(`/medications/${item.id}/pending`);
      loadMedications();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMedication = (item: Medication) => {
    Alert.alert(
      "Delete Medication",
      `Remove ${item.medicine_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await API.delete(`/medications/${item.id}`);
            loadMedications();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Daily Care</Text>
          <Text style={styles.title}>Medications</Text>
          <Text style={styles.subtitle}>Track doses with caregiver-friendly controls.</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Pending" value={pendingCount} color="#DC2626" />
        <SummaryCard label="Taken" value={takenCount} color="#16A34A" />
        <SummaryCard label="Total" value={medications.length} color="#2563EB" />
      </View>

      <FlatList
        data={medications}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadMedications} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No medicines added"
            text="Add medicines so the patient and caretaker can track doses."
          />
        }
        renderItem={({ item }) => {
          const completed = item.status === "completed";

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.medIcon}>
                  <Ionicons name="medical" size={22} color="#DC2626" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.medName}>{item.medicine_name}</Text>
                  <Text style={styles.detailText}>{item.dosage}</Text>
                </View>
                <View style={[styles.statusBadge, completed && styles.takenBadge]}>
                  <Text style={[styles.statusText, completed && styles.takenText]}>
                    {completed ? "Taken" : "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={18} color="#64748B" />
                <Text style={styles.timeText}>{item.reminder_time}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.primaryAction, completed && styles.secondaryAction]}
                  onPress={() => (completed ? markPending(item) : markTaken(item))}
                >
                  <Ionicons
                    name={completed ? "refresh" : "checkmark"}
                    size={17}
                    color={completed ? "#2563EB" : "#FFFFFF"}
                  />
                  <Text style={[styles.primaryActionText, completed && styles.secondaryActionText]}>
                    {completed ? "Set Pending" : "Mark Taken"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={19} color="#2563EB" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={() => deleteMedication(item)}>
                  <Ionicons name="trash-outline" size={19} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Medication" : "Add Medication"}
            </Text>

            <TextInput
              placeholder="Medicine name"
              style={styles.input}
              value={form.medicine_name}
              onChangeText={(value) => setForm({ ...form, medicine_name: value })}
            />
            <TextInput
              placeholder="Dosage, e.g. 1 tablet"
              style={styles.input}
              value={form.dosage}
              onChangeText={(value) => setForm({ ...form, dosage: value })}
            />
            <TextInput
              placeholder="Time, e.g. 08:00"
              style={styles.input}
              value={form.reminder_time}
              onChangeText={(value) => setForm({ ...form, reminder_time: value })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveMedication}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={34} color="#94A3B8" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
    padding: 20,
  },

  header: {
    alignItems: "center",
    backgroundColor: "#1D4ED8",
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 22,
  },

  eyebrow: {
    color: "#BFDBFE",
    fontWeight: "700",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },

  subtitle: {
    color: "#DBEAFE",
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 250,
  },

  headerButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  summaryCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flex: 1,
    padding: 14,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  listContent: {
    paddingBottom: 30,
    paddingTop: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 14,
    padding: 16,
  },

  cardTop: {
    alignItems: "center",
    flexDirection: "row",
  },

  medIcon: {
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  cardText: {
    flex: 1,
    paddingHorizontal: 12,
  },

  medName: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  detailText: {
    color: "#64748B",
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  takenBadge: {
    backgroundColor: "#DCFCE7",
  },

  statusText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "800",
  },

  takenText: {
    color: "#166534",
  },

  timeRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 14,
  },

  timeText: {
    color: "#334155",
    fontWeight: "700",
    marginLeft: 8,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  primaryAction: {
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 14,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 11,
  },

  secondaryAction: {
    backgroundColor: "#EFF6FF",
  },

  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginLeft: 6,
  },

  secondaryActionText: {
    color: "#2563EB",
  },

  iconAction: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    justifyContent: "center",
    width: 44,
  },

  modalOverlay: {
    backgroundColor: "rgba(15,23,42,0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
  },

  modalTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    marginBottom: 12,
    padding: 15,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  cancelButton: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    flex: 1,
    padding: 14,
  },

  cancelText: {
    color: "#334155",
    fontWeight: "800",
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 14,
    flex: 1,
    padding: 14,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 20,
    padding: 28,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyText: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
});
