import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
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

type Contact = {
  id: number;
  contact_name: string;
  relationship: string;
  phone: string;
};

const emptyForm = {
  contact_name: "",
  relationship: "",
  phone: "",
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setRefreshing(true);

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (!user.id) return;

      const response = await API.get(`/contacts/${user.id}`);
      setContacts(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setVisible(true);
  };

  const openEditModal = (item: Contact) => {
    setEditingId(item.id);
    setForm({
      contact_name: item.contact_name,
      relationship: item.relationship,
      phone: item.phone,
    });
    setVisible(true);
  };

  const saveContact = async () => {
    if (!form.contact_name.trim() || !form.relationship.trim() || !form.phone.trim()) {
      Alert.alert("Validation", "Name, relationship, and phone are required.");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (editingId) {
        await API.put(`/contacts/${editingId}`, form);
      } else {
        await API.post("/contacts", {
          user_id: user.id,
          ...form,
        });
      }

      setVisible(false);
      setEditingId(null);
      setForm(emptyForm);
      loadContacts();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to save contact.");
    }
  };

  const deleteContact = (item: Contact) => {
    Alert.alert(
      "Delete Care Contact",
      `Remove ${item.contact_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await API.delete(`/contacts/${item.id}`);
            loadContacts();
          },
        },
      ]
    );
  };

  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Support Network</Text>
          <Text style={styles.title}>Care Team</Text>
          <Text style={styles.subtitle}>
            Add caretakers, family, doctors, and emergency helpers.
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.caretakerNote}>
        <Ionicons name="people" size={22} color="#2563EB" />
        <Text style={styles.noteText}>
          Neuro patients often need a trusted caretaker. Keep at least one
          primary caregiver and one emergency contact here.
        </Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadContacts} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No care contacts"
            text="Add a caretaker or family contact so support is one tap away."
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.contact_name?.charAt(0)?.toUpperCase() || "C"}
              </Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={styles.nameBlock}>
                  <Text style={styles.name}>{item.contact_name}</Text>
                  <Text style={styles.relationship}>{item.relationship}</Text>
                </View>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>Primary</Text>
                  </View>
                )}
              </View>

              <Text style={styles.phone}>{item.phone}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => callContact(item.phone)}
                >
                  <Ionicons name="call" size={17} color="#FFFFFF" />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={19} color="#2563EB" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={() => deleteContact(item)}>
                  <Ionicons name="trash-outline" size={19} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Care Contact" : "Add Care Contact"}
            </Text>

            <TextInput
              placeholder="Name"
              style={styles.input}
              value={form.contact_name}
              onChangeText={(value) => setForm({ ...form, contact_name: value })}
            />
            <TextInput
              placeholder="Relationship, e.g. caretaker, son, doctor"
              style={styles.input}
              value={form.relationship}
              onChangeText={(value) => setForm({ ...form, relationship: value })}
            />
            <TextInput
              placeholder="Phone"
              keyboardType="phone-pad"
              style={styles.input}
              value={form.phone}
              onChangeText={(value) => setForm({ ...form, phone: value })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveContact}>
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
      <Ionicons name="people-outline" size={34} color="#94A3B8" />
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

  caretakerNote: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    flexDirection: "row",
    marginTop: 16,
    padding: 16,
  },

  noteText: {
    color: "#1E3A8A",
    flex: 1,
    fontWeight: "600",
    lineHeight: 20,
    marginLeft: 12,
  },

  listContent: {
    paddingBottom: 30,
    paddingTop: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    marginBottom: 14,
    padding: 16,
  },

  avatar: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  avatarText: {
    color: "#1D4ED8",
    fontSize: 20,
    fontWeight: "800",
  },

  cardBody: {
    flex: 1,
    paddingLeft: 14,
  },

  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nameBlock: {
    flex: 1,
    paddingRight: 10,
  },

  name: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  relationship: {
    color: "#64748B",
    marginTop: 3,
    textTransform: "capitalize",
  },

  primaryBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  primaryText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "800",
  },

  phone: {
    color: "#334155",
    fontWeight: "700",
    marginTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  callButton: {
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 14,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 11,
  },

  callText: {
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
