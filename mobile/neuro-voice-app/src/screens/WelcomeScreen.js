import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { router } from "expo-router";
import Colors from "../constants/Colors";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome
      </Text>

      <Text style={styles.description}>
        AI Voice Assistant for Memory Support
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
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
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },

  description: {
    textAlign: "center",
    marginTop: 15,
    color: "#666",
    fontSize: 16,
  },

  button: {
    marginTop: 40,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 15,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});