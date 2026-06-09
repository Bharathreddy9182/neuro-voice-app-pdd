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
import { syncCareNotifications } from "../../src/services/notifications";

type Reminder = {
  id: number;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  priority: "high" | "medium" | "low" | string;
  status: "pending" | "completed" | string;
};

const emptyForm = {
  title: "",
  description: "",
  reminder_date: "",
  reminder_time: "",
  priority: "medium",
};

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const pendingCount = useMemo(
    () => reminders.filter((item) => item.status !== "completed").length,
    [reminders]
  );

  const completedCount = reminders.length - pendingCount;

  const loadReminders = async () => {
    try {
      setRefreshing(true);

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (!user.id) return;

      const response = await API.get(`/reminders/${user.id}`);
      setReminders(response.data);
      syncCareNotifications({ reminders: response.data });
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

  const openEditModal = (item: Reminder) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || "",
      reminder_date: item.reminder_date,
      reminder_time: item.reminder_time,
      priority: item.priority || "medium",
    });
    setModalVisible(true);
  };

  const saveReminder = async () => {
    if (!form.title.trim() || !form.reminder_date.trim() || !form.reminder_time.trim()) {
      Alert.alert("Validation", "Title, date, and time are required.");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (editingId) {
        await API.put(`/reminders/${editingId}`, form);
      } else {
        await API.post("/reminders", {
          user_id: user.id,
          ...form,
        });
      }

      setModalVisible(false);
      setEditingId(null);
      setForm(emptyForm);
      loadReminders();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to save reminder.");
    }
  };

  const markCompleted = async (item: Reminder) => {
    try {
      await API.patch(`/reminders/${item.id}/complete`);
      loadReminders();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteReminder = (item: Reminder) => {
    Alert.alert(
      "Delete Reminder",
      `Remove ${item.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await API.delete(`/reminders/${item.id}`);
            loadReminders();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Care Schedule</Text>
          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.subtitle}>Tasks that patient and caretaker can track together.</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Pending" value={pendingCount} color="#DC2626" />
        <SummaryCard label="Done" value={completedCount} color="#16A34A" />
        <SummaryCard label="Total" value={reminders.length} color="#2563EB" />
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadReminders} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No reminders yet"
            text="Add appointments, meals, exercise, calls, or care tasks."
          />
        }
        renderItem={({ item }) => {
          const completed = item.status === "completed";
          const priorityStyle =
            item.priority === "high"
              ? styles.highPriority
              : item.priority === "low"
                ? styles.lowPriority
                : styles.mediumPriority;

          return (
            <View style={[styles.card, completed && styles.completedCard]}>
              <View style={styles.cardTop}>
                <View style={[styles.priorityDot, priorityStyle]} />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {!!item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, completed && styles.doneBadge]}>
                  <Text style={[styles.statusText, completed && styles.doneText]}>
                    {completed ? "Done" : item.priority}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={17} color="#64748B" />
                <Text style={styles.metaText}>{item.reminder_date}</Text>
                <Ionicons name="time-outline" size={17} color="#64748B" />
                <Text style={styles.metaText}>{item.reminder_time}</Text>
              </View>

              <View style={styles.actionRow}>
                {!completed && (
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => markCompleted(item)}
                  >
                    <Ionicons name="checkmark" size={17} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Complete</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.iconAction} onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={19} color="#2563EB" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={() => deleteReminder(item)}>
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
              {editingId ? "Edit Reminder" : "Add Reminder"}
            </Text>

            <TextInput
              placeholder="Title"
              style={styles.input}
              value={form.title}
              onChangeText={(value) => setForm({ ...form, title: value })}
            />
            <TextInput
              placeholder="Description"
              style={styles.input}
              value={form.description}
              onChangeText={(value) => setForm({ ...form, description: value })}
            />
            <TextInput
              placeholder="Date, e.g. 2026-06-10"
              style={styles.input}
              value={form.reminder_date}
              onChangeText={(value) => setForm({ ...form, reminder_date: value })}
            />
            <TextInput
              placeholder="Time, e.g. 08:30"
              style={styles.input}
              value={form.reminder_time}
              onChangeText={(value) => setForm({ ...form, reminder_time: value })}
            />

            <View style={styles.priorityRow}>
              {["high", "medium", "low"].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityChip,
                    form.priority === priority && styles.activePriorityChip,
                  ]}
                  onPress={() => setForm({ ...form, priority })}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      form.priority === priority && styles.activePriorityText,
                    ]}
                  >
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveReminder}>
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
      <Ionicons name="calendar-outline" size={34} color="#94A3B8" />
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

  completedCard: {
    opacity: 0.76,
  },

  cardTop: {
    flexDirection: "row",
  },

  priorityDot: {
    borderRadius: 6,
    height: 12,
    marginTop: 5,
    width: 12,
  },

  highPriority: {
    backgroundColor: "#DC2626",
  },

  mediumPriority: {
    backgroundColor: "#F59E0B",
  },

  lowPriority: {
    backgroundColor: "#16A34A",
  },

  cardText: {
    flex: 1,
    paddingHorizontal: 12,
  },

  cardTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  description: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 5,
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  doneBadge: {
    backgroundColor: "#DCFCE7",
  },

  statusText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  doneText: {
    color: "#166534",
  },

  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 14,
  },

  metaText: {
    color: "#334155",
    fontWeight: "700",
    marginRight: 8,
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

  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginLeft: 6,
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

  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },

  priorityChip: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  activePriorityChip: {
    backgroundColor: "#2563EB",
  },

  priorityChipText: {
    color: "#334155",
    fontWeight: "800",
    textTransform: "capitalize",
  },

  activePriorityText: {
    color: "#FFFFFF",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
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
