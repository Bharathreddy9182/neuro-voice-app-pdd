import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import API from "../src/services/api";

type RegisterMode = "patient" | "caretaker";

export default function RegisterScreen() {
  const [mode, setMode] = useState<RegisterMode>("patient");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [relationship, setRelationship] = useState("caretaker");

  const handleRegister = async () => {
    try {
      const endpoint = mode === "patient" ? "/register" : "/caretaker/register";
      const payload =
        mode === "patient"
          ? {
              full_name: fullName,
              phone,
              password,
              age,
            }
          : {
              full_name: fullName,
              phone,
              password,
              patient_phone: patientPhone,
              relationship,
            };

      const response = await API.post(endpoint, payload);

      if (response.data.success) {
        Alert.alert("Success", response.data.message || "Registration successful");
        router.replace("/login");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Registration failed"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="person-add" size={32} color="#FFFFFF" />
      </View>

      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subtitle}>Choose patient or caretaker setup.</Text>

      <View style={styles.segment}>
        <ModeButton label="Patient" active={mode === "patient"} onPress={() => setMode("patient")} />
        <ModeButton label="Caretaker" active={mode === "caretaker"} onPress={() => setMode("caretaker")} />
      </View>

      <TextInput
        placeholder={mode === "patient" ? "Patient full name" : "Caretaker full name"}
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder={mode === "patient" ? "Patient phone" : "Caretaker phone"}
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      {mode === "patient" ? (
        <TextInput
          placeholder="Age"
          keyboardType="numeric"
          style={styles.input}
          value={age}
          onChangeText={setAge}
        />
      ) : (
        <>
          <TextInput
            placeholder="Patient phone to link"
            keyboardType="phone-pad"
            style={styles.input}
            value={patientPhone}
            onChangeText={setPatientPhone}
          />
          <TextInput
            placeholder="Relationship, e.g. son, nurse, caretaker"
            style={styles.input}
            value={relationship}
            onChangeText={setRelationship}
          />
        </>
      )}

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          Register {mode === "patient" ? "Patient" : "Caretaker"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Already have an account?</Text>
      </TouchableOpacity>
    </ScrollView>
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
    flexGrow: 1,
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

  heading: {
    color: "#0F172A",
    fontSize: 30,
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
    padding: 16,
  },

  button: {
    backgroundColor: "#2563EB",
    borderRadius: 15,
    marginTop: 4,
    padding: 18,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  loginText: {
    color: "#2563EB",
    fontWeight: "800",
    marginTop: 20,
    textAlign: "center",
  },
});
