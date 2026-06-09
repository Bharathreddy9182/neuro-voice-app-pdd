import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { router } from "expo-router";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to Neuro Voice Companion
      </Text>

      <Text style={styles.subtitle}>
        AI Based Voice Assistant For Memory Support
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login" as any)}
      >
        <Text style={styles.buttonText}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 20,
    textAlign: "center",
    color: "#64748B",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2563EB",
    marginTop: 50,
    padding: 18,
    borderRadius: 16,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});