import React, { useEffect, useState } from "react";
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

type Memory = {
  id: number;
  memory_text: string;
  created_at: string;
};

export default function MemoriesScreen() {
  const [memoryText, setMemoryText] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setRefreshing(true);

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (!user.id) return;

      const response = await API.get(`/memories/${user.id}`);
      setMemories(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

const addMemory = async () => {
  if (!memoryText.trim()) {
    Alert.alert("Validation", "Please enter a memory.");
    return;
  }

  try {
    console.log("STEP 1");

    const userData = await AsyncStorage.getItem("user");
    const user = JSON.parse(userData || "{}");

    console.log("USER:", user);

    console.log("STEP 2");

const response = await fetch(
  "https://neurovoicecompanion-production.up.railway.app/memories",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.id,
      memory_text: memoryText.trim(),
    }),
  }
);

const data = await response.json();

console.log("FETCH DATA:", data);

    console.log("STEP 3 - POST SUCCESS");
    // console.log("RESPONSE:", response.data);

    setMemoryText("");

    console.log("STEP 4 - BEFORE LOAD");

    await loadMemories();

    console.log("STEP 5 - LOAD SUCCESS");

    Alert.alert("Success", "Memory saved successfully.");
  } catch (error: any) {
  console.log("MESSAGE:", error?.message);
  console.log("CODE:", error?.code);
  console.log("STATUS:", error?.response?.status);
  console.log("DATA:", error?.response?.data);
  console.log("REQUEST:", error?.request);

  Alert.alert(
    "Debug",
    JSON.stringify({
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
    })
  );
}
};

  const openEdit = (item: Memory) => {
    setEditingMemory(item);
    setEditText(item.memory_text);
  };

  const updateMemory = async () => {
    if (!editingMemory || !editText.trim()) return;

    try {
      await API.put(`/memories/${editingMemory.id}`, {
        memory_text: editText.trim(),
      });

      setEditingMemory(null);
      setEditText("");
      loadMemories();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to update memory.");
    }
  };

  const deleteMemory = (item: Memory) => {
    Alert.alert(
      "Delete Memory",
      "Remove this saved memory?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await API.delete(`/memories/${item.id}`);
            loadMemories();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Recall Support</Text>
        <Text style={styles.title}>Memory Journal</Text>
        <Text style={styles.subtitle}>
          Save facts, names, routines, and personal notes for the assistant.
        </Text>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Example: My neurologist is Dr. Rao."
          placeholderTextColor="#94A3B8"
          value={memoryText}
          onChangeText={setMemoryText}
          multiline
        />

        <TouchableOpacity style={styles.saveMemoryButton} onPress={addMemory}>
          <Ionicons name="save-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveMemoryText}>Save Memory</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadMemories} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No memories saved"
            text="Start with name, doctor, family, address, or daily routine."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.memoryIcon}>
                <Ionicons name="book" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.memoryText}>{item.memory_text}</Text>
            </View>

            <Text style={styles.dateText}>
              Saved {new Date(item.created_at).toLocaleString()}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={17} color="#2563EB" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMemory(item)}>
                <Ionicons name="trash-outline" size={17} color="#DC2626" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={Boolean(editingMemory)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Memory</Text>

            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingMemory(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateMemory}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={34} color="#94A3B8" />
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
    backgroundColor: "#1D4ED8",
    borderRadius: 24,
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
  },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 16,
    padding: 16,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    minHeight: 104,
    padding: 14,
    textAlignVertical: "top",
  },

  saveMemoryButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    padding: 14,
  },

  saveMemoryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginLeft: 8,
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
    flexDirection: "row",
  },

  memoryIcon: {
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  memoryText: {
    color: "#0F172A",
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 12,
  },

  dateText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 12,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  editButton: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 11,
  },

  editText: {
    color: "#2563EB",
    fontWeight: "800",
    marginLeft: 6,
  },

  deleteButton: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 11,
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "800",
    marginLeft: 6,
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

  editInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    minHeight: 120,
    padding: 15,
    textAlignVertical: "top",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
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
