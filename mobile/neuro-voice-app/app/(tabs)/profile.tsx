import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import API from "../../src/services/api";

type Profile = {
  full_name: string;
  phone: string;
  age: number;
  memories: number;
  reminders: number;
  medications: number;
  contacts: number;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setRefreshing(true);

      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData || "{}");

      if (!user.id) return;

      const response = await API.get(`/profile/${user.id}`);
      setProfile(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "End this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadProfile} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={42} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>{profile?.full_name || "Patient"}</Text>
        <Text style={styles.sub}>Neuro Voice Companion profile</Text>
      </View>

      <View style={styles.infoCard}>
        <InfoRow icon="call-outline" label="Phone" value={profile?.phone || "-"} />
        <InfoRow icon="calendar-outline" label="Age" value={`${profile?.age || "-"}`} />
      </View>

      <View style={styles.carePlan}>
        <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
        <View style={styles.careCopy}>
          <Text style={styles.careTitle}>Care Model</Text>
          <Text style={styles.careText}>
            This app is designed for shared support: patient, caretaker,
            family, and doctor can keep routines, medicines, memories, and
            contacts organized.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Companion Data</Text>

      <View style={styles.statsGrid}>
        <StatCard icon="book" label="Memories" value={profile?.memories || 0} color="#7C3AED" />
        <StatCard icon="calendar" label="Reminders" value={profile?.reminders || 0} color="#2563EB" />
        <StatCard icon="medical" label="Medicines" value={profile?.medications || 0} color="#DC2626" />
        <StatCard icon="people" label="Care Team" value={profile?.contacts || 0} color="#16A34A" />
      </View>

      <View style={styles.checklist}>
        <Text style={styles.checklistTitle}>Setup Checklist</Text>
        <ChecklistItem done={(profile?.contacts || 0) > 0} text="Add at least one caretaker" />
        <ChecklistItem done={(profile?.medications || 0) > 0} text="Add daily medicines" />
        <ChecklistItem done={(profile?.reminders || 0) > 0} text="Add important reminders" />
        <ChecklistItem done={(profile?.memories || 0) > 0} text="Save identity and routine memories" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#2563EB" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ChecklistItem({ done, text }: { done: boolean; text: string }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={done ? "#16A34A" : "#94A3B8"}
      />
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 34,
  },

  header: {
    alignItems: "center",
    backgroundColor: "#1D4ED8",
    borderRadius: 24,
    padding: 28,
  },

  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    width: 76,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },

  sub: {
    color: "#DBEAFE",
    marginTop: 6,
    textAlign: "center",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 16,
    padding: 16,
  },

  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 9,
  },

  infoText: {
    paddingLeft: 12,
  },

  infoLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  infoValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  carePlan: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    flexDirection: "row",
    marginTop: 16,
    padding: 16,
  },

  careCopy: {
    flex: 1,
    paddingLeft: 12,
  },

  careTitle: {
    color: "#1E3A8A",
    fontWeight: "800",
  },

  careText: {
    color: "#1E3A8A",
    lineHeight: 20,
    marginTop: 4,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 24,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },

  statCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    width: "48%",
  },

  statValue: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 8,
  },

  statLabel: {
    color: "#64748B",
    fontWeight: "700",
    marginTop: 4,
  },

  checklist: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 16,
    padding: 18,
  },

  checklistTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },

  checkItem: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 8,
  },

  checkText: {
    color: "#334155",
    fontWeight: "600",
    marginLeft: 10,
  },

  logoutBtn: {
    alignItems: "center",
    backgroundColor: "#DC2626",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    padding: 16,
  },

  logoutText: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginLeft: 8,
  },
});
