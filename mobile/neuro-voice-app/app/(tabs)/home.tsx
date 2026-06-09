import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

type Reminder = {
  id: number;
  title: string;
  reminder_date?: string;
  reminder_time: string;
  priority?: string;
  status: string;
};

type Medication = {
  medicine_name: string;
  dosage: string;
  reminder_time: string;
};

type Dashboard = {
  total_reminders: number;
  pending_reminders: number;
  completed_reminders: number;
  total_memories: number;
  recent_memory: string;
  today_reminders: Reminder[];
  total_medications: number;
  pending_medications: number;
  recent_medications: Medication[];
  total_contacts: number;
  memory_health_score: number;
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState("patient");
  const [caretakerName, setCaretakerName] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const completionRate = useMemo(() => {
    const total = dashboard?.total_reminders || 0;

    if (!total) return 0;

    return Math.round(((dashboard?.completed_reminders || 0) / total) * 100);
  }, [dashboard]);

  const loadHomeData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const roleData = await AsyncStorage.getItem("role");
      const caretakerData = await AsyncStorage.getItem("caretaker");

      if (!userData) return;

      const user = JSON.parse(userData);
      setUserName(user.name || user.full_name || "User");
      setRole(roleData || "patient");

      if (caretakerData) {
        const caretaker = JSON.parse(caretakerData);
        setCaretakerName(caretaker.name || "");
      }

      const response = await API.get(`/dashboard/${user.id}`);
      setDashboard(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#2563EB" />
        <Text style={styles.loadingText}>Loading companion dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>{userName}</Text>
            {role === "caretaker" && (
              <Text style={styles.caretakerMode}>
                Managed by {caretakerName || "Caretaker"}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.voiceShortcut}
            onPress={() => router.push("/voice" as any)}
          >
            <Ionicons name="mic" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <Text style={styles.heroText}>
          Your free local companion is ready for reminders, memories,
          medicines, and emergency contacts.
        </Text>

        <View style={styles.scorePanel}>
          <View>
            <Text style={styles.scoreLabel}>Memory Health</Text>
            <Text style={styles.scoreValue}>
              {dashboard?.memory_health_score || 0}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${dashboard?.memory_health_score || 0}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard
          icon="calendar-clear"
          label="Pending Tasks"
          value={dashboard?.pending_reminders || 0}
          tint="#2563EB"
        />
        <MetricCard
          icon="people"
          label="Care Team"
          value={dashboard?.total_contacts || 0}
          tint="#16A34A"
        />
        <MetricCard
          icon="medical"
          label="Medicines"
          value={dashboard?.pending_medications || 0}
          tint="#DC2626"
        />
        <MetricCard
          icon="book"
          label="Memories"
          value={dashboard?.total_memories || 0}
          tint="#7C3AED"
        />
      </View>

      <View style={styles.assistantCard}>
        <View style={styles.assistantIcon}>
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
        </View>

        <View style={styles.assistantCopy}>
          <Text style={styles.assistantTitle}>Neuro Assistant</Text>
          <Text style={styles.assistantText}>
            Try: “summary”, “remember my doctor is Rao”, or
            “remind me take tablets tomorrow at 8 am”.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.assistantButton}
          onPress={() => router.push("/voice" as any)}
        >
          <Ionicons name="arrow-forward" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today</Text>
        <Text style={styles.sectionMeta}>{completionRate}% task completion</Text>
      </View>

      {dashboard?.today_reminders?.length ? (
        dashboard.today_reminders.map((item) => (
          <View key={item.id} style={styles.timelineCard}>
            <View style={styles.timePill}>
              <Text style={styles.timeText}>{item.reminder_time}</Text>
            </View>

            <View style={styles.timelineText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>
                {item.priority || "medium"} priority - {item.status}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <EmptyState
          icon="calendar-outline"
          title="No reminders today"
          text="Your day is clear. Add one from Reminders or ask the assistant."
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medicine Queue</Text>
        <TouchableOpacity onPress={() => router.push("/medications" as any)}>
          <Text style={styles.linkText}>View all</Text>
        </TouchableOpacity>
      </View>

      {dashboard?.recent_medications?.length ? (
        dashboard.recent_medications.map((item, index) => (
          <View key={`${item.medicine_name}-${index}`} style={styles.medCard}>
            <Ionicons name="medical" size={20} color="#DC2626" />
            <View style={styles.medText}>
              <Text style={styles.cardTitle}>{item.medicine_name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.dosage} at {item.reminder_time}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <EmptyState
          icon="medical-outline"
          title="No pending medicines"
          text="Medication reminders will appear here."
        />
      )}

      <View style={styles.quickGrid}>
        <QuickAction
          icon="add-circle"
          label="Reminder"
          onPress={() => router.push("/reminders" as any)}
        />
        <QuickAction
          icon="journal"
          label="Memory"
          onPress={() => router.push("/memories" as any)}
        />
        <QuickAction
          icon="call"
          label="Contacts"
          onPress={() => router.push("/contacts" as any)}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Memory</Text>
      <View style={styles.memoryCard}>
        <Text style={styles.memoryText}>
          {dashboard?.recent_memory || "No memories yet"}
        </Text>
      </View>
    </ScrollView>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#2563EB" />
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={24} color="#94A3B8" />
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    flex: 1,
    justifyContent: "center",
  },

  loadingText: {
    color: "#64748B",
    marginTop: 12,
  },

  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 34,
  },

  hero: {
    backgroundColor: "#1D4ED8",
    borderRadius: 24,
    padding: 22,
  },

  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  greeting: {
    color: "#BFDBFE",
    fontSize: 15,
    fontWeight: "600",
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 3,
  },

  caretakerMode: {
    color: "#DBEAFE",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  voiceShortcut: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  heroText: {
    color: "#DBEAFE",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },

  scorePanel: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    marginTop: 18,
    padding: 16,
  },

  scoreLabel: {
    color: "#DBEAFE",
    fontWeight: "600",
  },

  scoreValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },

  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    height: 9,
    marginTop: 12,
    overflow: "hidden",
  },

  progressFill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 9,
  },

  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },

  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    width: "48%",
  },

  metricIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    marginBottom: 12,
    width: 38,
  },

  metricValue: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "800",
  },

  metricLabel: {
    color: "#64748B",
    marginTop: 4,
  },

  assistantCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    marginTop: 18,
    padding: 16,
  },

  assistantIcon: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 17,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  assistantCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },

  assistantTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },

  assistantText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },

  assistantButton: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 28,
  },

  sectionMeta: {
    color: "#64748B",
    fontWeight: "600",
  },

  linkText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  timelineCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    marginTop: 12,
    padding: 16,
  },

  timePill: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    justifyContent: "center",
    minWidth: 66,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  timeText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  timelineText: {
    flex: 1,
    paddingLeft: 14,
  },

  cardTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },

  cardSubtitle: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 4,
  },

  medCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    marginTop: 12,
    padding: 16,
  },

  medText: {
    flex: 1,
    paddingLeft: 12,
  },

  quickGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  quickAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flex: 1,
    padding: 14,
  },

  quickLabel: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },

  memoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginTop: 12,
    padding: 18,
  },

  memoryText: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },

  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    marginTop: 12,
    padding: 16,
  },

  emptyCopy: {
    flex: 1,
    paddingLeft: 12,
  },

  emptyTitle: {
    color: "#0F172A",
    fontWeight: "800",
  },

  emptyText: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 3,
  },
});
