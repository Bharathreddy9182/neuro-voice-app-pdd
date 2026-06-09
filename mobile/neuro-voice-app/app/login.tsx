import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import API from "../src/services/api";

type LoginMode = "patient" | "caretaker";

export default function LoginScreen() {
  const [mode, setMode] = useState<LoginMode>("patient");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Validation", "Phone and password are required.");
      return;
    }

    try {
      const endpoint = mode === "patient" ? "/login" : "/caretaker/login";

      const response = await API.post(endpoint, {
        phone,
        password,
      });

      if (response.data.success) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        await AsyncStorage.setItem("role", mode);

        if (response.data.caretaker) {
          await AsyncStorage.setItem(
            "caretaker",
            JSON.stringify(response.data.caretaker)
          );
        } else {
          await AsyncStorage.removeItem("caretaker");
        }

        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="sparkles" size={34} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>Neuro Voice</Text>
      <Text style={styles.subtitle}>
        Patient and caretaker access for daily care support.
      </Text>

      <View style={styles.segment}>
        <ModeButton label="Patient" active={mode === "patient"} onPress={() => setMode("patient")} />
        <ModeButton label="Caretaker" active={mode === "caretaker"} onPress={() => setMode("caretaker")} />
      </View>

      <TextInput
        placeholder={mode === "patient" ? "Patient phone" : "Caretaker phone"}
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          Login as {mode === "patient" ? "Patient" : "Caretaker"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.register}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.segmentButton, active && styles.activeSegment]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.activeSegmentText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  logoCircle: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#2563EB",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    marginBottom: 18,
    width: 68,
  },

  title: {
    color: "#0F172A",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#64748B",
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 8,
    textAlign: "center",
  },

  segment: {
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    flexDirection: "row",
    marginBottom: 18,
    padding: 4,
  },

  segmentButton: {
    alignItems: "center",
    borderRadius: 13,
    flex: 1,
    paddingVertical: 11,
  },

  activeSegment: {
    backgroundColor: "#FFFFFF",
  },

  segmentText: {
    color: "#64748B",
    fontWeight: "800",
  },

  activeSegmentText: {
    color: "#2563EB",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
  },

  button: {
    backgroundColor: "#2563EB",
    borderRadius: 15,
    padding: 18,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  register: {
    color: "#2563EB",
    fontWeight: "800",
    marginTop: 20,
    textAlign: "center",
  },
});
